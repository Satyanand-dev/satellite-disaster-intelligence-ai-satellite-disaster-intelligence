export const ACCEPTED = ['.tif', '.tiff', '.jp2', '.nc']
export const MAX_BYTES = 512 * 1024 * 1024

/** Client-side raster pre-check — server re-validates CRS/bands after upload. */
export function validateRasterFile(file) {
  if (!file) return 'No file selected.'
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ACCEPTED.includes(ext)) return `Unsupported format ${ext} — expected ${ACCEPTED.join(', ')}`
  if (file.size === 0) return 'File is empty.'
  if (file.size > MAX_BYTES) return `File exceeds the ${Math.round(MAX_BYTES / 1024 / 1024)} MB limit.`
  return null
}
