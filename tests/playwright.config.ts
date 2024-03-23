import { defineConfig } from '@playwright/test';

/*
We want to write an expectation on the stats object that can do something like:

expect(stats).toHaveAssetsLessThan('script', 2000)
*/

export default defineConfig({
  // Glob patterns or regular expressions that match test files.
  testMatch: 'tests/*.spec.ts',
});