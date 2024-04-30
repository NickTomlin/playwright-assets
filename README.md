> [!WARNING]  
> This is in a prototype / proof-of-concept stage 🐱

🤖 playwright-assets
===

A utility to monitor asset size in dynamic applications using [playwright](https://playwright.dev/)

# Usage

## Installation

```
npm install @nicktomlin/playwright-assets
```

### Within a test

```typescript
import {assetExpect, collectStats} from "@nicktomlin/playwright-assets"

test("should have a small bundle", async ({page}) => {
  const stats = await collectStats(
    page,
    async () => page.goto("https://www.google.com")
  )
  
  await assetExpect(page).toBeUnder(1000)
})
```

### As a library

```typescript
import {collectStats} from "@nicktomlin/playwright-assets"
import { chromium } from 'playwright';

const browser = await chromium.launch()
const page = await browser.newPage();
const stats = await collectStats(
    page,
    async () => page.goto("https://www.google.com")
)

console.log(stats)
```

### CLI

Currently, there's no plans for a `cli` given how complex this setup can be. If this would be of interest to you, please submit a PR with a design proposal


# Prior art

- https://github.com/andersonba/puppeteer-assets

