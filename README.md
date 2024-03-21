# playwright-assets
A utility to monitor asset size in dynamic applications

# Usage

## Installation

```
npm install playwright-assets
```

## NPX

```typescript
// do we want to have them use playwright, 
// or just do things before?
import {visit} from "playwright-assets"

// default: chromium, fresh browser / context / page
const {results} =  await visit("https://www.google.com")

// OR, with an existing page
await visit("https://www.google.com", {page})
```

It'd kinda be nice to just have this as an assertion/test... but I can see us/users wanting to use the data too

Ideally it can integrate with the typical playwright tooing so we do less heavy lifting.

### CLI

Currently, there's no plans for a `cli` given how complex this setup can be. If this would be of interest to you, please submit a PR with a design proposal


# Prior art

- https://github.com/andersonba/puppeteer-assets

