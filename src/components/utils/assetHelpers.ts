import { toast } from "react-toastify"

export const optimizeImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const img = new Image()
        img.src = event.target?.result as string
        img.crossOrigin = "anonymous"

        await new Promise((resolve) => (img.onload = resolve))

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const MAX_SIZE = 800
        let width = img.width
        let height = img.height

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width
          width = MAX_SIZE
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height
          height = MAX_SIZE
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        let quality = 0.8
        let base64 = canvas.toDataURL("image/jpeg", quality)

        while (base64.length > 1 * 1024 * 1024 && quality > 0.2) {
          quality -= 0.1
          base64 = canvas.toDataURL("image/jpeg", quality)
        }

        if (base64.length > 1 * 1024 * 1024) {
          reject(new Error("Image is too large even after compression"))
          return
        }

        resolve(base64)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const convertDocumentToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert document to base64"))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const validateDates = (purchaseDate: string, depreciationDate: string): boolean => {
  const purchase = new Date(purchaseDate)
  const depreciation = new Date(depreciationDate)

  if (isNaN(purchase.getTime())) {
    toast.error("Invalid purchase date format")
    return false
  }

  if (isNaN(depreciation.getTime())) {
    toast.error("Invalid depreciation date format")
    return false
  }

  if (depreciation < purchase) {
    toast.error("Depreciation date cannot be earlier than purchase date")
    return false
  }

  return true
}

