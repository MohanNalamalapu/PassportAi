# Requirements

PassportAI has clear functional, compliance, and security requirements to support high-quality passport photo creation.

## 1. Functional Specifications
*   **Templates**: 22 specs spanning 19 countries (including India, USA, UK, Canada).
*   **Supported Upload formats**: `image/jpeg` and `image/png` formats only.
*   **Max Upload size**: 10MB limit.
*   **Export resolution**: Output images must compile at 300 DPI.

## 2. Compliance Verification Rules
*   **Face Centering**: Face must be aligned horizontally and vertically.
*   **Eye Position**: Eye midline must sit level and clearly visible.
*   **Expression**: Relaxed neutral expression (no smiling or frowning).
*   **Attire & Accessories**: Bare face (no sunglasses, caps, or head coverings allowed).
*   **Background**: Clean, solid white or light-grey color.

## 3. Security & Privacy Requirements
*   **No Persistence**: Uploaded and processed images must remain in browser memory and not be stored in any database or folder.
*   **API Security**: The Remove.bg API key must be kept hidden on the server and never exposed to public client requests.
*   **Rate Limits**: Rate limits are set on the background removal endpoint to prevent excessive API costs.
