export function calculateDownloadTime (pageSize, transferSpeedMBs) {
  return (pageSize * Math.pow(2, 10 * 2)) / ((transferSpeedMBs * Math.pow(1000, 2) / 8) * (100 / 100))
}

export function calculateDownloadSize (loadTimeSeconds, transferSpeedMBs) {
  return (loadTimeSeconds * ((transferSpeedMBs * Math.pow(1000, 2) / 8) * (100 / 100))) / Math.pow(2, 10 * 2)
}
