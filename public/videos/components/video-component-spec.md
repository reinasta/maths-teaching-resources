# Spec: How to Implement a Video Component Page in ReMaths

## Where to Place Video Source Markdown Files

We recommend placing your Markdown files for video component generation in:

```
content/video_sources/
```

This keeps your automation inputs organized and separate from generated code and app content. For example, you might have:

```
content/video_sources/my-videos.md
```

When running the script, you can use:

```sh
node scripts/generateVideoComponents.mjs content/video_sources/my-videos.md
```

If no path is given, the script will use the sample at `scripts/__tests__/fixtures/videos.md`.
