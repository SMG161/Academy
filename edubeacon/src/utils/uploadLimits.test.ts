import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES, formatFileSize } from './uploadLimits';

describe('formatFileSize', () => {
  it('formats the video size limit as a clean "3GB" with no trailing zero', () => {
    expect(formatFileSize(MAX_VIDEO_SIZE_BYTES)).toBe('3GB');
  });

  it('formats the image size limit as "10MB"', () => {
    expect(formatFileSize(MAX_IMAGE_SIZE_BYTES)).toBe('10MB');
  });

  it('formats a sub-megabyte size in MB with one decimal place', () => {
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5MB');
  });

  it('formats a fractional gigabyte size with one decimal place', () => {
    expect(formatFileSize(1.5 * 1024 * 1024 * 1024)).toBe('1.5GB');
  });

  it('drops decimals once the value reaches double digits', () => {
    expect(formatFileSize(12 * 1024 * 1024)).toBe('12MB');
    expect(formatFileSize(12 * 1024 * 1024 * 1024)).toBe('12GB');
  });
});
