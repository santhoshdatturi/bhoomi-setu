# Storage & S3 Guidelines

- **Bucket Naming**: All S3 storage bucket names must strictly use the `bhoomi-setu-` prefix (`bhoomi-setu-public`, `bhoomi-setu-private`, `bhoomi-setu-documents`, `bhoomi-setu-app`).
- **Image Fallback & Error Resilience**:
  - All image upload and preview components must implement graceful `onError` handlers to fall back to an empty dropzone or fallback initials instead of rendering broken image icons.
