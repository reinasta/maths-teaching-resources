# Automated Video Component Generation (Updated documentation)

This feature now fully automates the creation and integration of video component pages in the ReMaths app from a Markdown file listing video resources.

---

## What’s New

- **Landing page links are now inserted or updated automatically.**  
  The script finds the "Interactive Tools" section in page.tsx and either replaces an existing link to the same page or inserts a new one, ensuring there are never duplicate links.

---

## Usage

1. **Prepare a Markdown file**  
   List your videos in the following format:

   ```
   ## Area Under Graphs
   [AreaUnderGraphsScene.mp4](videos/components/AreaUnderGraphsScene.mp4)
   Description: Video demonstration about calculating the area under graphs.
   ```

2. **Run the script**

   ```sh
   node scripts/generateVideoComponents.mjs [path/to/your/videos.md]
   ```

   If no path is given, it uses the sample at videos.md.

3. **Review generated files**
   - Components: `src/components/<ComponentName>/`
   - Standalone pages: `src/app/components/standalone/<kebab-case-component-name>/`
   - Landing page: page.tsx is updated automatically

---

## Implementation Details

- **Markdown Parsing:**  
  The script parses headings, video links, and descriptions from the Markdown file.

- **Code Generation:**  
  For each entry, it generates:

  - A React component (`<ComponentName>.tsx`) rendering the video
  - An `index.tsx` for easy imports
  - A standalone Next.js page (page.tsx) using `StandaloneLayout`
  - A landing page link block

- **Landing Page Integration:**  
  The script:

  - Locates the "Interactive Tools" section in page.tsx
  - Searches for an existing `<Link ... href="...">` block for the same page
  - If found, replaces it; if not, inserts the new link at the end of the section
  - Ensures only one link per video page (idempotent and safe to run multiple times)

- **Testing:**  
  The update logic is tested to guarantee that running the script multiple times will not create duplicate links.

---

## Result

- The video is viewable at `/components/standalone/<kebab-case-component-name>`
- It appears in the Interactive Tools section on the landing page, with no duplicates
- The implementation is consistent and fully automated

---
