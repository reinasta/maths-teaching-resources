import { parseWorksheetMarkdown } from '../worksheetMarkdownParser';

describe('Worksheet Markdown Parser', () => {
  const sampleMarkdown = `# Math Worksheets

## Quadratic Equations
**Description:** Master solving quadratic equations using various methods including factoring, completing the square, and the quadratic formula.
**Worksheet PDF:** /worksheets/quadratic-equations/worksheet.pdf
**Answers PDF:** /worksheets/quadratic-equations/answers.pdf
**Additional Links:**
- [Quadratic Formula Calculator](https://www.calculator.net/quadratic-formula-calculator.html)
- [Khan Academy: Quadratic Equations](https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations)
**Tags:** algebra, quadratic, equations, factoring

## Statistics and Probability
**Description:** Explore measures of central tendency, probability distributions, and basic statistical analysis.
**Worksheet PDF:** /worksheets/statistics-probability/worksheet.pdf
**Answers PDF:** /worksheets/statistics-probability/answers.pdf
**Additional Links:**
- [Probability Calculator](https://www.calculator.net/probability-calculator.html)
**Tags:** statistics, probability, mean, median`;

  it('should parse worksheet entries correctly', () => {
    const entries = parseWorksheetMarkdown(sampleMarkdown);
    
    expect(entries).toHaveLength(2);
    
    // Test first entry
    expect(entries[0].title).toBe('Quadratic Equations');
    expect(entries[0].description).toBe('Master solving quadratic equations using various methods including factoring, completing the square, and the quadratic formula.');
    expect(entries[0].worksheetPdf).toBe('/worksheets/quadratic-equations/worksheet.pdf');
    expect(entries[0].answersPdf).toBe('/worksheets/quadratic-equations/answers.pdf');
    expect(entries[0].slug).toBe('quadratic-equations');
    expect(entries[0].tags).toEqual(['algebra', 'quadratic', 'equations', 'factoring']);
    expect(entries[0].additionalLinks).toHaveLength(2);
    expect(entries[0].additionalLinks[0]).toEqual({
      title: 'Quadratic Formula Calculator',
      url: 'https://www.calculator.net/quadratic-formula-calculator.html'
    });
    
    // Test second entry
    expect(entries[1].title).toBe('Statistics and Probability');
    expect(entries[1].slug).toBe('statistics-and-probability');
    expect(entries[1].tags).toEqual(['statistics', 'probability', 'mean', 'median']);
    expect(entries[1].additionalLinks).toHaveLength(1);
  });

  it('should handle entries without additional links', () => {
    const simpleMarkdown = `# Math Worksheets

## Basic Algebra
**Description:** Introduction to algebra concepts.
**Worksheet PDF:** /worksheets/basic-algebra/worksheet.pdf
**Answers PDF:** /worksheets/basic-algebra/answers.pdf
**Tags:** algebra, basics`;

    const entries = parseWorksheetMarkdown(simpleMarkdown);
    
    expect(entries).toHaveLength(1);
    expect(entries[0].additionalLinks).toHaveLength(0);
    expect(entries[0].title).toBe('Basic Algebra');
    expect(entries[0].slug).toBe('basic-algebra');
  });

  it('should generate proper slugs from titles', () => {
    const markdownWithSpecialChars = `# Math Worksheets

## Advanced Calculus & Derivatives!
**Description:** Complex calculus problems.
**Worksheet PDF:** /worksheets/calc/worksheet.pdf
**Answers PDF:** /worksheets/calc/answers.pdf
**Tags:** calculus`;

    const entries = parseWorksheetMarkdown(markdownWithSpecialChars);
    
    expect(entries[0].slug).toBe('advanced-calculus-derivatives');
  });

  it('should parse additional resources correctly', () => {
    const markdownWithResources = `# Math Worksheets

## Geometry Basics
**Description:** Introduction to geometric shapes and properties.
**Worksheet PDF:** /worksheets/geometry/main-worksheet.pdf
**Answers PDF:** /worksheets/geometry/main-answers.pdf
**Additional Links:**
- [Online Geometry Tool](https://example.com/geometry)
**Tags:** geometry, shapes

**Additional Resources**
- [Extra Practice Problems](/worksheets/geometry/extra-practice.pdf)
- [Extra Practice Solutions](/worksheets/geometry/extra-solutions.pdf)`;

    const entries = parseWorksheetMarkdown(markdownWithResources);
    
    expect(entries).toHaveLength(1);
    expect(entries[0].additionalLinks).toHaveLength(1);
    expect(entries[0].additionalLinks[0]).toEqual({
      title: 'Online Geometry Tool',
      url: 'https://example.com/geometry'
    });
    expect(entries[0].additionalResources).toHaveLength(2);
    expect(entries[0].additionalResources[0]).toEqual({
      title: 'Extra Practice Problems',
      url: '/worksheets/geometry/extra-practice.pdf'
    });
    expect(entries[0].additionalResources[1]).toEqual({
      title: 'Extra Practice Solutions',
      url: '/worksheets/geometry/extra-solutions.pdf'
    });
  });

  it('should handle entries without additional resources', () => {
    const entries = parseWorksheetMarkdown(sampleMarkdown);
    
    // Both entries in sampleMarkdown should have empty additionalResources arrays
    expect(entries[0].additionalResources).toEqual([]);
    expect(entries[1].additionalResources).toEqual([]);
  });
});
