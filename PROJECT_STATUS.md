# Project Status - PassportAI

**Current Status**: 🟡 Demo-ready / MVP deployed. Needs production hardening before real users.

## Project Summary

PassportAI is a compliance-assisted passport-style photo generator. It supports client-side cropping and verification against official requirements.

- **Templates**: 22 templates across 19 countries (India, US, UK, Canada, Australia, Germany, France, Italy, Spain, Netherlands, Ireland, New Zealand, Singapore, Japan, South Korea, China, UAE, Saudi Arabia, Schengen Area).
- **Core Verification**: Runs 10 core checks, with optional brightness/sharpness support when template thresholds are configured.
- **Background Removal**: Integrates server-side Remove.bg API with local fallback background colors.
- **MediaPipe**: Landmark detection runs client-side with assets served locally.
- **Validation**: TypeScript checks pass. Lint passes with warnings.
- **Docker**: Docker support is not currently included.
- **Privacy**: No database persistence. Processed results are stored only in browser sessionStorage for the current tab/session.
