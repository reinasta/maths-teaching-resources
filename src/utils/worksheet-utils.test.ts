// src/utils/worksheet-utils.test.ts
import { getWorksheetSlugs, getWorksheetDataBySlug, getAllWorksheetsData } from './worksheet-utils';
import fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Worksheet Utils', () => {
  const mockWorksheetContent = `---
title: "Test Worksheet"
description: "A test worksheet description"
worksheetPdf: "/worksheets/test-slug/worksheet.pdf"
answersPdf: "/worksheets/test-slug/answers.pdf"
date: "2024-05-20"
tags: ["test", "algebra"]
slug: "test-slug"
---

## Test Content

This is test worksheet content with LaTeX: $x^2 + y^2 = z^2$
`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWorksheetSlugs', () => {
    it('should return array of slugs when worksheets directory exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['algebra-basics', 'geometry-shapes'] as unknown as fs.Dirent[]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

      const result = getWorksheetSlugs();

      expect(result).toEqual([
        { slug: 'algebra-basics' },
        { slug: 'geometry-shapes' }
      ]);
    });

    it('should return empty array when worksheets directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = getWorksheetSlugs();

      expect(result).toEqual([]);
    });

    it('should filter out non-directories', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['algebra-basics', 'file.txt'] as unknown as fs.Dirent[]);
      mockFs.statSync
        .mockReturnValueOnce({ isDirectory: () => true } as fs.Stats)
        .mockReturnValueOnce({ isDirectory: () => false } as fs.Stats);

      const result = getWorksheetSlugs();

      expect(result).toEqual([{ slug: 'algebra-basics' }]);
    });

    it('should handle errors gracefully', () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = getWorksheetSlugs();

      expect(result).toEqual([]);
    });
  });

  describe('getWorksheetDataBySlug', () => {
    it('should return worksheet data for valid slug', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockWorksheetContent);

      const result = getWorksheetDataBySlug('test-slug');

      expect(result).toEqual({
        frontmatter: {
          title: 'Test Worksheet',
          description: 'A test worksheet description',
          worksheetPdf: '/worksheets/test-slug/worksheet.pdf',
          answersPdf: '/worksheets/test-slug/answers.pdf',
          date: '2024-05-20',
          tags: ['test', 'algebra'],
          slug: 'test-slug'
        },
        content: expect.stringContaining('This is test worksheet content'),
        slug: 'test-slug'
      });
    });

    it('should return null for invalid slug', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = getWorksheetDataBySlug('invalid-slug');

      expect(result).toBeNull();
    });

    it('should return null for empty slug', () => {
      const result = getWorksheetDataBySlug('');

      expect(result).toBeNull();
    });

    it('should handle missing frontmatter fields with defaults', () => {
      const minimalContent = `---
title: "Minimal Worksheet"
---

Content only`;
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(minimalContent);

      const result = getWorksheetDataBySlug('minimal-slug');

      expect(result?.frontmatter).toEqual({
        title: 'Minimal Worksheet',
        description: '',
        worksheetPdf: '',
        answersPdf: '',
        date: expect.any(String),
        tags: [],
        slug: 'minimal-slug'
      });
    });

    it('should handle file read errors gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const result = getWorksheetDataBySlug('error-slug');

      expect(result).toBeNull();
    });
  });

  describe('getAllWorksheetsData', () => {
    it('should return all worksheets sorted by date (newest first)', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['worksheet1', 'worksheet2'] as unknown as fs.Dirent[]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
      
      const worksheet1Content = mockWorksheetContent.replace('2024-05-20', '2024-05-25');
      const worksheet2Content = mockWorksheetContent.replace('2024-05-20', '2024-05-15');
      
      mockFs.readFileSync
        .mockReturnValueOnce(worksheet1Content)
        .mockReturnValueOnce(worksheet2Content);

      const result = getAllWorksheetsData();

      expect(result).toHaveLength(2);
      expect(result[0].frontmatter.date).toBe('2024-05-25');
      expect(result[1].frontmatter.date).toBe('2024-05-15');
    });

    it('should filter out invalid worksheets', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['valid-worksheet', 'invalid-worksheet'] as unknown as fs.Dirent[]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
      
      mockFs.readFileSync
        .mockReturnValueOnce(mockWorksheetContent)
        .mockImplementationOnce(() => {
          throw new Error('Invalid file');
        });

      const result = getAllWorksheetsData();

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('valid-worksheet');
    });

    it('should handle errors gracefully', () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('Directory error');
      });

      const result = getAllWorksheetsData();

      expect(result).toEqual([]);
    });
  });
});
