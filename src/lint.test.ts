/**
 * Lint Test Suite
 * 
 * This test ensures that all code passes ESLint checks.
 * It will fail the test suite if there are any linting errors,
 * catching them early in development before git push.
 */

import { execSync } from 'child_process';

interface ExecError extends Error {
  stdout?: string;
  stderr?: string;
}

describe('Code Quality', () => {
  it('should pass ESLint checks', () => {
    try {
      // Run ESLint and capture output
      const output = execSync('npm run lint', { 
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      // If we get here, linting passed
      expect(output).toContain('No ESLint warnings or errors');
    } catch (error) {
      // If ESLint fails, the test should fail with detailed output
      const execError = error as ExecError;
      console.error('ESLint errors found:');
      console.error(execError.stdout || execError.message);
      throw new Error(`ESLint check failed. Please fix the linting errors above.`);
    }
  });

  it('should pass TypeScript checks', () => {
    try {
      // Run TypeScript type checking
      execSync('npm run type-check', { 
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      // If we get here, type checking passed
      expect(true).toBe(true);
    } catch (error) {
      const execError = error as ExecError;
      console.error('TypeScript errors found:');
      console.error(execError.stdout || execError.message);
      throw new Error(`TypeScript check failed. Please fix the type errors above.`);
    }
  });
});
