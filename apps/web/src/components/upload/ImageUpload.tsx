'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  onUpload: (file: File, previewUrl: string) => void
  onRemove?: () => void
  currentImage?: string
  maxSizeMB?: number
  accept?: string
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'free'
  label?: string
  helpText?: string
  className?: string
}

export function ImageUpload({
  onUpload,
  onRemove,
  currentImage,
  maxSizeMB = 5,
  accept = 'image/jpeg,image/png,image/webp',
  aspectRatio = 'free',
  label,
  helpText,
  className = '',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'landscape':
        return 'aspect-video'
      case 'portrait':
        return 'aspect-[3/4]'
      default:
        return 'aspect-[4/3]'
    }
  }

  const validateFile = (file: File): string | null => {
    const validTypes = accept.split(',').map((t) => t.trim())
    if (!validTypes.includes(file.type)) {
      return `Please upload ${validTypes.map((t) => t.replace('image/', '')).join(', ')} files only.`
    }

    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      return `File is too large. Maximum size is ${maxSizeMB}MB.`
    }

    return null
  }

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setIsUploading(true)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        setPreview(previewUrl)
        onUpload(file, previewUrl)
        setIsUploading(false)
      }
      reader.onerror = () => {
        setError('Failed to read file. Please try again.')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    },
    [onUpload, maxSizeMB, accept]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onRemove?.()
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          {label}
        </label>
      )}

      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors overflow-hidden ${getAspectClass()} ${
          isDragging
            ? 'border-primary bg-primary/5'
            : error
            ? 'border-red-300 dark:border-red-700'
            : 'border-stone-300 dark:border-stone-700'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-800">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
                progress_activity
              </span>
              <p className="text-sm text-stone-500">Uploading...</p>
            </div>
          </div>
        ) : preview ? (
          <div className="absolute inset-0">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="size-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-stone-400 text-[24px]">
                add_photo_alternate
              </span>
            </div>
            <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">
              {isDragging ? 'Drop image here' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-stone-400">
              {accept.split(',').map((t) => t.replace('image/', '').toUpperCase()).join(', ')} up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p className="mt-2 text-xs text-stone-500">{helpText}</p>
      )}
    </div>
  )
}
