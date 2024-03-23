export type Stat = {
  type: string,
  url: string,
  size: number
  // in MS
  duration: number
}

export type StatRollup = Record<string, {
  totalSize: number,
  totalDuration: number,
  stats: Stat[]
}>