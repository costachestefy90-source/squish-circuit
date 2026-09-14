# Squish Circuit

Squish Circuit is a static soft-body physics playground for Stardance: a small, tactile lab where spring networks bend, bounce, stretch, collide, compress, and recover their shape.

[![Open the live playground](https://img.shields.io/badge/live%20playground-open-70e7c2?style=flat-square&labelColor=10172b)](https://costachestefy90-source.github.io/squish-circuit/)

![Squish Circuit playground preview](docs/squish-circuit-preview.png)

The same exported frame is also kept as a compact JPEG at [`docs/squish-circuit-banner.jpg`](docs/squish-circuit-banner.jpg) for Stardance's banner uploader.

## What is inside

- A responsive three-panel interface with a canvas stage, material controls, world controls, and a live object inspector.
- Five spawnable body profiles: cube, blob, pillow, orb, and a directional capsule.
- Eight ready-to-play scenes: Jelly cubes, Bouncing blobs, Low gravity, Heavy gravity, Obstacle course, Squish test, Slow motion, and Wind tunnel.
- Verlet integration with structural, bend, and cross-body spring links.
- Area preservation for internal pressure, edge collisions, obstacle collisions, soft-body overlap resolution, friction, and restitution.
- Pointer drag-to-throw interaction, double-click drop spawning, body selection, pause/reset, spring-guide visualization, keyboard shortcuts, accessible preset/shape state, and live energy/FPS/object metrics.
- A signed wind-current control renders an arrow field and pushes every particle, while the selected-body inspector reports area, speed, compression, and spring load.
- A **SAVE PNG** action for downloading the current rendered field as a clean project snapshot.
- No backend, database, API key, or runtime service. The built site is deployable as static files.

## Physics approach

Each body is a ring of particles connected by a spring network. Every frame, the solver performs a small fixed number of Verlet passes:

1. Integrate particle positions from their current and previous positions, gravity, wind, and the active time scale.
2. Relax structural edge springs, longer bend springs, and cross-body links.
3. Compare the current polygon area with the body's rest area and distribute an area-pressure correction around the ring.
4. Resolve arena bounds, static obstacle rectangles, and pairwise body overlap.
5. Apply friction and restitution to contact motion, then update the rendered hull and telemetry.

The result is intentionally compact and readable rather than a general-purpose physics engine. The constraints are exposed as controls so the relationship between softness, pressure, damping, gravity, friction, spring strength, and bounce is easy to feel.

## Controls

- Click a scene card or press `1`–`8` to load a preset.
- Choose a spawn shape and click **Spawn soft body**, or press `B`.
- Double-click empty stage space to drop the selected shape at that location.
- Clear the live bodies with **Clear field** or press `C`; the active scene's obstacles remain in place.
- Drag any body on the stage to throw it through the field.
- Click an object in the manifest to inspect it; use `×` to remove the selection.
- Press `Space` to pause/resume and `R` to reset the active scene.
- Toggle **Spring guides** to reveal the live network links, or press `G`.
- Open the keyboard reference with the `?` button or the `?` key.
- Tune the material and world sliders—including the signed wind current—while the solver is running.

On narrow screens, the world-field controls remain available below the material lab so gravity, wind, friction, and restitution are still adjustable on touch devices.

## Development

This project uses Vite, TypeScript, and the browser Canvas 2D API. There are no framework or service requirements.

```bash
npm install
npm run dev
npm run test   # strict TypeScript check
npm run build  # type-check and create dist/
npm run preview
```

The app is intentionally written so the same build works locally and from a GitHub Pages project path. The workflow in `.github/workflows/deploy.yml` builds `dist/` and publishes it whenever `main` changes.

## Project direction

Before implementation, five directions were considered and recorded in [`DECISIONS.md`](DECISIONS.md): SVG spring rings, a Canvas Verlet mesh, a WebGL metaball field, compound constraint bodies, and a hybrid playground. The hybrid Canvas 2D spring-ring approach won because it keeps the physics inspectable and reliable while leaving room for expressive visuals and responsive controls.

The factual milestone log is in [`docs/DEVLOG.md`](docs/DEVLOG.md), including the exported obstacle-course frame used for the Stardance banner.

## Credits and scope

Squish Circuit is an original Stardance project. Development was AI-assisted, with the implementation, physics model, copy, visual system, testing, and deployment configuration created for this project. It intentionally remains unshipped in Stardance for review.
