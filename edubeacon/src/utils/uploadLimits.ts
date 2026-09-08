export const MAX_VIDEO_SIZE_BYTES = 3 * 1024 * 1024 * 1024; // 3 GB
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function trimTrailingZero(value: string): string {
  return value.endsWith('.0') ? value.slice(0, -2) : value;
}

export function formatFileSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${trimTrailingZero(gb.toFixed(gb >= 10 ? 0 : 1))}GB`;
  const mb = bytes / (1024 * 1024);
  return `${trimTrailingZero(mb.toFixed(mb >= 10 ? 0 : 1))}MB`;
}
