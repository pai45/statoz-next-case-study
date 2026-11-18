# GitHub Pages deployment

Repository: https://github.com/pai45/statoz-next-case-study

Website: https://pai45.github.io/statoz-next-case-study/

## Fresh checkout

Use Node 22 and the authenticated GitHub CLI. Run `npm ci`, then `npm run setup:demos`. The installer downloads the immutable release asset pinned in `demo-snapshot.json`, verifies its SHA-256, and extracts only the presentation-owned demos. The compiled apps are release assets; generated output and browser records are excluded from source control.

Run `npm run typecheck`, `npm test`, and `npm run build:pages`. Use `npm run preview:pages` for http://127.0.0.1:4420/statoz-next-case-study/ and `npm run test:pages` for browser verification. The original local launch command still serves the presentation on 4411 and product demos on 4412/4413.

## Static packaging

The Pages build retains the website, presenter, investor, evidence, Admin, Studio and walkthrough routes as physical directories. Embedded Sports and Games use paths inside this project. The public asset helper and route helper distinguish the GitHub project prefix from the application's logical routes.

Sports assets are verified as byte-identical to the corresponding Games assets and stored once in `shared-assets`. Compiled public-asset helpers are adapted to this shared directory, including dynamic portrait paths. Both products retain their own app bundles and static routes. Verified redundant Next navigation payloads and game releases outside the current catalogue are omitted. All 15 current catalogue game artifacts retain their exact bytes and SHA-256 checks.

The export enforces a 990,000,000-byte budget. Its current size and source commit are recorded in `version.json`. Demo credentials, progress, storage reset, and broadcasts are scoped under `statoz.case.demo.<product>` so they cannot overwrite another StatOz site on the same GitHub Pages origin. The presenter desk uses browser-local state; it is not an authenticated private service.

## Publish

Push only on an explicit user request. Dispatch `.github/workflows/pages.yml` on the reviewed `main` commit. It installs the pinned snapshot, runs type/data/artifact checks, builds the static export, tests presenter synchronization and embedded product behavior, uploads the Pages artifact and deploys. The manual workflow follows the existing StatOz Games release convention.

Match the run's SHA with the live `/version.json`. A live check uses `CASE_STUDY_TEST_URL=https://pai45.github.io/statoz-next-case-study/` and `EXPECTED_COMMIT=<SHA>` with `npm run test:pages`. Browser failure screenshots are available as workflow artifacts. Existing full native gameplay suites remain available for the local three-server presentation.
