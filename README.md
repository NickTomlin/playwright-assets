# playwright-assets
A utility to monitor asset size in dynamic applications

# Usage

## Installation

```
npm install playwright-assets
```

### Within a test

```typescript
// TODO: add instructions for using merge?
// https://playwright.dev/docs/test-assertions#combine-custom-matchers-from-multiple-modules
import {assetExpect, collectStats} from "playwright-assets"

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
// do we want to have them use playwright, 
// or just do things before?
import {collectStats} from "playwright-assets"
import { chromium } from 'playwright';

// TODO: we could implement a helper function to do this
// setup
// so it's just... 
// import {init} from "playwright-assets"
// const page = init("https://www.google.com", { /* options, including a `setup` function that can just return a page */ })
// const {stats} = page.visit("/search)
// const {stats} = page.visit("/search?q=playwright")
const browser = await chromium.launch()
const page = await browser.newPage();
const stats = await collectStats(
    page,
    async () => page.goto("https://www.google.com")
)

console.log(stats)
```

It'd kinda be nice to just have this as an assertion/test... but I can see us/users wanting to use the data too

Ideally it can integrate with the typical playwright tooing so we do less heavy lifting.

### CLI

Currently, there's no plans for a `cli` given how complex this setup can be. If this would be of interest to you, please submit a PR with a design proposal


# Prior art

- https://github.com/andersonba/puppeteer-assets

