# API Design

PassportAI uses stateless, server-protected API endpoints to communicate with external APIs and manage configurations.

## Endpoints

### 1. POST `/api/remove-background`
Removes the background from the uploaded photo and replaces it with the template's required background color.
*   **Request Headers**: `Content-Type: multipart/form-data`
*   **Request Body**:
    *   `image`: The raw JPEG or PNG file.
    *   `templateId`: String ID of the selected country template.
*   **Success Response**: `200 OK`
    ```json
    {
      "success": true,
      "provider": "remove-bg",
      "image": {
        "mimeType": "image/png",
        "base64": "..."
      },
      "durationMs": 1800
    }
    ```
*   **Error Response**: `400 Bad Request` or `500 Server Error`
    ```json
    {
      "success": false,
      "error": {
        "code": "BACKGROUND_REMOVAL_FAILED",
        "message": "Error details..."
      }
    }
    ```

### 2. GET `/api/templates`
Retrieves the full list of supported passport and visa templates.
*   **Response**: `200 OK` with JSON array of template definitions.

### 3. GET `/api/templates/[id]`
Retrieves a specific document template by its ID.

## Configuration & Safety Rules
*   **Environment Variables**: The `REMOVE_BG_API_KEY` is loaded on the server and never exposed to the client.
*   **File Limits**: Uploads are restricted by `MAX_UPLOAD_MB` (default: 5MB, environment-configurable up to 10MB) to ensure safety.
*   **Supported Formats**: Only standard `image/jpeg` and `image/png` formats are processed.
