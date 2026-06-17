# PassportAI UI/UX Guide

## Product Feel

PassportAI should feel premium, calm, fast, and trustworthy. The target inspiration is Stripe, Linear, Vercel, and Notion: clean typography, restrained color, crisp spacing, and clear interaction states.

## Design Principles

- Show the actual product flow immediately.
- Keep screens focused and low-friction.
- Use visual hierarchy instead of heavy decoration.
- Make AI processing feel transparent.
- Keep compliance results easy to scan.
- Use mobile-first layout.

## Visual Direction

### Color

Recommended palette:

- Background: white and near-white.
- Text: neutral black/slate.
- Accent: refined blue or emerald.
- Status pass: green.
- Status warning: amber.
- Status fail: red.
- Borders: soft neutral gray.

Avoid overly decorative gradients or loud AI-themed visuals.

### Typography

- Use a modern sans-serif.
- Large confident hero heading.
- Tight, readable section headings.
- Body copy should be concise.
- Compliance details should use clear labels and measured values.

### Layout

- Use generous whitespace.
- Use cards for contained functional areas only.
- Avoid nested cards.
- Keep upload/results workflows centered and easy to scan.

## Page Requirements

## Landing Page

Sections:

- Hero with concise product promise.
- Trust strip or quick stats.
- Features.
- How it works.
- Country/document preview.
- Primary CTA to upload flow.

Hero copy direction:

```text
Passport photos, ready in seconds.
Upload a selfie. PassportAI removes the background, crops to official sizes, checks compliance, and gives you download-ready files.
```

## Upload Page

Required components:

- Country/document selector.
- Requirement summary.
- Upload dropzone.
- Preview.
- Processing timeline.
- Error state.

Processing steps:

1. Uploading image.
2. Removing background.
3. Detecting face landmarks.
4. Cropping to document size.
5. Checking compliance.
6. Preparing downloads.

## Results Page

Required components:

- Before/after comparison.
- Compliance score.
- PASS/WARNING/FAIL status.
- Detailed checks.
- Suggestions.
- Download section.
- Start-over action.

## Component Hierarchy

```text
AppShell
  LandingPage
    Hero
    Features
    HowItWorks
    CountryPreview
  UploadPage
    CountrySelector
    TemplateSummary
    UploadDropzone
    ImagePreview
    ProcessingTimeline
  ResultsPage
    BeforeAfterComparison
    ComplianceScore
    ComplianceReport
    SuggestionsPanel
    DownloadPanel
```

## Interaction States

### Upload Dropzone

- idle
- hover
- drag active
- file selected
- invalid file
- uploading

### Processing

- queued
- active
- complete
- failed

### Compliance

- pass
- warning
- fail

### Downloads

- ready
- generating
- downloaded
- failed

## Loading Experience

Use staged progress instead of a generic spinner. Each stage should make the AI/CV pipeline visible:

```text
Removing background
Finding facial landmarks
Aligning crop
Checking document rules
Preparing downloads
```

## Mobile Requirements

- Upload CTA visible without horizontal scrolling.
- Country selector usable with one hand.
- Before/after comparison stacks vertically.
- Download buttons remain large enough to tap.
- Compliance report should collapse into scan-friendly rows.

## Accessibility Requirements

- Keyboard-accessible upload control.
- Visible focus states.
- Status labels include text, not color only.
- Images include useful alt text where appropriate.
- Error messages explain recovery.

## Animation Guidance

Use subtle transitions:

- Fade in sections.
- Smooth progress step completion.
- Gentle before/after slider interaction.
- Button hover and press states.

Avoid flashy AI animations that distract from trust and utility.

