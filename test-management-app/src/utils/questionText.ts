/** Removes legacy markdown image inserts from question body text. */
export function stripEmbeddedQuestionImages(text: string): string {
  return text.replace(/\n?!\[image\]\([^)]+\)\n?/g, '').trim()
}
