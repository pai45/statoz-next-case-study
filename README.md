# StatOz Case Study

Repository: [pai45/statoz-next-case-study](https://github.com/pai45/statoz-next-case-study). Website: [StatOz Case Study](https://pai45.github.io/statoz-next-case-study/). See [DEPLOYMENT.md](DEPLOYMENT.md) for a fresh checkout, the pinned product-demo snapshot, Pages builds and verified publication.

Run from the workspace root:

```powershell
npm run case-study
```

Or run `START.cmd` in this folder. The case study opens at http://127.0.0.1:4411. Use Presenter view for private story controls and Investor view for the window you share.

## Actual Sports Web in the device mockup

The Sports, Predictions and Sports knowledge chapters now embed the current compiled StatOz Sports Web application at a native 1024 x 768 viewport in a landscape tablet for the investor view, with a 390 x 844 phone preview on the presenter desk. The device on each introduction is directly interactive. Click, scroll, search for teams, open a match, switch tabs, enter predictions or play the real Knowledge Arena. Its own components, styling, questions, feedback, rewards and navigation run inside the frame.

The Sports UI is compiled from `../statoz-sports-web`, with the build performed in `.cache/current-sports-web`. Product source files are not edited. The packaged app lives in `demos/sports` and is served on port 4412. A local presentation account avoids a sign-in detour. The app retains its existing demo data and business rules.

Presenter phone and investor tablet mirror clicks, form values and scrolling. Product routes are remembered when changing presentation views. Native transient gameplay state and timing belong to the app itself. No custom Sports result simulator or fabricated quiz completion controls are shown. Use the real app controls to reveal available results.

Old standalone walkthrough links redirect to the corresponding actual product.

Refresh the packaged Sports app after further product development:

```powershell
npm run refresh:sports
npm run build
```

The refresh compiles a separate source copy and archives the previous packaged app under `.cache`. It does not publish or change the Sports product repository. Source hashes and build details are in `public/data/sports-web-build.json`. Actual product gallery captures are recorded in `public/data/current-sports-captures.json`; regenerate them with `node scripts/capture-actual-sports.mjs` while the presentation servers are running.

## Actual Games Web and four playable games

The Games introduction and Interactive demo embed the current Games Web app in a landscape 852 x 393 phone. Browse the real home page, Game Library, sport lanes and other app pages. Private presenter controls open Games home, Longbow, Rally Dash (the requested rally racing game), Yorker or Hoop Legacy in both presentation views.

Play directly in the investor window while sharing it. Click inside the phone to give keyboard controls focus. Longbow uses hold, aim and release; Rally Dash supports its own driving controls; Yorker uses its native delivery and release controls; Hoop Legacy supports its actual Career, Play Now and 3PT Contest menus. In a 3PT Contest, hold Space and release to shoot, as instructed by the game.

Both views run real engines independently. App navigation, filters, input values and scrolling are mirrored; sandboxed engine input, physics, timers and results are not mirrored. No presenter control invents or reveals a game result. Native engine saves and progression belong to the packaged app.

The app is compiled from `../statoz-games-web` in `.cache/current-games-web` without editing product source, then packaged into `demos/games` for port 4413. The existing accepted game library is retained. The four selected HTML artifacts pass their original SHA-256 checks unchanged, including their real assets and game logic. The source racing game is titled Rally Dash and retains its legacy `grand-prix-dash` catalogue ID.

Refresh after Games Web development:

```powershell
npm run refresh:games
node scripts/capture-current-games.mjs
npm run build
```

Capture requires the local presentation servers. Build provenance is in `public/data/games-web-build.json`; landscape capture provenance is in `public/data/current-games-captures.json`. The data sheet exports `current-games-data.csv`. Historical Formula/Yorker sample files remain archived and are not used by the active Games chapter.

## Presenter controls

Both homepage buttons share one browser-local session and may be opened in either order. Select chapters, reorder or hide them, edit private notes, choose the introduction, gallery, video or product view, and use blackout or fullscreen as needed. The introduction phone is already interactive; Interactive demo gives the product its own stage and exposes route shortcuts. Restart reloads the current frame; Reset demo progress clears only presentation-owned product storage.

Only the investor window should be shared in a meeting. Notes remain on the presenter desk. Synchronization is within one browser profile, not across computers. The presenter desk is visually separate and is not an authenticated service.

## The investor stage

The investor view (`/present`) renders every chapter on a fixed 1920 × 1080 stage scaled to the window, so nothing scrolls and no website chrome appears. The explore website (`/`) is unchanged.

- **Run of show presets.** On the desk, **10-min pitch** shows Introduction → The fragmented fan → Opportunity → Sports → Predictions → Games → Traction → Business → Free to play → Market → The next chapter → Thank you. It hides Sports knowledge, Admin and Studio, which stay one click away through **Appendix jump**. **Deep dive** shows everything. Each chapter shows its time budget and, after a timed run, your last rehearsal time.
- **Builds.** Opportunity, Traction, Business, Market and The next chapter reveal in steps. → or Space (or the large reveal button on the desk) shows the next build before moving chapters; ← goes back, and a previous chapter returns fully built.
- **Pace.** The pace bar compares elapsed time with the planned budget for the visible chapters. The current-chapter clock turns orange when the chapter runs over.
- **Shortcuts.** Press **?** on the desk for the list. B blacks out the investor screen and Esc restores it.

### Founder facts

Market sizing, founder credentials, milestone targets and the cash-related free-to-play statements live in `src/pitch-facts.ts`. Empty values never appear on the investor screen; the desk preview marks them **FOUNDER TO FILL**. Add a source with every figure, confirm the free-to-play statements with counsel before setting `confirmed: true`, then run `npm run build`.

## Local Admin workspace and laptop demo

The Admin chapter opens a working local reconstruction inside a laptop mockup with a native 1280 x 800 viewport. It follows the supplied black/charcoal dashboard, weekly-trend and match-management references. The additional Quizzes, Predictions, Users, Payments and Assets screens are demonstration extensions, not copies of an unavailable production Admin build.

Use the laptop sidebar or the private **Admin starting page** controls to explore all nine pages. Dashboard controls change the chart range and onboarding day; weekly tables expand; match cards filter by tournament, sport, status or search. Create and edit fixtures, change match status, write quiz questions and select correct answers, open/lock/settle a local prediction, inspect demo players, edit their status, and create or edit catalogue assets. Tables export the visible records to CSV.

Navigation, filters, form drafts and saved records synchronize between presenter and investor frames in the same browser profile. Each presentation session has its own local workspace. Refresh retains records. **Reset demo progress** on the desk, or **Reset local demo** in Admin, restores the starting fixtures. No server, account, payment gateway, rewards system or production database is connected.

The original screenshots are retained unchanged. The gallery contains nine new renders, with provenance in `public/data/current-admin-captures.json`. The data sheet includes 87 transcribed Admin reference values, source links and reconciliation notes; `admin-demo-data.json` contains the local operational fixtures separately. ?42 net and 2.17 actions per active user are preserved as captured, with the arithmetic differences documented.

Open the standalone panel at http://127.0.0.1:4411/admin. The existing `npm run case-study` command starts the whole case study. After changing Admin, build and verify with:

```powershell
npm run build
npm run test:admin
npm run capture:admin
npm run build
```

## Other chapters and data

Admin uses the supplied screenshot references and local operational fixtures. Studio previews real game models, animation and lighting and does not publish asset revisions.

The data sheet preserves all 107 evidence metrics, source PDF, definitions and reconciliation notes. Its evidence CSV always exports the full report dataset. Current Games build data has a separate CSV with 38 data points covering the viewport and four accepted game artifacts. Former guided Sports fixture JSON remains available only as an explicitly labelled archive; the active Sports interface uses its own current product data.

The source pitch, original investor video and historical report remain unchanged. Coin activity is not revenue, activation is not retention, and funding figures are proposed.

## Checks

```powershell
npm run typecheck
npm test
npm run test:sports
npm run test:games
npm run test:admin
npm run test:browser
npm run test:mockups
npm run test:home-views
npm run test:stage
npm run test:local-assets
npm run test:build-isolation
```

The case study has an independent GitHub Pages deployment. Source-product repositories remain unchanged. If PowerShell blocks npm.ps1, use `npm.cmd` for the same commands.
