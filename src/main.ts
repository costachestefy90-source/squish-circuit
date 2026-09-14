import { DEFAULT_SETTINGS, PRESETS, SHAPE_LABELS, SoftBodyEngine } from './physics';
import type { Obstacle, PhysicsSettings, PresetId, SoftBody, SoftBodyShape } from './physics';

function must<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
}

const canvas = must<HTMLCanvasElement>('physics-canvas');
const stageWrap = must<HTMLDivElement>('stage-wrap');
const context = canvas.getContext('2d');
if (!context) throw new Error('Canvas 2D is not available');
const ctx = context;

const engine = new SoftBodyEngine(920, 560);
let selectedBodyId: number | null = engine.bodies[0]?.id ?? null;
let selectedShape: SoftBodyShape = 'cube';
let draggedBody: SoftBody | undefined;
let showGuides = false;
let lastFrame = performance.now();
let lastListRender = 0;
let elapsedSeconds = 0;
let fps = 60;

const sceneKicker = must<HTMLSpanElement>('scene-kicker');
const sceneDescription = must<HTMLSpanElement>('scene-description');
const selectedShapeNote = must<HTMLSpanElement>('selected-shape-note');
const simStatus = must<HTMLSpanElement>('sim-status');
const pauseButton = must<HTMLButtonElement>('pause-button');
const exportButton = must<HTMLButtonElement>('export-button');
const pausedBadge = must<HTMLDivElement>('paused-badge');
const objectList = must<HTMLDivElement>('object-list');
const emptyInspector = must<HTMLDivElement>('inspector-empty');
const selectedInspector = must<HTMLDivElement>('selected-inspector');
const selectedSwatch = must<HTMLSpanElement>('selected-swatch');
const selectedName = must<HTMLHeadingElement>('selected-name');
const selectedType = must<HTMLElement>('selected-type');
const selectedSize = must<HTMLElement>('selected-size');
const selectedState = must<HTMLElement>('selected-state');
const selectedBounce = must<HTMLElement>('selected-bounce');
const selectedCopy = must<HTMLParagraphElement>('selected-copy');
const memoryMeter = must<HTMLElement>('memory-meter');
const memoryReadout = must<HTMLElement>('memory-readout');
const energyReadout = must<HTMLElement>('energy-readout');
const objectReadout = must<HTMLElement>('object-readout');
const fpsReadout = must<HTMLElement>('fps-readout');
const clockReadout = must<HTMLElement>('clock-readout');
const resolutionReadout = must<HTMLElement>('resolution-readout');
const stageHint = must<HTMLElement>('stage-hint');

const sliderOutputs: Record<string, HTMLOutputElement> = {
  softness: must<HTMLOutputElement>('softness-output'),
  pressure: must<HTMLOutputElement>('pressure-output'),
  springStrength: must<HTMLOutputElement>('spring-output'),
  damping: must<HTMLOutputElement>('damping-output'),
  gravity: must<HTMLOutputElement>('gravity-output'),
  friction: must<HTMLOutputElement>('friction-output'),
  restitution: must<HTMLOutputElement>('restitution-output'),
};

const sliderInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="range"][data-setting]'));

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatSetting(setting: keyof PhysicsSettings, value: number): string {
  if (setting === 'gravity') return `${value.toFixed(1)}G`;
  return `${Math.round(value * 100)}%`;
}

function sliderValueFor(setting: keyof PhysicsSettings, value: number): number {
  if (setting === 'gravity') return Math.round((value / 2) * 100);
  return Math.round(value * 100);
}

function syncControls(): void {
  for (const input of sliderInputs) {
    const setting = input.dataset.setting as keyof PhysicsSettings;
    const value = engine.settings[setting];
    if (typeof value !== 'number') continue;
    const sliderValue = sliderValueFor(setting, value);
    input.value = String(sliderValue);
    input.style.setProperty('--value', `${sliderValue}%`);
    const output = sliderOutputs[setting];
    if (output) output.value = formatSetting(setting, value);
  }
}

function setSelectedBody(id: number | null): void {
  selectedBodyId = id;
  renderObjectList();
  updateInspector();
}

function selectedBody(): SoftBody | undefined {
  return engine.bodies.find((body) => body.id === selectedBodyId);
}

function updatePresetButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
    button.classList.toggle('active', button.dataset.preset === engine.currentPreset.id);
  });
}

function updateSceneLabels(): void {
  sceneKicker.textContent = engine.currentPreset.kicker;
  sceneDescription.textContent = engine.currentPreset.description;
  updatePresetButtons();
}

function loadPreset(id: PresetId): void {
  engine.loadPreset(id);
  selectedBodyId = engine.bodies[0]?.id ?? null;
  syncControls();
  updateSceneLabels();
  renderObjectList();
  updateInspector();
  updatePauseState();
}

function updatePauseState(): void {
  const paused = engine.paused;
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.title = paused ? 'Resume simulation (Space)' : 'Pause simulation (Space)';
  pauseButton.querySelector('.sr-only')!.textContent = paused ? 'Resume simulation' : 'Pause simulation';
  pausedBadge.hidden = !paused;
  simStatus.textContent = paused ? 'SIMULATION PAUSED' : 'SIMULATION ONLINE';
  stageWrap.classList.toggle('is-paused', paused);
}

function renderObjectList(): void {
  if (engine.bodies.length === 0) {
    objectList.innerHTML = '<div class="empty-list">No bodies in the field.<br /><span>Spawn one from the control deck.</span></div>';
    return;
  }
  objectList.innerHTML = engine.bodies
    .map((body, index) => {
      const state = engine.getBodyState(body);
      const selected = body.id === selectedBodyId;
      return `<button class="object-row${selected ? ' selected' : ''}" type="button" data-body-id="${body.id}" aria-pressed="${selected}" style="--object-color: ${body.color}; --object-glow: ${body.glow}">
        <span class="object-index">${String(index + 1).padStart(2, '0')}</span>
        <span class="object-color" aria-hidden="true"></span>
        <span class="object-meta"><strong>${body.label}</strong><small>${body.shape.toUpperCase()} · ${state}</small></span>
        <span class="object-arrow" aria-hidden="true">↗</span>
      </button>`;
    })
    .join('');
  objectList.querySelectorAll<HTMLButtonElement>('[data-body-id]').forEach((button) => {
    button.addEventListener('click', () => setSelectedBody(Number(button.dataset.bodyId)));
  });
}

function updateInspector(): void {
  const body = selectedBody();
  if (!body) {
    emptyInspector.hidden = false;
    selectedInspector.hidden = true;
    stageHint.textContent = 'tap a body to inspect';
    return;
  }
  emptyInspector.hidden = true;
  selectedInspector.hidden = false;
  stageHint.textContent = body.dragging ? 'release to launch' : 'drag to throw';
  selectedSwatch.style.background = body.color;
  selectedSwatch.style.boxShadow = `0 0 24px ${body.glow}`;
  selectedName.textContent = body.label;
  selectedType.textContent = body.shape.toUpperCase();
  selectedSize.textContent = `${Math.round(body.radius * 2)} PX`;
  selectedState.textContent = engine.getBodyState(body);
  selectedBounce.textContent = `${Math.round(engine.settings.restitution * 100)}%`;
  const memory = clamp(100 - engine.settings.softness * 64 + engine.settings.springStrength * 18, 8, 100);
  memoryMeter.style.width = `${memory}%`;
  memoryReadout.textContent = `${Math.round(memory)}%`;
  const copyByShape: Record<SoftBodyShape, string> = {
    cube: 'Rounded edges and a stubborn little center. A good reference body for stacking and impact.',
    blob: 'A loose membrane with uneven rhythm. Throw it into a wall and watch the rebound travel around the ring.',
    pillow: 'Wide, low-pressure mass. It yields quickly, then uses its area memory to recover.',
    orb: 'The clean baseline: an even ring with just enough give to show the solver breathing.',
  };
  selectedCopy.textContent = copyByShape[body.shape];
}

function resizeCanvas(): void {
  const bounds = stageWrap.getBoundingClientRect();
  const width = Math.max(320, bounds.width);
  const height = Math.max(360, bounds.height);
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * devicePixelRatio);
  canvas.height = Math.floor(height * devicePixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  engine.setWorldSize(width, height);
  resolutionReadout.textContent = `${Math.round(width)}×${Math.round(height)}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean, 16);
  const r = Math.round(((value >> 16) & 255) * amount);
  const g = Math.round(((value >> 8) & 255) * amount);
  const b = Math.round((value & 255) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }): { x: number; y: number } {
  return { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
}

function drawHull(body: SoftBody): void {
  const points = body.points;
  const firstMid = midpoint(points[points.length - 1], points[0]);
  ctx.beginPath();
  ctx.moveTo(firstMid.x, firstMid.y);
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const nextMid = midpoint(current, next);
    ctx.quadraticCurveTo(current.x, current.y, nextMid.x, nextMid.y);
  }
  ctx.closePath();
}

function drawGrid(width: number, height: number): void {
  const grid = 48;
  ctx.save();
  ctx.lineWidth = 1;
  for (let x = grid; x < width; x += grid) {
    ctx.strokeStyle = x % (grid * 4) === 0 ? 'rgba(186, 199, 239, .1)' : 'rgba(186, 199, 239, .045)';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = grid; y < height; y += grid) {
    ctx.strokeStyle = y % (grid * 4) === 0 ? 'rgba(186, 199, 239, .1)' : 'rgba(186, 199, 239, .045)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.setLineDash([2, 7]);
  ctx.strokeStyle = 'rgba(139, 242, 210, .14)';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.82);
  ctx.lineTo(width, height * 0.82);
  ctx.stroke();
  ctx.restore();
}

function drawCornerMarks(width: number, height: number): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(222, 231, 255, .38)';
  ctx.lineWidth = 1;
  const inset = 18;
  const size = 13;
  const corners: Array<[number, number, number, number]> = [
    [inset, inset, 1, 1],
    [width - inset, inset, -1, 1],
    [inset, height - inset, 1, -1],
    [width - inset, height - inset, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * size, y);
    ctx.stroke();
  }
  ctx.restore();
}

function obstacleColor(obstacle: Obstacle): string {
  if (obstacle.tone === 'lilac') return '#b895f1';
  if (obstacle.tone === 'orange') return '#f1ad68';
  return '#6bdab9';
}

function drawObstacle(obstacle: Obstacle): void {
  const color = obstacleColor(obstacle);
  ctx.save();
  ctx.shadowColor = hexToRgba(color, 0.2);
  ctx.shadowBlur = 16;
  ctx.fillStyle = hexToRgba(color, 0.11);
  ctx.strokeStyle = hexToRgba(color, 0.56);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h, Math.min(7, obstacle.h * 0.4));
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba(color, 0.2);
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(obstacle.x + 8, obstacle.y + obstacle.h * 0.5);
  ctx.lineTo(obstacle.x + obstacle.w - 8, obstacle.y + obstacle.h * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = hexToRgba(color, 0.7);
  ctx.font = '700 8px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.letterSpacing = '1px';
  ctx.fillText(obstacle.label, obstacle.x + 4, obstacle.y - 7);
  ctx.restore();
}

function drawBody(body: SoftBody): void {
  const center = engine.getBodyCenter(body);
  drawHull(body);
  const gradient = ctx.createRadialGradient(center.x - body.radius * 0.32, center.y - body.radius * 0.42, 2, center.x, center.y, body.radius * 1.35);
  gradient.addColorStop(0, body.accent);
  gradient.addColorStop(0.28, body.color);
  gradient.addColorStop(1, darken(body.color, 0.58));
  ctx.save();
  ctx.shadowColor = body.glow;
  ctx.shadowBlur = body.dragging ? 28 : 18;
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = body.id === selectedBodyId ? 'rgba(248, 251, 255, .9)' : hexToRgba(body.accent, 0.46);
  ctx.lineWidth = body.id === selectedBodyId ? 2 : 1.2;
  ctx.stroke();

  if (showGuides) {
    ctx.strokeStyle = hexToRgba(body.accent, 0.36);
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    for (const spring of body.springs) {
      const a = body.points[spring.a];
      const b = body.points[spring.b];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  const highlight = body.points[body.points.length - 3];
  ctx.fillStyle = hexToRgba(body.accent, 0.52);
  ctx.beginPath();
  ctx.ellipse(highlight.x - body.radius * 0.07, highlight.y - body.radius * 0.04, Math.max(3, body.radius * 0.12), Math.max(2, body.radius * 0.055), -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba('#ffffff', 0.2);
  ctx.beginPath();
  ctx.arc(center.x - body.radius * 0.22, center.y - body.radius * 0.2, Math.max(2, body.radius * 0.035), 0, Math.PI * 2);
  ctx.fill();
  if (body.id === selectedBodyId) {
    ctx.strokeStyle = hexToRgba(body.accent, 0.33);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, body.radius * 1.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawScene(): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  ctx.clearRect(0, 0, width, height);
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#10172b');
  background.addColorStop(0.56, '#131b35');
  background.addColorStop(1, '#0b1123');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  const mintGlow = ctx.createRadialGradient(width * 0.78, height * 0.2, 0, width * 0.78, height * 0.2, width * 0.45);
  mintGlow.addColorStop(0, 'rgba(81, 226, 183, .12)');
  mintGlow.addColorStop(1, 'rgba(81, 226, 183, 0)');
  ctx.fillStyle = mintGlow;
  ctx.fillRect(0, 0, width, height);
  drawGrid(width, height);
  drawCornerMarks(width, height);
  for (const obstacle of engine.obstacles) drawObstacle(obstacle);
  for (const body of engine.bodies) drawBody(body);
  ctx.save();
  ctx.fillStyle = 'rgba(222, 232, 255, .35)';
  ctx.font = '700 8px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('CONTACT FIELD // ACTIVE', 22, height - 29);
  ctx.fillStyle = 'rgba(222, 232, 255, .22)';
  ctx.fillText(`PASS 04 · ${engine.bodies.length} RINGS`, width - 108, height - 29);
  ctx.restore();
}

function pointerPosition(event: PointerEvent): { x: number; y: number } {
  const bounds = canvas.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}

function spawnSelectedShape(): void {
  const body = engine.spawn(selectedShape, engine.width * (0.26 + ((engine.bodies.length * 17) % 54) / 100), engine.height * 0.12);
  for (const point of body.points) {
    point.oldX = point.x - 1.4;
    point.oldY = point.y + 0.6;
  }
  setSelectedBody(body.id);
}

document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
  button.addEventListener('click', () => loadPreset(button.dataset.preset as PresetId));
});

document.querySelectorAll<HTMLButtonElement>('[data-shape]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedShape = button.dataset.shape as SoftBodyShape;
    document.querySelectorAll<HTMLButtonElement>('[data-shape]').forEach((candidate) => candidate.classList.toggle('active', candidate === button));
    selectedShapeNote.textContent = SHAPE_LABELS[selectedShape].toUpperCase();
  });
});

must<HTMLButtonElement>('spawn-button').addEventListener('click', spawnSelectedShape);
exportButton.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `squish-circuit-${engine.currentPreset.id}.png`;
    link.href = url;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
});
must<HTMLButtonElement>('reset-button').addEventListener('click', () => loadPreset(engine.currentPreset.id));
must<HTMLButtonElement>('remove-button').addEventListener('click', () => {
  if (selectedBodyId === null) return;
  engine.removeBody(selectedBodyId);
  setSelectedBody(engine.bodies[0]?.id ?? null);
});
must<HTMLButtonElement>('defaults-button').addEventListener('click', () => {
  engine.settings = { ...DEFAULT_SETTINGS };
  syncControls();
  updateInspector();
});
pauseButton.addEventListener('click', () => {
  engine.paused = !engine.paused;
  updatePauseState();
});
const guidesToggle = must<HTMLInputElement>('guides-toggle');
guidesToggle.addEventListener('change', (event) => {
  showGuides = (event.target as HTMLInputElement).checked;
});

for (const input of sliderInputs) {
  input.addEventListener('input', () => {
    const setting = input.dataset.setting as keyof PhysicsSettings;
    const rawValue = Number(input.value) / 100;
    engine.settings[setting] = setting === 'gravity' ? rawValue * 2 : rawValue;
    input.style.setProperty('--value', `${input.value}%`);
    const output = sliderOutputs[setting];
    if (output) output.value = formatSetting(setting, engine.settings[setting]);
    updateInspector();
  });
}

canvas.addEventListener('pointerdown', (event) => {
  const pointer = pointerPosition(event);
  const body = engine.hitTest(pointer.x, pointer.y);
  if (!body) {
    setSelectedBody(null);
    return;
  }
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  draggedBody = body;
  setSelectedBody(body.id);
  engine.beginDrag(body, pointer.x, pointer.y);
  stageWrap.classList.add('is-dragging');
});

canvas.addEventListener('pointermove', (event) => {
  if (!draggedBody) return;
  event.preventDefault();
  const pointer = pointerPosition(event);
  engine.dragTo(draggedBody, pointer.x, pointer.y);
  updateInspector();
});

function releasePointer(event: PointerEvent): void {
  if (!draggedBody) return;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  engine.endDrag(draggedBody);
  draggedBody = undefined;
  stageWrap.classList.remove('is-dragging');
  updateInspector();
}

canvas.addEventListener('pointerup', releasePointer);
canvas.addEventListener('pointercancel', releasePointer);

window.addEventListener('keydown', (event) => {
  const target = event.target as HTMLElement | null;
  if (target?.matches('input, textarea, select, button')) return;
  if (event.code === 'Space') {
    event.preventDefault();
    engine.paused = !engine.paused;
    updatePauseState();
  } else if (event.key.toLowerCase() === 'r') {
    loadPreset(engine.currentPreset.id);
  } else if (event.key.toLowerCase() === 'b') {
    spawnSelectedShape();
  } else if (event.key.toLowerCase() === 'g') {
    guidesToggle.checked = !guidesToggle.checked;
    showGuides = guidesToggle.checked;
  } else if (/^[1-7]$/.test(event.key)) {
    loadPreset(PRESETS[Number(event.key) - 1].id);
  }
});

new ResizeObserver(resizeCanvas).observe(stageWrap);
resizeCanvas();
syncControls();
updateSceneLabels();
renderObjectList();
updateInspector();
updatePauseState();

function formatClock(seconds: number): string {
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  return [hours, minutes, secs].map((value) => String(value).padStart(2, '0')).join(':');
}

function tick(now: number): void {
  const delta = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
  lastFrame = now;
  elapsedSeconds += delta;
  fps = fps * 0.92 + (1 / delta) * 0.08;
  engine.step(delta);
  drawScene();
  energyReadout.textContent = engine.getEnergy().toFixed(2);
  objectReadout.textContent = String(engine.bodies.length).padStart(2, '0');
  fpsReadout.textContent = String(Math.round(clamp(fps, 0, 99)));
  clockReadout.textContent = formatClock(elapsedSeconds);
  if (now - lastListRender > 420) {
    renderObjectList();
    updateInspector();
    lastListRender = now;
  }
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
