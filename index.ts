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


export async function collectAssetStats(page: Page, action: () => Promise<void>, options: CollectAssetStatsOptions) {
  const filter = options.filter ?? (() => true)
  const stats: Stat[] = []
  page.on('requestfinished', async (request) => {
    const timing = request.timing()
    const sizes = await request.sizes()
    if (sizes && filter(request)) {
      stats.push({
        type: request.resourceType(),
        url: request.url(),
        size: sizes.responseBodySize,
        duration: timing.responseEnd - timing.requestStart
      })
    }
  })

  await action();
  return groupStats(stats)
}


export const expect = baseExpect.extend({
  toHaveAssetsLessThan(received, type: string, size: number) {
    const typeStats = (received as StatRollup)[type];
    if (!typeStats) {
      return {
        pass: false,
        message: () => `No stats found for type \`${type}\``,
      };
    }
    const totalSize = typeStats.totalSize;
    return {
      pass: totalSize < size,
      message: () => {
        const topOffenders = typeStats.stats.slice(0, 4).map((stat) => {
          const simplePath = new URL(stat.url).pathname
          return simplePath + ' ' + stat.size;
        })
        return `Expected total size of \`${type}\` assets to be less than ${size}, but got ${totalSize}. Top offenders:\n${topOffenders.join('\n')}`
      }
    };
  },
})