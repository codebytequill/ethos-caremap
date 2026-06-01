# Changelog

## 1.1.0 - 2026-06-01

- Added Privacy & Safety first-use notice for public demo use.
- Added persistent "Demo Mode / Sample Data Only" banner.
- Added Privacy Status panel confirming localStorage-only storage, no backend, no analytics, and no external upload.
- Added "Use Sample Data" flow for safer testing.
- Replaced the browser confirm dialog with a plain-language Clear All Local Data confirmation modal.
- Documented privacy limits in README.
- Added localStorage comments in code.

## 1.0.0 - 2026-05-31

- Prepared Ethos CareMap MVP for GitHub Pages deployment.
- Added zero-dependency static build output to `dist/`.
- Added GitHub Actions workflow for Pages deployment.
- Confirmed the app remains local-first and browser-based with no backend services or external databases.
- Preserved the visible medical/legal advice disclaimer.

## 0.2.0 - 2026-05-30

- Fixed Timeline date formatting for historical years such as `0001`.
- Replaced JavaScript `Date` formatting for stored ISO dates with manual validation and display formatting.

## 0.1.0 - 2026-05-29

- Created the initial Ethos CareMap MVP.
- Added Timeline Builder, Contacts Directory, Records Tracker, Questions and Concerns Log, Preservation Actions Tracker, and Case Dashboard.
- Added local browser persistence, export, and clear-local-data controls.
