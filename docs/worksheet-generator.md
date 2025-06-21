# Worksheet Generator

This directory contains tools for automatically generating worksheet pages from Markdown files.

## Overview

The worksheet generator system consists of:

1. **Markdown Parser** (`worksheetMarkdownParser.ts`) - Parses structured markdown into worksheet data
2. **Page Generator** (`worksheetPageGenerator.ts`) - Generates worksheet markdown pages from parsed data
3. **Main Generator** (`generateWorksheetPages.mjs`) - Orchestrates the generation process

## Usage

### Basic Usage

```bash
# Generate worksheets from the default source file
node scripts/generateWorksheetPages.mjs

# Generate worksheets from a specific markdown file
node scripts/generateWorksheetPages.mjs path/to/worksheets.md
```

### VS Code Task

You can also run the generator using the VS Code task:

- Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
- Type "Tasks: Run Task"
- Select "Generate Worksheet Pages"

## Markdown Format

The source markdown file should follow this format:

```markdown
# Math Worksheets

## Worksheet Title

**Description:** Brief description of the worksheet content and learning objectives.
**Worksheet PDF:** /path/to/worksheet.pdf
**Answers PDF:** /path/to/answers.pdf
**Additional Links:**

- [Link Title](https://example.com/resource)
- [Another Resource](https://example.com/another)
  **Tags:** tag1, tag2, tag3, tag4

## Another Worksheet

**Description:** Another worksheet description.
**Worksheet PDF:** /path/to/another-worksheet.pdf
**Answers PDF:** /path/to/another-answers.pdf
**Tags:** geometry, shapes, area
```

### Required Fields

- **Title** (H2 heading): The worksheet title
- **Description**: Brief description of the worksheet
- **Worksheet PDF**: Path to the worksheet PDF file
- **Answers PDF**: Path to the answer key PDF file
- **Tags**: Comma-separated list of tags

### Optional Fields

- **Additional Links**: List of helpful external resources

## Generated Output

For each worksheet entry, the generator creates:

1. **Directory**: `content/worksheets/{slug}/`
2. **Markdown File**: `content/worksheets/{slug}/index.md`

The generated markdown includes:

- Frontmatter with metadata
- Worksheet overview
- Learning objectives (derived from tags)
- Prerequisites section
- Instructions for students
- Additional resources (if provided)
- Download links for PDFs

### Example Generated Content

```markdown
---
title: "Quadratic Equations"
description: "Master solving quadratic equations using various methods..."
worksheetPdf: "/worksheets/quadratic-equations/worksheet.pdf"
answersPdf: "/worksheets/quadratic-equations/answers.pdf"
date: "2025-06-20"
tags: ["algebra", "quadratic", "equations", "factoring"]
slug: "quadratic-equations"
---

## Worksheet Overview

Master solving quadratic equations using various methods...

## Learning Objectives

This worksheet will help students develop skills in:

- Algebra
- Quadratic
- Equations
- Factoring

## Prerequisites

Students should have a basic understanding of fundamental mathematical concepts...

## Instructions

1. Download the worksheet PDF below
2. Complete all problems showing your work
3. Check your answers using the answer key
4. Review any concepts you found challenging

## Additional Resources

- [Quadratic Formula Calculator](https://example.com/calculator)
- [Khan Academy: Quadratic Equations](https://example.com/khan)

## Downloads

- [Download Worksheet PDF](/worksheets/quadratic-equations/worksheet.pdf)
- [Download Answer Key PDF](/worksheets/quadratic-equations/answers.pdf)
```

## Integration with Landing Page

The generated worksheets are automatically picked up by the `WorksheetsSection` component on the landing page. The component:

1. Reads all worksheets from `content/worksheets/`
2. Displays the 3 most recent worksheets
3. Provides a link to view all worksheets

No manual updates to the landing page are required.

## Testing

The generator includes comprehensive tests:

```bash
# Run all worksheet generator tests
npm test -- scripts/__tests__/worksheet*.test.ts

# Run specific test suites
npm test -- scripts/__tests__/worksheetMarkdownParser.test.ts
npm test -- scripts/__tests__/worksheetPageGenerator.test.ts
npm test -- scripts/__tests__/worksheetIntegration.test.ts
```

## File Structure

```
scripts/
├── worksheetMarkdownParser.ts     # TypeScript source
├── worksheetMarkdownParser.js     # Compiled JavaScript
├── worksheetPageGenerator.ts      # TypeScript source
├── worksheetPageGenerator.js      # Compiled JavaScript
├── generateWorksheetPages.mjs     # Main generator script
└── __tests__/
    ├── worksheetMarkdownParser.test.ts
    ├── worksheetPageGenerator.test.ts
    └── worksheetIntegration.test.ts

content/
├── worksheet_sources/
│   └── worksheets.md             # Source markdown file
└── worksheets/
    ├── quadratic-equations/
    │   └── index.md
    ├── trigonometry-basics/
    │   └── index.md
    └── statistics-and-probability/
        └── index.md
```

## Development

### Adding New Features

1. Update the TypeScript files (`*.ts`)
2. Compile to JavaScript: `npx tsc scripts/fileName.ts --target ES2020 --module commonjs --moduleResolution node --declaration false --outDir scripts --allowSyntheticDefaultImports`
3. Update tests
4. Run tests to verify changes

### Troubleshooting

- **Import errors**: Ensure TypeScript files are compiled to JavaScript
- **Path issues**: Use absolute paths in the generator script
- **Markdown parsing**: Verify the source markdown follows the exact format specified above
- **Missing worksheets**: Check that the WorksheetsSection component is reading from the correct directory
