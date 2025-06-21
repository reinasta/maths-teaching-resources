export interface WorksheetEntry {
  title: string;
  description: string;
  worksheetPdf: string;
  answersPdf: string;
  additionalLinks: { title: string; url: string }[];
  additionalResources: { title: string; url: string }[];
  tags: string[];
  slug: string;
}

export function parseWorksheetMarkdown(markdown: string): WorksheetEntry[] {
  const entries: WorksheetEntry[] = [];
  
  // Split by ## headers (excluding the main # header)
  const sections = markdown.split(/^## /gm).slice(1);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    const title = lines[0].trim();
    
    let description = '';
    let worksheetPdf = '';
    let answersPdf = '';
    const additionalLinks: { title: string; url: string }[] = [];
    const additionalResources: { title: string; url: string }[] = [];
    let tags: string[] = [];
    
    let inAdditionalLinks = false;
    let inAdditionalResources = false;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('**Description:**')) {
        description = line.replace('**Description:**', '').trim();
      } else if (line.startsWith('**Worksheet PDF:**')) {
        worksheetPdf = line.replace('**Worksheet PDF:**', '').trim();
      } else if (line.startsWith('**Answers PDF:**')) {
        answersPdf = line.replace('**Answers PDF:**', '').trim();
      } else if (line.startsWith('**Additional Links:**')) {
        inAdditionalLinks = true;
        inAdditionalResources = false;
      } else if (line.startsWith('**Tags:**')) {
        inAdditionalLinks = false;
        inAdditionalResources = false;
        const tagString = line.replace('**Tags:**', '').trim();
        tags = tagString.split(',').map(tag => tag.trim());
      } else if (line.startsWith('**Additional Resources**')) {
        inAdditionalLinks = false;
        inAdditionalResources = true;
      } else if (inAdditionalLinks && line.startsWith('- [')) {
        // Parse markdown link: - [Title](URL)
        const linkMatch = line.match(/- \[([^\]]+)\]\(([^\)]+)\)/);
        if (linkMatch) {
          additionalLinks.push({
            title: linkMatch[1],
            url: linkMatch[2]
          });
        }
      } else if (inAdditionalResources && line.startsWith('- [')) {
        // Parse markdown link: - [Title](URL)
        const linkMatch = line.match(/- \[([^\]]+)\]\(([^\)]+)\)/);
        if (linkMatch) {
          additionalResources.push({
            title: linkMatch[1],
            url: linkMatch[2]
          });
        }
      }
    }
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    entries.push({
      title,
      description,
      worksheetPdf,
      answersPdf,
      additionalLinks,
      additionalResources,
      tags,
      slug
    });
  }
  
  return entries;
}
