export interface VideoEntry {
  componentName: string;
  videoFile: string;
  videoPath: string;
  description: string;
}

export function parseVideoMarkdown(markdown: string): VideoEntry[] {
  const lines = markdown.split(/\r?\n/);
  const entries: VideoEntry[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    const headingMatch = line.match(/^##\s+(.+)/);
    if (headingMatch) {
      const componentName = headingMatch[1].replace(/\s+/g, '');
      let videoFile = '';
      let videoPath = '';
      let description = '';
      // Find the next non-empty line with a link
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().match(/\[(.+)\]\((.+)\)/)) j++;
      if (j < lines.length) {
        const linkMatch = lines[j].trim().match(/\[(.+)\]\((.+)\)/);
        if (linkMatch) {
          videoFile = linkMatch[1].trim();
          videoPath = linkMatch[2].trim();
        }
      }
      // Find the next non-empty line with a description
      let k = j + 1;
      while (k < lines.length && !lines[k].trim().match(/^Description:/)) k++;
      if (k < lines.length) {
        const descMatch = lines[k].trim().match(/^Description:\s*(.+)$/);
        if (descMatch) {
          description = descMatch[1].trim();
        }
      }
      if (componentName && videoFile && videoPath && description) {
        entries.push({ componentName, videoFile, videoPath, description });
      }
      i = k + 1;
    } else {
      i++;
    }
  }
  return entries;
}
