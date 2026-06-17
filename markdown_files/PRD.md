# Product Requirements Document (PRD)

PassportAI is a single-page web app designed to generate fully compliant, high-resolution passport and visa photos from a standard portrait selfie.

## Product Goals
*   **High Compliance**: Deliver photos that meet official government size, framing, and background specifications.
*   **Stateless Privacy**: Do not store, log, or track user selfies on the server. Photos exist only in temporary memory.
*   **Accessibility**: Keep the workflow clean and completed in under 15 seconds.
*   **Responsiveness**: Support desktop and mobile web browsers.

## Core Features
1.  **Template Select**: Choose template from 22 options covering major countries.
2.  **Smart Upload**: Drag-and-drop file upload with validation feedback.
3.  **Automatic Processing**: Performs AI background removal, face landmarks detection, and crop alignment.
4.  **Compliance Audit**: Interactive score report detailing exactly which checks passed or failed.
5.  **Export Options**: One-click downloads for JPEG, PNG, and print-ready PDF formats.

## Out of Scope
*   Authentication, profiles, or user history dashboards.
*   Manual crop, rotate, or edit tools.
*   Payment processing or subscriptions.
