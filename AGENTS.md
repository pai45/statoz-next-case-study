# StatOz Case Study

Repository: pai45/statoz-next-case-study. This project owns the investor case study and its packaged demonstrations. Do not write to sibling product repositories or original Desktop inputs.

Run the existing three-server presentation with npm start on ports 4411–4413. Run npm run build:pages for the GitHub Pages export, npm run preview:pages on port 4420, and npm run test:pages for the hosted path and embedded product checks. Keep local presentation behavior working. See DEPLOYMENT.md for snapshot installation and publication.

Preserve report values, original evidence, source provenance, and accepted game artifact hashes. Pages packages byte-identical common product assets once and removes verified duplicate navigation payloads and obsolete game releases. A mismatch must fail the build.

All publication requires an explicit user request. The maintained Pages workflow is manually dispatched after an authorized push; do not treat an earlier release as authorization for later changes. Verify its exact SHA against the public version.json and complete a live smoke check before claiming deployment.

The presenter desk is browser-local, not an authenticated private service. Speaker notes remain in the user's browser. Product demo boot scripts must namespace storage and broadcasts on the shared Pages origin; resetting a demo must not alter any other StatOz site.
