const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return 'Please choose a JPEG, PNG, GIF, or WebP image.'
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

export function readImageFileAsDataUrl(file: File): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) {
    return Promise.reject(new Error(validationError))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Could not read the image file.'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read the image file.'))
    reader.readAsDataURL(file)
  })
}
