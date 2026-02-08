/**
 * Calculate estimated reading time in minutes based on Korean text length
 * Korean average reading speed: ~200 characters per minute
 */
export function calculateReadTime(content: string): number {
  if (!content) return 1;

  // Remove HTML tags and whitespace to get actual text length
  const textLength = content.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;

  // Calculate minutes (200 chars/min for Korean)
  const minutes = Math.ceil(textLength / 200);

  // Return at least 1 minute
  return Math.max(1, minutes);
}

/**
 * Debounce function to limit how often a function can be called
 * Useful for auto-save functionality
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay) as unknown as number;
  };
}
