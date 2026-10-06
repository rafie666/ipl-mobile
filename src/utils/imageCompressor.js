/**
 * Client-Side Image Compressor Utility
 * Mengompresi gambar di browser sebelum dikonversi ke Base64 / disimpan ke storage
 * Mencegah QuotaExceededError pada LocalStorage dan menghemat bandwidth.
 */

export function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan gambar yang valid.'))
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Hitung skala rasio agar tidak melebihi maxWidth / maxHeight
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Konversi ke JPEG terkompresi
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = (err) => reject(err)
      img.src = event.target.result
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}