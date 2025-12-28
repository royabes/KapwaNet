'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface UploadedImage {
  id: string
  file: File
  previewUrl: string
}

interface MultiImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
  maxSizeMB?: number
  accept?: string
  label?: string
  helpText?: string
  className?: string
}

export function MultiImageUpload({
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5,
  accept = 'image/jpeg,image/png,image/webp',
  label,
  helpText,
  className = '',
}: MultiImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const validTypes = accept.split(',').map((t) => t.trim())
    if (!validTypes.includes(file.type)) {
      return `Please upload ${validTypes.map((t) => t.replace('image/', '')).join(', ')} files only.`
    }

    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      return `Files must be less than ${maxSizeMB}MB each.`
    }

    return null
  }

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null)

      const remainingSlots = maxImages - images.length
      if (remainingSlots <= 0) {
        setError(`Maximum ${maxImages} images allowed.`)
        return
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots)
      const newImages: UploadedImage[] = []

      setIsUploading(true)

      for (const file of filesToProcess) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          continue
        }

        const previewUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        }).catch(() => null)

        if (previewUrl) {
          newImages.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            previewUrl,
          })
        }
      }

      setIsUploading(false)

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages]
        setImages(updatedImages)
        onImagesChange(updatedImages)
      }
    },
    [images, maxImages, maxSizeMB, accept, onImagesChange]
  )

  const handleRemove = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id)
    setImages(updatedImages)
    onImagesChange(updatedImages)
    setError(null)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const canAddMore = images.length < maxImages

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          {label}
        </label>
      )}

      <div className="grid grid-cols-3 gap-3">
        {/* Existing images */}
        {images.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700"
          >
            <Image
              src={img.previewUrl}
              alt="Uploaded"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(img.id)}
              className="absolute top-1 right-1 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}

        {/* Upload slot */}
        {canAddMore && (
          <div
            className="relative aspect-square rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-primary hover:bg-primary/5 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary animate-spin">
                  progress_activity
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-stone-400 text-[28px] mb-1">
                  add_photo_alternate
                </span>
                <p className="text-xs text-stone-400 text-center px-2">
                  {images.length === 0 ? 'Add photos' : 'Add more'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-stone-400">
          {images.length}/{maxImages} photos
        </p>
        {helpText && <p className="text-xs text-stone-500">{helpText}</p>}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
