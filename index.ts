import { Page, expect as baseExpect, Request } from "@playwright/test"
import { Stat, StatRollup } from "types"

function groupStats(stats: Stat[]) {
  let groupedStats: Record<string, Stat[]> = {}
  const sorted = [...stats].sort((a, b) => a.size - b.size)
  sorted.forEach(stat => {
    if (!groupedStats[stat.type]) {
      groupedStats[stat.type] = []
    }
    groupedStats[stat.type].push(stat)
  })

  const statRollup: StatRollup = {}
  // add all stats of one type together
  for (let type in groupedStats) {
    const totalSize = groupedStats[type].reduce((acc, stat) => acc + stat.size, 0)
    const totalDuration = groupedStats[type].reduce((acc, stat) => acc + stat.duration, 0)
    statRollup[type] = {
      totalSize,
      totalDuration,
      stats: groupedStats[type]
    }
  }

  return statRollup
}

interface CollectAssetStatsOptions {
  /**
   * Filter out stats that don't match the filter function
   * @param request
   * @returns
   * true if the stat should be included, false otherwise
   * @default
   * @example
   * ```ts
   * collectAssetStats(page, async () => {
   *  await page.goto('https://playwright.dev/');
   * }, {
   * filter: (request) => request.url().includes('playwright.dev')
   * })
   * ```
   * This will only include assets that are loaded from the playwright.dev domain
   * */

  filter?: (request: Request) => boolean
}


export async function collectStats(page: Page, action: () => Promise<void>, options: CollectAssetStatsOptions = {}) : Promise<StatRollup> {
  const {  filter = () => true } = options
  const stats: Stat[] = []
  page.on('requestfinished', async (request) => {
    const timing = request.timing()
    const sizes = await request.sizes()
    if (sizes && filter(request)) {
      stats.push({
        type: request.resourceType(),
        url: request.url(),
        size: sizes.responseBodySize,
        // todo: pretty print in terms of KB/MB?
        duration: timing.responseEnd - timing.requestStart
      })
    }
  })

  await action();
  return groupStats(stats)
}

function sizeToBit(bit: number, unit: "kb" | "mb") {
  if (unit === "kb") {
    return bit * 1024
  } else {
    return bit * 1024 * 1024
  }
}

function bitToUnit(num: number, unit: "kb" | "mb") {
  if (unit === "kb") {
    return num / 1024
  } else {
    return num / 1024 / 1024
  }
}

function prettyPrintBit(num: number, unit: "kb" | "mb") {
  const converted = bitToUnit(num, unit)
  return `${converted.toFixed(2)}${unit}`
}

// TODO: will this work with `0.3mb`?
export const assetExpect = baseExpect.extend({
  toHaveAssetsLessThan(received, type: string, size: number, options?: {unit: "kb" | "mb" }) {
    const { unit = "kb" } = options ?? {}
    const typeStats = (received as StatRollup)[type];
    if (!typeStats) {
      // TODO: is this a fail? or is just an ignore?
      return {
        pass: false,
        message: () => `No stats found for type \`${type}\``,
      };
    }
    const totalSize = typeStats.totalSize;
    const convertedExpected = sizeToBit(size, unit)

    return {
      pass: convertedExpected > totalSize,
      message: () => {
        const topOffenders = [...typeStats.stats]
        .sort((a, b) => b.size - a.size)
        .slice(0, 6)
        .map((stat) => {
          const simplePath = new URL(stat.url).pathname
          return simplePath + ' ' + prettyPrintBit(stat.size, unit)
        })
        return `Expected total size of \`${type}\` assets to be less than ${size}${unit}, but got ${prettyPrintBit(totalSize, unit)}. Top offenders:\n${topOffenders.join('\n')}`
      }
    };
  },
})