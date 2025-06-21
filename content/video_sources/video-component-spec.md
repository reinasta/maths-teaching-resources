# Automated Video Component Generation (Latest Version)

This feature provides a fully automated, robust, and well-tested system for creating and integrating video component pages in the ReMaths app from a Markdown file listing video resources.

---

## What's New (Latest Updates)

- **Enhanced Section Targeting:** The script now specifically targets the "Interactive Tools" section, preventing videos from being incorrectly placed in the "Interactive Presentations" section.
- **Improved Duplicate Prevention:** Comprehensive logic ensures no duplicate links are ever created, even when running the script multiple times.
- **Robust Error Handling:** Clear error messages help identify issues with missing sections or malformed page structure.
- **Comprehensive Test Suite:** Over 15 automated tests ensure reliability and prevent regressions.
- **Fixed Video File References:** Corrected video file paths to match actual available video files.d Video Component Generation (Updated documentation)

This feature now fully automates the creation and integration of video component pages in the ReMaths app from a Markdown file listing video resources.

---

## What’s New

- **Landing page links are now inserted or updated automatically.**  
  The script finds the "Interactive Tools" section in page.tsx and either replaces an existing link to the same page or inserts a new one, ensuring there are never duplicate links.

---

## Usage

1. **Prepare a Markdown file**  
   List your videos in the following format:

   ```markdown
   ## Area Under Graphs

   [AreaUnderGraphsScene.mp4](videos/components/AreaUnderGraphsScene.mp4)
   Description: Video demonstration about calculating the area under graphs.

   ## Enlargement

   [EnlargementDemo.mp4](videos/components/EnlargementDemo.mp4)
   Description: Video about enlargement transformations in geometry.
   ```

2. **Run the script**

   ```sh
   node scripts/generateVideoComponents.mjs [path/to/your/videos.md]
   ```

   If no path is given, it uses the default at `content/video_sources/videos.md`.

3. **Review generated files**
   - Components: `src/components/<ComponentName>/`
   - Standalone pages: `src/app/components/standalone/<kebab-case-component-name>/`
   - Landing page: `src/app/page.tsx` is updated automatically in the Interactive Tools section

---

## Implementation Details

- **Markdown Parsing:**  
  The script parses headings, video links, and descriptions from the Markdown file using a robust parser that handles various edge cases.

- **Code Generation:**  
  For each entry, it generates:

  - A React component (`<ComponentName>.tsx`) rendering the video with proper accessibility attributes
  - An `index.tsx` for easy imports
  - A standalone Next.js page (`page.tsx`) using `StandaloneLayout`
  - A properly formatted landing page link block

- **Smart Landing Page Integration:**  
  The script:

  - Specifically locates the "Interactive Tools" section in `src/app/page.tsx`
  - Uses precise section markers to avoid conflicts with other grid sections
  - Searches for existing `<Link ... href="...">` blocks for the same page
  - If found, replaces the existing link with updated content
  - If not found, appends the new link with proper indentation
  - Guarantees no duplicate links (idempotent operation)

- **Comprehensive Testing:**  
  The system includes extensive automated tests:

  - **Integration Tests:** Verify section targeting, duplicate prevention, error handling
  - **Markdown Parser Tests:** Ensure robust parsing of various input formats
  - **Workflow Tests:** End-to-end verification of the complete generation process
  - **Regression Tests:** Prevent breaking existing functionality

- **Error Handling:**  
  Clear, actionable error messages for common issues:
  - Missing Interactive Tools section
  - Malformed page structure
  - Invalid markdown format

---

## Result

- Videos are viewable at `/components/standalone/<kebab-case-component-name>`
- All videos appear exclusively in the Interactive Tools section on the landing page
- No duplicate links are ever created, regardless of how many times the script is run
- The implementation is consistent, fully automated, and thoroughly tested
- Video components include proper accessibility attributes and responsive design
- Generated pages follow established patterns and integrate seamlessly with the app

---

## Testing

The video generation system includes comprehensive test coverage:

### Integration Tests (`videoGeneratorIntegration.test.js`)

- Section targeting verification
- Duplicate prevention testing
- Error handling validation
- Content structure preservation

### Markdown Parser Tests (`markdownParserVideo.test.ts`)

- Basic parsing functionality
- Various video format support
- Edge case handling
- Component name generation

### Workflow Tests (`videoGeneratorWorkflow.test.js`)

- End-to-end generation process
- File creation verification
- Regression testing

Run tests with:

```sh
npm test -- scripts/__tests__/videoGenerator*
```

---

## Troubleshooting

### Common Issues

1. **Video file not found:**

   - Verify the video file exists in `public/videos/components/`
   - Check the filename matches exactly (case-sensitive)
   - Update the markdown file with the correct filename

2. **Link not appearing on landing page:**

   - Ensure the Interactive Tools section exists in `src/app/page.tsx`
   - Check console output for error messages
   - Verify the page structure matches expected format

3. **Duplicate links:**
   - This should not happen with the current implementation
   - If it occurs, run the script again to consolidate links
   - Report as a bug if the issue persists

---
