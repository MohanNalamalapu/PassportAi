# Product Requirements Document (PRD)

PassportAI is a single-page web app designed to generate compliance-assisted, high-resolution passport and visa photos from a standard portrait selfie.

## Product Goals
*   **Compliance Assistance**: Deliver photos that assist with meeting official government size, framing, and background specifications.
*   **Privacy**: No database persistence. Processed results are stored only in browser sessionStorage for the current tab/session.
*   **Accessibility**: Keep the workflow clean and completed in under 15 seconds.
*   **Responsiveness**: Support desktop and mobile web browsers.

## Core Features
1.  **Template Select**: Choose template from 22 options covering major countries.
2.  **Smart Upload**: Drag-and-drop file upload with validation feedback.
3.  **Automatic Processing**: Performs AI background removal, face landmarks detection, and crop alignment.
4.  **Compliance Audit**: Interactive score report detailing exactly which checks passed or failed.
5.  **Export Options**: One-click downloads for JPEG, PNG, and PDF export formats.

## Out of Scope
*   Authentication, profiles, or user history dashboards.
*   Manual crop, rotate, or edit tools.
*   Payment processing or subscriptions.
