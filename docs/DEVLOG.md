# Squish Circuit build log

These notes record the actual milestones behind the Stardance project. The attached image is an exported frame from the running playground, not a mockup.

![Obstacle course frame](squish-circuit-preview.png)

## 01 — Choosing a direction

I compared five directions before implementation: SVG spring rings, a Canvas Verlet mesh, a WebGL metaball field, a constraint-library compound-body demo, and a hybrid playground. The hybrid Canvas 2D spring-ring approach won because it keeps the solver inspectable while still making room for a tactile interface and expressive materials. The decision record is in [`DECISIONS.md`](../DECISIONS.md).

## 02 — Making the bodies feel soft

The first useful physics pass used particle rings with Verlet integration. Structural edge springs hold the silhouette together, bend springs keep neighboring edges from folding too far, and cross-body links add a little more stability when objects touch. Area pressure compares the current polygon area with each body's rest area, so a body can compress and recover instead of behaving like a rigid box.

The arena then grew collision handling for bounds, static obstacle rectangles, friction, restitution, and pairwise body overlap. Pointer dragging became a throw interaction, which made it possible to test softness by hand rather than only watching an automatic animation.

## 03 — Turning the solver into a playground

The interface was built around the physics: material sliders expose softness, pressure, spring strength, and damping; world sliders expose gravity, friction, and restitution; and a live manifest plus selected-body inspector makes the simulated state legible. Seven presets cover jelly cubes, bouncing blobs, low and heavy gravity, an obstacle course, a squish test, and slow motion. Pause, reset, keyboard shortcuts, and spring guides make the playground practical to explore.

## 04 — Publishing and the final frame

The app was kept static: Vite builds the TypeScript and Canvas 2D client into `dist/`, with no backend or runtime service. The GitHub Pages workflow was enabled and the public demo was checked over HTTPS. The final obstacle-course state was exported with the app's **SAVE PNG** control and used as the project banner. The public links are kept in the project README.

## 05 — Small interaction polish

After the first live pass, I tightened two details that matter during repeated testing: slider tracks now show their actual normalized values instead of a fixed midpoint fill, and the spring-guide toggle can be driven with `G` in addition to the visible switch. The shortcut strip now exposes spawn and guide controls alongside pause, reset, and scene selection.

## 06 — Making feedback legible

The next polish pass made the scene and shape choices expose their selected state to assistive technology, added a small export-status readout for the **SAVE PNG** action, and kept the live slider track fill synchronized with each control. These changes preserve the compact visual system while making repeated exploration easier to understand.

## 07 — Keeping the lab usable on small screens

The mobile layout now keeps the world-field sliders visible instead of hiding gravity, friction, and restitution behind the desktop-only layout. Range controls also get a larger touch target at the phone breakpoint, so the material lab and world field remain part of the same playable sandbox on narrow screens.

## 08 — Making the controls teach themselves

The final interface pass added a keyboard-reference dialog that can be opened from the `?` button or keyboard, with short descriptions for pause, reset, spawning, guides, scene presets, and drag throwing. It keeps the control deck approachable without adding another persistent panel to the playground.

## 09 — Tightening contact resolution

While exercising scenes with several bodies, I removed a stale-center edge case in pairwise overlap resolution. Each collision pair now measures both current centers after earlier contacts in the same pass, keeping chained body contacts more stable without adding solver passes or changing the compact Verlet model.

## 10 — Keeping crowded scenes light

The collision pass now rejects body pairs whose center-distance bounding box cannot overlap before calculating a square root. It keeps the same contact threshold and response, but reduces unnecessary distance work when users spawn a larger cluster of soft bodies.

## 11 — Announcing live state changes

The status line now announces simulation pause/resume and scene changes through polite, atomic status regions. This keeps the canvas-first interface visually unchanged while making the most important live transitions available to assistive technology.

## 12 — Giving the field a current

The world model now has a signed wind-current control. A positive or negative setting applies a lateral acceleration to every particle and draws a restrained arrow field over the canvas, so the force is visible as well as tactile. The new Wind tunnel scene turns that control into a small obstacle study with three vanes.

## 13 — Adding a directional body

Capsules join the cube, blob, pillow, and orb profiles as a fifth spawnable body. The longer elliptical ring uses the same spring, area, collision, and pointer systems as the other bodies, and the selected-body inspector now exposes live area, speed, compression, and spring-load readings for closer comparisons.

## 14 — Making placement quicker

Double-clicking empty stage space now drops the selected shape into the field with a small launch impulse. The shortcut dialog documents the gesture alongside the existing keyboard controls, making it possible to build a test cluster without repeatedly returning to the control deck.

## 15 — Faster experiments, clearer motion

The control deck now has a **Clear field** action and `C` shortcut that removes live bodies while preserving the current scene's obstacle layout. The selected body also gets a restrained velocity arrow when it is moving, connecting the inspector's speed readout to a visual cue without turning every object into a debug overlay.

## 16 — Branching a test in place

The selected-body inspector now includes a duplicate action and `D` shortcut. A duplicate keeps the source shape, size, orientation, and current motion signature, then offsets itself into open space so users can compare two related bodies without rebuilding the setup by hand.

## 17 — Keeping the stage keyboard-ready

The canvas is now keyboard-focusable with a visible focus ring and a more descriptive accessible label. This makes the new duplicate and clear shortcuts usable from the stage itself, while preserving the direct pointer interaction for touch and mouse users.

## 18 — Making time a material too

Time scale is now exposed as a world-field slider from 10% to 100%. The existing slow-motion preset remains a quick starting point, but any scene can now be slowed down for close inspection without losing its material or obstacle setup.

## 19 — Speaking in the same units

The slider controls now publish their formatted values to assistive technology as well as the visible outputs. Signed wind values, gravity in G, and time scale percentages are no longer exposed only as the internal range positions.

## 20 — Remembering the path

The selected body now leaves a short, fading motion trail as it travels through the stage, paired with the live velocity arrow. It adds just enough history to read a wind-driven route while keeping the other bodies clean and the exported frame uncluttered.

## 21 — Letting the field turn

The world model now includes a signed vortex field alongside wind. It applies a tangential acceleration around the stage core and renders restrained orbit arcs with directional markers, making rotational motion visible instead of leaving it as an invisible force. The new Orbit lab preset gives the field a low-gravity study scene with an orbit deck and a small core obstacle.

## 22 — Building a stable experiment

The selected-body inspector now has a pin action, with `F` as its keyboard shortcut. A pinned body holds its particle positions and zeroes its velocity while the rest of the field continues to simulate; dragging still lets the user reposition it, and the manifest reports the explicit **FROZEN** state. The pin marker is also drawn on the body so the state remains legible on the canvas.

## 23 — Remixing without rebuilding

The control deck now has a **Remix field** action and `M` shortcut. It clears only the live bodies, then repopulates the current scene with a fresh five-body arrangement using the available profiles and small launch variations. Obstacles and world settings stay intact, so remixing is a quick way to explore a scene rather than a hidden reset.

## 24 — Correcting signed controls

The wind and vortex sliders now use a true 0–100 centered range, matching their signed values and the visual midpoint marker. This removes an edge case where the internal normalized mapping could be pushed beyond the intended −100% to +100% field range.
