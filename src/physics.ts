export type SoftBodyShape = 'cube' | 'blob' | 'pillow' | 'orb' | 'capsule';
export type PresetId =
  | 'jelly'
  | 'blobs'
  | 'low-gravity'
  | 'heavy-gravity'
  | 'obstacle-course'
  | 'squish-test'
  | 'slow-motion'
  | 'wind-tunnel'
  | 'orbit-lab';

export interface PhysicsSettings {
  softness: number;
  pressure: number;
  damping: number;
  gravity: number;
  friction: number;
  restitution: number;
  springStrength: number;
  timeScale: number;
  wind: number;
  vortex: number;
}

export interface BodySeed {
  shape: SoftBodyShape;
  x: number;
  y: number;
  size: number;
  rotation?: number;
}

export interface ObstacleSeed {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone?: 'mint' | 'lilac' | 'orange';
}

export interface PresetDefinition {
  id: PresetId;
  name: string;
  kicker: string;
  description: string;
  settings: Partial<PhysicsSettings>;
  bodies: BodySeed[];
  obstacles: ObstacleSeed[];
}

export interface Particle {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

export interface SpringLink {
  a: number;
  b: number;
  rest: number;
  weight: number;
}

export interface SoftBody {
  id: number;
  shape: SoftBodyShape;
  label: string;
  color: string;
  accent: string;
  glow: string;
  points: Particle[];
  springs: SpringLink[];
  restArea: number;
  restRadius: number;
  radius: number;
  phase: number;
  dragging: boolean;
  frozen: boolean;
  dragVelocity: { x: number; y: number };
  __dragX?: number;
  __dragY?: number;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone: 'mint' | 'lilac' | 'orange';
}

const TAU = Math.PI * 2;

export const DEFAULT_SETTINGS: PhysicsSettings = {
  softness: 0.42,
  pressure: 0.68,
  damping: 0.84,
  gravity: 1,
  friction: 0.72,
  restitution: 0.46,
  springStrength: 0.56,
  timeScale: 1,
  wind: 0,
  vortex: 0,
};

export const PALETTE = [
  { color: '#70e7c2', accent: '#dcfff3', glow: 'rgba(112, 231, 194, .34)' },
  { color: '#c29af5', accent: '#f5eaff', glow: 'rgba(194, 154, 245, .34)' },
  { color: '#f7b268', accent: '#fff0d5', glow: 'rgba(247, 178, 104, .32)' },
  { color: '#79b7ff', accent: '#e4f2ff', glow: 'rgba(121, 183, 255, .3)' },
  { color: '#f07daf', accent: '#ffe4f0', glow: 'rgba(240, 125, 175, .3)' },
];

export const SHAPE_LABELS: Record<SoftBodyShape, string> = {
  cube: 'Jelly cube',
  blob: 'Bouncing blob',
  pillow: 'Pillow mass',
  orb: 'Soft orb',
  capsule: 'Soft capsule',
};

export const PRESETS: PresetDefinition[] = [
  {
    id: 'jelly',
    name: 'Jelly cubes',
    kicker: 'SCENE / JELLY CUBES',
    description: 'A calm stack for tuning shape memory and soft landings.',
    settings: { softness: 0.42, pressure: 0.68, gravity: 1, restitution: 0.46, timeScale: 1 },
    bodies: [
      { shape: 'cube', x: 0.32, y: 0.2, size: 0.095, rotation: -0.05 },
      { shape: 'cube', x: 0.51, y: 0.14, size: 0.095, rotation: 0.08 },
      { shape: 'cube', x: 0.69, y: 0.23, size: 0.095, rotation: -0.12 },
    ],
    obstacles: [
      { x: 0.07, y: 0.82, w: 0.86, h: 0.035, label: 'REST DECK', tone: 'mint' },
      { x: 0.3, y: 0.66, w: 0.4, h: 0.025, label: 'STACK PLATE', tone: 'lilac' },
    ],
  },
  {
    id: 'blobs',
    name: 'Bouncing blobs',
    kicker: 'SCENE / BOUNCING BLOBS',
    description: 'A lively drop test with extra rebound and room to collide.',
    settings: { softness: 0.62, pressure: 0.78, gravity: 1.08, restitution: 0.82, friction: 0.46, timeScale: 1 },
    bodies: [
      { shape: 'blob', x: 0.2, y: 0.2, size: 0.08 },
      { shape: 'blob', x: 0.39, y: 0.14, size: 0.075 },
      { shape: 'blob', x: 0.59, y: 0.24, size: 0.09 },
      { shape: 'blob', x: 0.8, y: 0.13, size: 0.07 },
    ],
    obstacles: [{ x: 0.07, y: 0.82, w: 0.86, h: 0.035, label: 'BOUNCE DECK', tone: 'orange' }],
  },
  {
    id: 'low-gravity',
    name: 'Low gravity',
    kicker: 'SCENE / LOW GRAVITY',
    description: 'Float the soft matter through a quiet field and watch the drift.',
    settings: { softness: 0.72, pressure: 0.88, gravity: 0.18, restitution: 0.7, friction: 0.38, timeScale: 1 },
    bodies: [
      { shape: 'pillow', x: 0.22, y: 0.34, size: 0.09, rotation: 0.16 },
      { shape: 'orb', x: 0.48, y: 0.2, size: 0.075 },
      { shape: 'blob', x: 0.76, y: 0.4, size: 0.085 },
    ],
    obstacles: [
      { x: 0.07, y: 0.82, w: 0.86, h: 0.035, label: 'FLOAT FLOOR', tone: 'lilac' },
      { x: 0.08, y: 0.2, w: 0.025, h: 0.42, label: 'FIELD WALL', tone: 'mint' },
    ],
  },
  {
    id: 'heavy-gravity',
    name: 'Heavy gravity',
    kicker: 'SCENE / HEAVY GRAVITY',
    description: 'A dense impact study where material and damping do the talking.',
    settings: { softness: 0.28, pressure: 0.55, gravity: 1.72, restitution: 0.28, friction: 0.83, damping: 0.7, timeScale: 1 },
    bodies: [
      { shape: 'cube', x: 0.27, y: 0.12, size: 0.1 },
      { shape: 'pillow', x: 0.5, y: 0.1, size: 0.095, rotation: 0.25 },
      { shape: 'orb', x: 0.74, y: 0.13, size: 0.09 },
    ],
    obstacles: [
      { x: 0.07, y: 0.82, w: 0.86, h: 0.04, label: 'IMPACT PLATE', tone: 'orange' },
      { x: 0.36, y: 0.61, w: 0.28, h: 0.03, label: 'LOAD CELL', tone: 'lilac' },
    ],
  },
  {
    id: 'obstacle-course',
    name: 'Obstacle course',
    kicker: 'SCENE / OBSTACLE COURSE',
    description: 'Thread a soft orb through the gates, then throw it back uphill.',
    settings: { softness: 0.5, pressure: 0.7, gravity: 0.94, restitution: 0.62, friction: 0.6, timeScale: 1 },
    bodies: [
      { shape: 'orb', x: 0.16, y: 0.14, size: 0.072 },
      { shape: 'blob', x: 0.34, y: 0.1, size: 0.066 },
      { shape: 'pillow', x: 0.77, y: 0.12, size: 0.08, rotation: -0.2 },
    ],
    obstacles: [
      { x: 0.07, y: 0.82, w: 0.86, h: 0.035, label: 'START DECK', tone: 'mint' },
      { x: 0.2, y: 0.61, w: 0.24, h: 0.028, label: 'GATE A', tone: 'lilac' },
      { x: 0.55, y: 0.48, w: 0.3, h: 0.028, label: 'GATE B', tone: 'orange' },
      { x: 0.4, y: 0.26, w: 0.025, h: 0.23, label: 'POST', tone: 'mint' },
    ],
  },
  {
    id: 'squish-test',
    name: 'Squish test',
    kicker: 'SCENE / SQUISH TEST',
    description: 'A compression rig for comparing recovery, pressure, and spring tone.',
    settings: { softness: 0.78, pressure: 0.92, gravity: 0.86, restitution: 0.22, friction: 0.75, springStrength: 0.42, timeScale: 1 },
    bodies: [
      { shape: 'pillow', x: 0.29, y: 0.34, size: 0.105, rotation: 0 },
      { shape: 'cube', x: 0.51, y: 0.27, size: 0.095, rotation: 0.07 },
      { shape: 'blob', x: 0.73, y: 0.35, size: 0.085 },
    ],
    obstacles: [
      { x: 0.07, y: 0.82, w: 0.86, h: 0.035, label: 'COMPRESSION BED', tone: 'lilac' },
      { x: 0.11, y: 0.33, w: 0.035, h: 0.3, label: 'LEFT RAM', tone: 'orange' },
      { x: 0.86, y: 0.33, w: 0.035, h: 0.3, label: 'RIGHT RAM', tone: 'orange' },
    ],
  },
  {
    id: 'slow-motion',
    name: 'Slow motion',
    kicker: 'SCENE / SLOW MOTION',
    description: 'Time dilated to 22% so every wobble and impact has room to breathe.',
    settings: { softness: 0.55, pressure: 0.74, gravity: 1.12, restitution: 0.7, friction: 0.58, timeScale: 0.22 },
    bodies: [
      { shape: 'blob', x: 0.28, y: 0.16, size: 0.08 },
      { shape: 'cube', x: 0.52, y: 0.13, size: 0.09, rotation: 0.16 },
      { shape: 'orb', x: 0.75, y: 0.19, size: 0.075 },
    ],
    obstacles: [{ x: 0.07, y: 0.82, w: 0.86, h: 0.035, label: 'TIME DECK', tone: 'mint' }],
  },
  {
    id: 'wind-tunnel',
    name: 'Wind tunnel',
    kicker: 'SCENE / WIND TUNNEL',
    description: 'A cross-current obstacle study for steering soft matter through vanes.',
    settings: { softness: 0.56, pressure: 0.76, gravity: 0.62, wind: 0.74, restitution: 0.58, friction: 0.42, timeScale: 1 },
    bodies: [
      { shape: 'orb', x: 0.16, y: 0.22, size: 0.072 },
      { shape: 'capsule', x: 0.38, y: 0.14, size: 0.09, rotation: 0.12 },
      { shape: 'blob', x: 0.62, y: 0.3, size: 0.078 },
      { shape: 'capsule', x: 0.83, y: 0.18, size: 0.07, rotation: -0.18 },
    ],
    obstacles: [
      { x: 0.07, y: 0.82, w: 0.86, h: 0.035, label: 'WIND DECK', tone: 'mint' },
      { x: 0.27, y: 0.56, w: 0.025, h: 0.18, label: 'VANE A', tone: 'lilac' },
      { x: 0.55, y: 0.3, w: 0.025, h: 0.22, label: 'VANE B', tone: 'orange' },
      { x: 0.75, y: 0.59, w: 0.025, h: 0.15, label: 'VANE C', tone: 'mint' },
    ],
  },
  {
    id: 'orbit-lab',
    name: 'Orbit lab',
    kicker: 'SCENE / ORBIT LAB',
    description: 'A slow-turning vortex for studying drift, lift, and soft-body orbit lines.',
    settings: { softness: 0.64, pressure: 0.82, gravity: 0.16, vortex: 0.82, restitution: 0.5, friction: 0.38, timeScale: 1 },
    bodies: [
      { shape: 'orb', x: 0.19, y: 0.22, size: 0.068 },
      { shape: 'capsule', x: 0.39, y: 0.15, size: 0.086, rotation: 0.18 },
      { shape: 'blob', x: 0.66, y: 0.2, size: 0.078 },
      { shape: 'pillow', x: 0.78, y: 0.43, size: 0.073, rotation: -0.2 },
    ],
    obstacles: [
      { x: 0.07, y: 0.82, w: 0.86, h: 0.035, label: 'ORBIT DECK', tone: 'lilac' },
      { x: 0.47, y: 0.43, w: 0.06, h: 0.035, label: 'CORE', tone: 'orange' },
    ],
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function distance(a: Particle, b: Particle): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function shapeProfile(shape: SoftBodyShape, angle: number, phase: number): number {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  if (shape === 'cube') return 0.82 / Math.max(Math.abs(c), Math.abs(s));
  if (shape === 'pillow') {
    const superellipse = Math.pow(Math.pow(Math.abs(c), 3.8) + Math.pow(Math.abs(s), 3.8), 1 / 3.8);
    return 0.88 / Math.max(superellipse, 0.01);
  }
  if (shape === 'capsule') {
    const ellipse = Math.sqrt((c * c) / (1.16 * 1.16) + (s * s) / (0.72 * 0.72));
    return 0.88 / Math.max(ellipse, 0.01) + Math.sin(angle * 2 + phase) * 0.018;
  }
  if (shape === 'blob') return 1 + Math.sin(angle * 3 + phase) * 0.1 + Math.sin(angle * 5 - phase) * 0.055;
  return 1 + Math.sin(angle * 2 + phase) * 0.025;
}

function polygonArea(points: Particle[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const next = points[(i + 1) % points.length];
    sum += points[i].x * next.y - next.x * points[i].y;
  }
  return Math.abs(sum) * 0.5;
}

function bodyCenter(body: SoftBody): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const point of body.points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / body.points.length, y: y / body.points.length };
}

function pointInPolygon(x: number, y: number, body: SoftBody): boolean {
  let inside = false;
  for (let i = 0, j = body.points.length - 1; i < body.points.length; j = i++) {
    const a = body.points[i];
    const b = body.points[j];
    const intersects = a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export class SoftBodyEngine {
  width: number;
  height: number;
  settings: PhysicsSettings = { ...DEFAULT_SETTINGS };
  bodies: SoftBody[] = [];
  obstacles: Obstacle[] = [];
  currentPreset: PresetDefinition = PRESETS[0];
  paused = false;

  private nextId = 1;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.loadPreset('jelly');
  }

  setWorldSize(width: number, height: number): void {
    if (width <= 0 || height <= 0 || this.width <= 0 || this.height <= 0) return;
    const scaleX = width / this.width;
    const scaleY = height / this.height;
    const uniformScale = Math.min(scaleX, scaleY);
    for (const body of this.bodies) {
      for (const point of body.points) {
        point.x *= scaleX;
        point.oldX *= scaleX;
        point.y *= scaleY;
        point.oldY *= scaleY;
      }
      body.radius *= uniformScale;
      body.restRadius *= uniformScale;
      body.restArea *= uniformScale * uniformScale;
      for (const spring of body.springs) spring.rest *= uniformScale;
    }
    for (const obstacle of this.obstacles) {
      obstacle.x *= scaleX;
      obstacle.w *= scaleX;
      obstacle.y *= scaleY;
      obstacle.h *= scaleY;
    }
    this.width = width;
    this.height = height;
  }

  loadPreset(id: PresetId): void {
    const preset = PRESETS.find((candidate) => candidate.id === id) ?? PRESETS[0];
    this.currentPreset = preset;
    this.settings = { ...DEFAULT_SETTINGS, ...preset.settings };
    this.paused = false;
    this.nextId = 1;
    this.bodies = preset.bodies.map((seed, index) => this.createBody(seed, index));
    this.obstacles = preset.obstacles.map((seed) => ({
      x: seed.x * this.width,
      y: seed.y * this.height,
      w: seed.w * this.width,
      h: seed.h * this.height,
      label: seed.label,
      tone: seed.tone ?? 'mint',
    }));
  }

  reset(): void {
    this.loadPreset(this.currentPreset.id);
  }

  clear(): void {
    this.bodies = [];
  }

  pulse(x = this.width * 0.5, y = this.height * 0.43, strength = 1): void {
    const maxDistance = Math.hypot(this.width, this.height) * 0.58;
    for (const body of this.bodies) {
      if (body.frozen || body.dragging) continue;
      const center = bodyCenter(body);
      let dx = center.x - x;
      let dy = center.y - y;
      const distanceFromCore = Math.hypot(dx, dy);
      if (distanceFromCore < 0.001) {
        dx = 1;
        dy = 0;
      }
      const influence = clamp(1 - distanceFromCore / maxDistance, 0, 1);
      if (influence <= 0) continue;
      const impulse = (18 + strength * 44) * influence;
      const velocity = this.getBodyVelocity(body);
      const velocityX = velocity.x + (dx / Math.hypot(dx, dy)) * impulse;
      const velocityY = velocity.y + (dy / Math.hypot(dx, dy)) * impulse;
      for (const point of body.points) {
        point.oldX = point.x - velocityX / 60;
        point.oldY = point.y - velocityY / 60;
      }
    }
  }

  setFrozen(body: SoftBody, frozen = !body.frozen): void {
    body.frozen = frozen;
    body.dragVelocity = { x: 0, y: 0 };
    for (const point of body.points) {
      point.oldX = point.x;
      point.oldY = point.y;
    }
  }

  spawn(shape: SoftBodyShape, x = this.width * 0.5, y = this.height * 0.16): SoftBody {
    const size = 0.07 + ((this.nextId * 13) % 17) / 260;
    const seed: BodySeed = {
      shape,
      x: clamp(x / this.width, 0.12, 0.88),
      y: clamp(y / this.height, 0.08, 0.65),
      size,
      rotation: ((this.nextId * 29) % 100) / 100 - 0.5,
    };
    const body = this.createBody(seed, this.bodies.length);
    this.bodies.push(body);
    return body;
  }

  duplicate(body: SoftBody): SoftBody {
    const center = bodyCenter(body);
    const direction = center.x < this.width * 0.68 ? 1 : -1;
    const offsetX = center.x + direction * body.radius * 1.75;
    const offsetY = center.y - body.radius * 0.55;
    const firstPoint = body.points[0];
    const rotation = Math.atan2(firstPoint.y - center.y, firstPoint.x - center.x);
    const clone = this.createBody(
      {
        shape: body.shape,
        x: clamp(offsetX / this.width, 0.12, 0.88),
        y: clamp(offsetY / this.height, 0.08, 0.65),
        size: body.restRadius / Math.min(this.width, this.height),
        rotation,
      },
      this.bodies.length,
    );
    const velocity = this.getBodyVelocity(body);
    for (const point of clone.points) {
      point.oldX = point.x - velocity.x / 60;
      point.oldY = point.y - velocity.y / 60;
    }
    clone.frozen = body.frozen;
    this.bodies.push(clone);
    return clone;
  }

  removeBody(id: number): void {
    this.bodies = this.bodies.filter((body) => body.id !== id);
  }

  hitTest(x: number, y: number): SoftBody | undefined {
    for (let index = this.bodies.length - 1; index >= 0; index -= 1) {
      const body = this.bodies[index];
      const center = bodyCenter(body);
      if (Math.hypot(center.x - x, center.y - y) < body.radius * 1.3 && pointInPolygon(x, y, body)) return body;
    }
    return undefined;
  }

  beginDrag(body: SoftBody, x: number, y: number): void {
    body.dragging = true;
    body.dragVelocity = { x: 0, y: 0 };
    body.__dragX = x;
    body.__dragY = y;
  }

  dragTo(body: SoftBody, x: number, y: number): void {
    const lastX = body.__dragX ?? x;
    const lastY = body.__dragY ?? y;
    const dx = x - lastX;
    const dy = y - lastY;
    body.__dragX = x;
    body.__dragY = y;
    body.dragVelocity.x = body.dragVelocity.x * 0.62 + dx * 0.38;
    body.dragVelocity.y = body.dragVelocity.y * 0.62 + dy * 0.38;
    for (const point of body.points) {
      point.x += dx;
      point.y += dy;
      point.oldX += dx;
      point.oldY += dy;
    }
  }

  endDrag(body: SoftBody): void {
    body.dragging = false;
    for (const point of body.points) {
      point.oldX = body.frozen ? point.x : point.x - body.dragVelocity.x * 1.8;
      point.oldY = body.frozen ? point.y : point.y - body.dragVelocity.y * 1.8;
    }
    body.__dragX = undefined;
    body.__dragY = undefined;
  }

  step(deltaSeconds: number): void {
    if (this.paused || this.bodies.length === 0) return;
    const seconds = clamp(deltaSeconds, 0.008, 0.032) * this.settings.timeScale;
    if (seconds <= 0) return;
    const damping = 0.88 + this.settings.damping * 0.115;
    const acceleration = 980 * this.settings.gravity;
    const windAcceleration = 900 * this.settings.wind;
    const vortexStrength = 2.1 * this.settings.vortex;
    const vortexCenterX = this.width * 0.5;
    const vortexCenterY = this.height * 0.43;

    for (const body of this.bodies) {
      if (body.dragging || body.frozen) continue;
      for (const point of body.points) {
        const velocityX = (point.x - point.oldX) * damping;
        const velocityY = (point.y - point.oldY) * damping;
        const offsetX = point.x - vortexCenterX;
        const offsetY = point.y - vortexCenterY;
        const vortexX = -offsetY * vortexStrength;
        const vortexY = offsetX * vortexStrength;
        point.oldX = point.x;
        point.oldY = point.y;
        point.x += velocityX + (windAcceleration + vortexX) * seconds * seconds;
        point.y += velocityY + (acceleration + vortexY) * seconds * seconds;
      }
    }

    for (let pass = 0; pass < 4; pass += 1) {
      for (const body of this.bodies) {
        if (!body.frozen || body.dragging) this.solveSprings(body);
      }
      for (const body of this.bodies) {
        if (!body.frozen || body.dragging) this.solveArea(body);
      }
      for (const body of this.bodies) {
        if (body.frozen && !body.dragging) continue;
        this.solveBounds(body);
        this.solveObstacles(body);
      }
      this.solveBodyCollisions();
    }
  }

  getEnergy(): number {
    let energy = 0;
    for (const body of this.bodies) {
      for (const point of body.points) {
        const vx = point.x - point.oldX;
        const vy = point.y - point.oldY;
        energy += vx * vx + vy * vy;
      }
    }
    return Math.min(99.99, energy / 1300);
  }

  getBodyState(body: SoftBody): 'DRAGGING' | 'FROZEN' | 'AIRBORNE' | 'RESTING' {
    if (body.dragging) return 'DRAGGING';
    if (body.frozen) return 'FROZEN';
    const center = bodyCenter(body);
    const nearSurface = center.y + body.radius > this.height - 42;
    let velocity = 0;
    for (const point of body.points) velocity += Math.hypot(point.x - point.oldX, point.y - point.oldY);
    if (nearSurface && velocity < body.points.length * 0.8) return 'RESTING';
    return 'AIRBORNE';
  }

  getBodyCenter(body: SoftBody): { x: number; y: number } {
    return bodyCenter(body);
  }

  getBodyArea(body: SoftBody): number {
    return polygonArea(body.points);
  }

  getBodySpeed(body: SoftBody): number {
    const velocity = this.getBodyVelocity(body);
    return Math.hypot(velocity.x, velocity.y);
  }

  getBodyVelocity(body: SoftBody): { x: number; y: number } {
    let x = 0;
    let y = 0;
    for (const point of body.points) {
      x += point.x - point.oldX;
      y += point.y - point.oldY;
    }
    return { x: (x / body.points.length) * 60, y: (y / body.points.length) * 60 };
  }

  getBodyCompression(body: SoftBody): number {
    if (body.restArea <= 0) return 0;
    return clamp(1 - polygonArea(body.points) / body.restArea, -1, 1);
  }

  getBodySpringLoad(body: SoftBody): number {
    if (body.springs.length === 0) return 0;
    let load = 0;
    for (const spring of body.springs) {
      const a = body.points[spring.a];
      const b = body.points[spring.b];
      const rest = Math.max(spring.rest, 0.001);
      load += (Math.abs(distance(a, b) - rest) / rest) * spring.weight;
    }
    return clamp((load / body.springs.length) * 100, 0, 999);
  }

  private createBody(seed: BodySeed, paletteIndex: number): SoftBody {
    const phase = (paletteIndex + 1) * 0.9;
    const pointCount = seed.shape === 'pillow' || seed.shape === 'capsule' ? 14 : 12;
    const radius = seed.size * Math.min(this.width, this.height);
    const centerX = seed.x * this.width;
    const centerY = seed.y * this.height;
    const rotation = seed.rotation ?? 0;
    const points: Particle[] = [];
    for (let index = 0; index < pointCount; index += 1) {
      const angle = rotation + (index / pointCount) * TAU;
      const profile = shapeProfile(seed.shape, angle, phase);
      const x = centerX + Math.cos(angle) * radius * profile;
      const y = centerY + Math.sin(angle) * radius * profile;
      points.push({ x, y, oldX: x, oldY: y });
    }

    const springs: SpringLink[] = [];
    const addSpring = (a: number, b: number, weight: number): void => {
      springs.push({ a, b, rest: distance(points[a], points[b]), weight });
    };
    for (let index = 0; index < pointCount; index += 1) {
      addSpring(index, (index + 1) % pointCount, 1);
      addSpring(index, (index + 2) % pointCount, 0.62);
      if (pointCount % 2 === 0 && index < pointCount / 2) addSpring(index, index + pointCount / 2, 0.3);
    }
    const body: SoftBody = {
      id: this.nextId,
      shape: seed.shape,
      label: SHAPE_LABELS[seed.shape],
      ...PALETTE[paletteIndex % PALETTE.length],
      points,
      springs,
      restArea: polygonArea(points),
      restRadius: radius,
      radius,
      phase,
      dragging: false,
      frozen: false,
      dragVelocity: { x: 0, y: 0 },
    };
    this.nextId += 1;
    return body;
  }

  private solveSprings(body: SoftBody): void {
    const softnessFactor = 1 - this.settings.softness * 0.68;
    const strength = clamp((0.06 + this.settings.springStrength * 0.52) * softnessFactor, 0.03, 0.62);
    for (const spring of body.springs) {
      const a = body.points[spring.a];
      const b = body.points[spring.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy) || 0.001;
      const correction = ((length - spring.rest) / length) * strength * spring.weight;
      a.x += dx * correction * 0.5;
      a.y += dy * correction * 0.5;
      b.x -= dx * correction * 0.5;
      b.y -= dy * correction * 0.5;
    }
  }

  private solveArea(body: SoftBody): void {
    const currentArea = polygonArea(body.points);
    if (currentArea < 1) return;
    const scale = clamp(Math.sqrt(body.restArea / currentArea), 0.86, 1.16);
    const amount = (scale - 1) * (0.024 + this.settings.pressure * 0.075);
    const center = bodyCenter(body);
    for (const point of body.points) {
      point.x += (point.x - center.x) * amount;
      point.y += (point.y - center.y) * amount;
    }
  }

  private solveBounds(body: SoftBody): void {
    const edge = 7;
    for (const point of body.points) {
      let vx = point.x - point.oldX;
      let vy = point.y - point.oldY;
      if (point.x < edge) {
        point.x = edge;
        vx = Math.abs(vx) * this.settings.restitution;
        vy *= 1 - this.settings.friction * 0.35;
        point.oldX = point.x - vx;
        point.oldY = point.y - vy;
      } else if (point.x > this.width - edge) {
        point.x = this.width - edge;
        vx = -Math.abs(vx) * this.settings.restitution;
        vy *= 1 - this.settings.friction * 0.35;
        point.oldX = point.x - vx;
        point.oldY = point.y - vy;
      }
      if (point.y < edge) {
        point.y = edge;
        vy = Math.abs(vy) * this.settings.restitution;
        point.oldX = point.x - vx;
        point.oldY = point.y - vy;
      } else if (point.y > this.height - edge) {
        point.y = this.height - edge;
        vy = -Math.abs(vy) * this.settings.restitution;
        vx *= 1 - this.settings.friction * 0.42;
        point.oldX = point.x - vx;
        point.oldY = point.y - vy;
      }
    }
  }

  private solveObstacles(body: SoftBody): void {
    for (const obstacle of this.obstacles) {
      for (const point of body.points) {
        if (point.x < obstacle.x || point.x > obstacle.x + obstacle.w || point.y < obstacle.y || point.y > obstacle.y + obstacle.h) continue;
        const left = point.x - obstacle.x;
        const right = obstacle.x + obstacle.w - point.x;
        const top = point.y - obstacle.y;
        const bottom = obstacle.y + obstacle.h - point.y;
        const smallest = Math.min(left, right, top, bottom);
        let nx = 0;
        let ny = 0;
        if (smallest === left) {
          point.x = obstacle.x - 0.5;
          nx = -1;
        } else if (smallest === right) {
          point.x = obstacle.x + obstacle.w + 0.5;
          nx = 1;
        } else if (smallest === top) {
          point.y = obstacle.y - 0.5;
          ny = -1;
        } else {
          point.y = obstacle.y + obstacle.h + 0.5;
          ny = 1;
        }
        this.reflectVelocity(point, nx, ny);
      }
    }
  }

  private reflectVelocity(point: Particle, nx: number, ny: number): void {
    let vx = point.x - point.oldX;
    let vy = point.y - point.oldY;
    const normalVelocity = vx * nx + vy * ny;
    if (normalVelocity < 0) {
      vx -= (1 + this.settings.restitution) * normalVelocity * nx;
      vy -= (1 + this.settings.restitution) * normalVelocity * ny;
    }
    const tangent = 1 - this.settings.friction * 0.4;
    if (nx !== 0) vy *= tangent;
    else vx *= tangent;
    point.oldX = point.x - vx;
    point.oldY = point.y - vy;
  }

  private solveBodyCollisions(): void {
    for (let aIndex = 0; aIndex < this.bodies.length; aIndex += 1) {
      const a = this.bodies[aIndex];
      for (let bIndex = aIndex + 1; bIndex < this.bodies.length; bIndex += 1) {
        const b = this.bodies[bIndex];
        const aStatic = a.frozen && !a.dragging;
        const bStatic = b.frozen && !b.dragging;
        if (aStatic && bStatic) continue;
        const aCenter = bodyCenter(a);
        const bCenter = bodyCenter(b);
        let dx = bCenter.x - aCenter.x;
        let dy = bCenter.y - aCenter.y;
        const minimum = (a.radius + b.radius) * 0.66;
        if (Math.abs(dx) >= minimum || Math.abs(dy) >= minimum) continue;
        let length = Math.hypot(dx, dy);
        if (length < 0.001) {
          dx = 1;
          dy = 0;
          length = 1;
        }
        if (length >= minimum) continue;
        const overlap = minimum - length;
        const nx = dx / length;
        const ny = dy / length;
        if (a.dragging || aStatic) this.shiftBody(b, nx * overlap, ny * overlap);
        else if (b.dragging || bStatic) this.shiftBody(a, -nx * overlap, -ny * overlap);
        else {
          this.shiftBody(a, -nx * overlap * 0.5, -ny * overlap * 0.5);
          this.shiftBody(b, nx * overlap * 0.5, ny * overlap * 0.5);
        }
      }
    }
  }

  private shiftBody(body: SoftBody, dx: number, dy: number): void {
    for (const point of body.points) {
      point.x += dx;
      point.oldX += dx;
      point.y += dy;
      point.oldY += dy;
    }
  }
}
