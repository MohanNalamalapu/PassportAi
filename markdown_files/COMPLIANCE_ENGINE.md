# Compliance Engine

The compliance engine evaluates the final cropped passport photo against selected country's official criteria. It runs entirely in the browser and outputs a pass/fail status and an overall score from 0 to 100.

## List of Compliance Checks

1.  **Single Face**: Confirms that exactly one face is detected. Fails if zero or multiple faces are present.
2.  **Centering**: Confirms the face is centered horizontally within 6% offset tolerance.
3.  **Head Ratio**: Verifies the head size occupies the template's specified height range (usually 50% to 80%).
4.  **Headroom**: Ensures a minimum of 10% vertical space is present above the top of the hair.
5.  **Shoulders Visible**: Confirms the upper shoulders are visible (minimum 18% space below the chin).
6.  **Facing Camera**: Calculates head yaw, pitch, and roll to verify the face is looking directly straight.
7.  **Brightness**: Checks if lighting is within template limits to avoid under or over-exposure.
8.  **Sharpness**: Measures image gradients to flag blurry or out-of-focus photos.
9.  **Eyes Open**: Confirms both eyes are open, visible, and unobstructed.
10. **Plain Background**: Verifies the background color is solid and uniform.

## Scoring System
*   **Base Score**: Starts at 100.
*   **Error Severity**: Critical rule failure (e.g. off-center face, multiple faces, bad head ratio) deducts 20 points and fails compliance.
*   **Warning Severity**: Mild rule issue (e.g. minor brightness warnings) deducts 5 points and flags a warning without failing compliance.
