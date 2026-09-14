# Squish Circuit — implementation notes

## Direction brainstorm

1. **SVG spring rings** — render each soft body as an SVG path and move control points with a small spring system. This is approachable and accessible, but repeated SVG layout work would become expensive once several bodies and obstacles are on screen.
2. **Canvas Verlet mesh** — simulate a low-resolution ring of particles with edge, bend, and cross-body springs, then draw a smooth filled hull on a 2D canvas. This gives convincing squash and recovery while keeping collision and pointer interaction fully under our control.
3. **WebGL metaball field** — use a fragment shader to make beautiful blobs that merge and separate. It would look striking, but a field alone cannot deliver dependable stacking, throwing, or object-level physics.
4. **Constraint-library compounds** — combine rigid circles with a physics library’s distance constraints. This would be quick to prototype, but the visual surface would need a second layer and the final behavior would be harder to tune for a playful, tactile feel.
5. **Hybrid playground** — keep the physics in a small Canvas 2D spring-ring core, add stylized material rendering and scene presets around it, and use a lightweight DOM control rail for accessibility. This creates a focused toy that can feel polished without a backend, WebGL requirement, or large dependency graph.

## Chosen approach

Squish Circuit uses the **hybrid Canvas 2D spring-ring approach** (direction 5, built on direction 2). Each object is a closed ring of point masses with structural springs around the perimeter, diagonal springs across the ring, and a pressure-like area correction. Verlet integration makes the system stable and easy to tune. A small number of solver passes handles gravity, damping, arena bounds, obstacle AABBs, and body-to-body separation. The canvas draws a smooth hull plus a soft highlight, while the DOM owns the control surface, preset buttons, stats, and accessible labels.

The first pass prioritizes a reliable interaction loop: spawn, drag/throw, squash against obstacles, pause, reset, and change material parameters. Presets are data, not special-case simulation code, so adding more scenes stays safe and readable. The app is dependency-light and Vite-built so the generated `dist/` folder can be served directly from GitHub Pages.

