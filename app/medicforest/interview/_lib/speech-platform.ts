/** Include iPadOS when Safari advertises a desktop Mac user agent. */
export function isIOSSpeechBrowser(device: { userAgent: string; maxTouchPoints?: number }) {
  return /iPad|iPhone|iPod/i.test(device.userAgent)
    || (/Macintosh/i.test(device.userAgent) && (device.maxTouchPoints ?? 0) > 1);
}
