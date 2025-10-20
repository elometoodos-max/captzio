/**
 * Handles file downloads by creating a temporary anchor element
 * and triggering a download with the provided data
 */
export function handleDownload(data: string, filename: string, mimeType = "text/plain") {
  try {
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("[v0] Download failed:", error)
    throw new Error("Failed to download file")
  }
}
