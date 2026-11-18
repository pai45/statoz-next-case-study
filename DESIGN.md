# StatOz presentation design

The case study uses the StatOz design-system, UI/UX Pro Max and source-faithful screen-mockup skills.

Sports is the actual current Sports Web app, compiled from its existing repository without editing its source. No case-study component recreates its home, match details, prediction flow or Knowledge Arena. The investor app renders at 1024 x 768 inside a landscape tablet frame; the presenter retains a 390 x 844 phone preview; case-study CSS cannot restyle the cross-origin screen. Its native components handle all touch, keyboard, scrolling, timing and result behavior.

Sports introductions contain live devices instead of gallery buttons. The investor tablet uses an even bezel with a small camera and home indicator outside the product screen. The frame has a safe bezel band so its island and gesture bar do not cover the app header or bottom navigation. A scaled viewport keeps the same logical device dimensions as its surrounding layout changes. Transport code added to the packaged document head mirrors ordinary clicks, inputs and scrolling between presentation views without replacing product controls.

Product gallery images are captures from the same compiled application. Source hashes, route details, dimensions and capture hashes are recorded in sports-web-build.json and current-sports-captures.json. The previous Sports reconstruction is retired from all public presentation entry points.

Games uses the current Games Web app at a native 852 x 393 landscape viewport in both views. The home page, library, sport filters and navigation retain their source UI. Private shared FilterChips provide five starting pages: home, Longbow, Rally Dash, Yorker and Hoop Legacy. Real accepted game artifacts run inside the source host sandbox, with unchanged bytes and native controls. Their artwork, typography and results remain independent of case-study styling. Ordinary outer-app interactions mirror between windows; opaque game input and simulation remain local to the window being played. Share and play in the investor window.

The Games gallery and homepage product preview use actual new source captures. games-web-build.json records source hashes and accepted artifact checksums; current-games-captures.json records five actual capture hashes. The active data sheet includes 38 build data points. Historical guided Games files remain an archive; no active Games chapter or old walkthrough bookmark opens their simulated results.

Presenter story controls and notes remain outside the shared investor view. Source product repositories, production services, shared packages and release pipelines are unchanged.

## Investor stage

The investor window is a 1920 × 1080 stage scaled to fit, with letterboxing, so a chapter is always one screen. Stage styles use canvas pixels in `src/features/presentation/stage.css` and consume the existing StatOz tokens (accent per chapter, Orbitron display, Space Grotesk body). Live Sports and Games devices are the same `SportsDevice` and `GamesDevice` components, scaled inside the canvas; their native viewports stay 1024 × 768 and 852 × 393.

Motion is restrained: an accent wipe on chapter change, a short rise on content, builds that fade in, count-ups on headline figures and growing signup bars. With reduced motion, these resolve immediately.

The opportunity slide illustrates all three fan habits with original SVG scenes: a stadium and match timeline for Follow, a selected and locked outcome for Predict, and a controller with basketball, archery and cricket for Play. These are editorial illustrations. Each card retains its presenter reveal, semantic accent and text description. The slide header and three cards share a fixed layout so the complete story fits above the presentation footer.

Stage-only chapters (free-to-play, market, close) are omitted from the explore website. Every figure on the stage comes from `src/metrics.mjs`; founder facts come from `src/pitch-facts.ts` and stay hidden from investors until filled.

## StatOz cyberpunk investor artifacts

The investor stage uses a single StatOz art direction: Orbitron display type, Space Grotesk body, dark semantic surfaces, cyan/violet/orange fan habits, continuous chamfered panel outlines, a fine court grid, and restrained neon edge lighting. Header rails, evidence panels, segmented signup bars, revenue glyphs, milestone panels and the closing prediction ticket share that language. Existing controls, reveal order, values and source notes are preserved.

Five original editorial SVGs live in `public/assets/investor-artifacts`: the isometric match stadium, prediction lock, arcade controller, connected fan-habit map and free-to-play fan pass. These are editable vector illustrations, not screenshots or quantitative claims. `scripts/build-investor-artifacts.mjs` generates the self-contained SVGs using the vendored StatOz semantic color tokens on each build. Live Sports and Games screens keep their actual source UI and device viewports.


## Local Admin reconstruction

Admin follows the supplied screenshots with black and charcoal surfaces, Arial interface typography, cyan chart accents, compact metrics and fixture cards. Semantic Admin surface tokens are scoped through the local design layer. The sidebar, record tables, forms and charts are feature components in `src/features/admin`; the reusable laptop shell lives in the design-system layout category.

The laptop has a bordered metal lid, camera in the upper bezel, full 16:10 screen and a separate tapered base. A 1280 x 800 logical viewport preserves desktop layout while resizing the surrounding slide. Both the introduction and dedicated demo use the same interactive panel. Presenter starting-page chips use the shared FilterChips. Saved data and transient form drafts synchronize through session-specific browser storage; reset affects only that local workspace. All added operational records are labelled as demonstrations and exported separately from the screenshot references and investor evidence.
