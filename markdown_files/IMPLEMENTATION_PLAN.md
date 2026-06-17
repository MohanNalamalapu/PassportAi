# Implementation Plan

The building blocks of the PassportAI codebase are grouped into 6 logical implementation phases.

## Development Phases

### Phase 1: Country Template Registry
Sets up the JSON-driven data store containing 22+ document specifications across 19 countries, providing querying logic by ID and country name.

### Phase 2: Upload and Validation Engine
Handles file parsing with checks on file size limit (10MB maximum), image MIME types (`image/jpeg` and `image/png` only), and filters out corrupted files.

### Phase 3: Background Removal Service
Integrates the Remove.bg API via a serverless POST route `/api/remove-background`. Adds rate limiting (12 req/min) and retry logic with exponential backoff.

### Phase 4: Face Landmark Detection & Crop
Pulls in MediaPipe face landmarks client-side to locate eye coordinates, forehead, and chin. Feeds these to the crop engine to compute the centered crop dimensions.

### Phase 5: Compliance Checker
Implements the 10 compliance rules in the browser. Calculates the score and checks compliance flags dynamically.

### Phase 6: Export & Final Downloads
Draws the photo using canvas, applies lighting filters, and formats downloads (JPEG, PNG, print-ready PDF via `pdf-lib`). Sets up the results screen.
