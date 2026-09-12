# Storage & S3 Guidelines

- **Bucket Naming**: Storage bucket names must strictly use `app` or `documents`.
- **Image Fallback & Error Resilience**:
  - All image upload and preview components must implement graceful `onError` handlers to fall back to an empty dropzone or fallback initials instead of rendering broken image icons.
