import { generateWorksheetPageContent } from '../worksheetPageGenerator';
import type { WorksheetEntry } from '../worksheetMarkdownParser';

describe('Worksheet Page Generator', () => {
  const sampleEntry: WorksheetEntry = {
    title: 'Quadratic Equations',
    description: 'Master solving quadratic equations using various methods including factoring, completing the square, and the quadratic formula.',
    worksheetPdf: '/worksheets/quadratic-equations/worksheet.pdf',
    answersPdf: '/worksheets/quadratic-equations/answers.pdf',
    additionalLinks: [
      {
        title: 'Quadratic Formula Calculator',
        url: 'https://www.calculator.net/quadratic-formula-calculator.html'
      },
      {
        title: 'Khan Academy: Quadratic Equations',
        url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations'
      }
    ],
    additionalResources: [],
    tags: ['algebra', 'quadratic', 'equations', 'factoring'],
    slug: 'quadratic-equations'
  };

  it('should generate proper frontmatter', () => {
    const content = generateWorksheetPageContent(sampleEntry);
    
    expect(content).toContain('title: "Quadratic Equations"');
    expect(content).toContain('description: "Master solving quadratic equations using various methods including factoring, completing the square, and the quadratic formula."');
    expect(content).toContain('worksheetPdf: "/worksheets/quadratic-equations/worksheet.pdf"');
    expect(content).toContain('answersPdf: "/worksheets/quadratic-equations/answers.pdf"');
    expect(content).toContain('slug: "quadratic-equations"');
    expect(content).toContain('tags: ["algebra", "quadratic", "equations", "factoring"]');
  });

  it('should include additional resources section when links are provided', () => {
    const content = generateWorksheetPageContent(sampleEntry);
    
    expect(content).toContain('## Additional Resources');
    expect(content).toContain('- [Quadratic Formula Calculator](https://www.calculator.net/quadratic-formula-calculator.html)');
    expect(content).toContain('- [Khan Academy: Quadratic Equations](https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations)');
  });

  it('should omit additional resources section when no links are provided', () => {
    const entryWithoutLinks: WorksheetEntry = {
      ...sampleEntry,
      additionalLinks: []
    };
    
    const content = generateWorksheetPageContent(entryWithoutLinks);
    
    expect(content).not.toContain('## Additional Resources');
  });

  it('should include downloads section', () => {
    const content = generateWorksheetPageContent(sampleEntry);
    
    expect(content).toContain('## Downloads');
    expect(content).toContain('- [Download Worksheet PDF](/worksheets/quadratic-equations/worksheet.pdf)');
    expect(content).toContain('- [Download Answer Key PDF](/worksheets/quadratic-equations/answers.pdf)');
  });

  it('should include learning objectives based on tags', () => {
    const content = generateWorksheetPageContent(sampleEntry);
    
    expect(content).toContain('## Learning Objectives');
    expect(content).toContain('- Algebra');
    expect(content).toContain('- Quadratic');
    expect(content).toContain('- Equations');
    expect(content).toContain('- Factoring');
  });

  it('should limit learning objectives to first 4 tags', () => {
    const entryWithManyTags: WorksheetEntry = {
      ...sampleEntry,
      tags: ['algebra', 'quadratic', 'equations', 'factoring', 'polynomials', 'mathematics']
    };
    
    const content = generateWorksheetPageContent(entryWithManyTags);
    
    // Should only include first 4 tags
    expect(content).toContain('- Algebra');
    expect(content).toContain('- Quadratic');
    expect(content).toContain('- Equations');
    expect(content).toContain('- Factoring');
    expect(content).not.toContain('- Polynomials');
    expect(content).not.toContain('- Mathematics');
  });

  it('should include additional resources when provided', () => {
    const entryWithAdditionalResources: WorksheetEntry = {
      ...sampleEntry,
      additionalResources: [
        {
          title: 'Extra Practice Worksheet',
          url: '/worksheets/quadratic-equations/extra-practice.pdf'
        },
        {
          title: 'Extra Practice Answers',
          url: '/worksheets/quadratic-equations/extra-practice-answers.pdf'
        }
      ]
    };
    
    const content = generateWorksheetPageContent(entryWithAdditionalResources);
    
    expect(content).toContain('## Additional Resources');
    expect(content).toContain('- [Extra Practice Worksheet](/worksheets/quadratic-equations/extra-practice.pdf)');
    expect(content).toContain('- [Extra Practice Answers](/worksheets/quadratic-equations/extra-practice-answers.pdf)');
  });

  it('should combine additional links and resources in one section', () => {
    const entryWithBoth: WorksheetEntry = {
      ...sampleEntry,
      additionalResources: [
        {
          title: 'Local Worksheet',
          url: '/worksheets/quadratic-equations/local.pdf'
        }
      ]
    };
    
    const content = generateWorksheetPageContent(entryWithBoth);
    
    // Should have one Additional Resources section with both types
    const sections = content.split('## Additional Resources');
    expect(sections.length).toBe(2); // One split means one section
    expect(content).toContain('- [Quadratic Formula Calculator]');
    expect(content).toContain('- [Local Worksheet]');
  });
});
