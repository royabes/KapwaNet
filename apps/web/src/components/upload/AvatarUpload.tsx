'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface AvatarUploadProps {
  onUpload: (file: File, previewUrl: string) => void
  currentAvatar?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-16',
  md: 'size-24',
  lg: 'size-32',
}

export function AvatarUpload({
  onUpload,
  currentAvatar,
  size = 'md',
  className = '',
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return 'Please upload JPG, PNG, or WebP files only.'
    }

    const maxBytes = 2 * 1024 * 1024 // 2MB
    if (file.size > maxBytes) {
      return 'Avatar must be less than 2MB.'
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

      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        setPreview(previewUrl)
        onUpload(file, previewUrl)
        setIsUploading(false)
      }
      reader.onerror = () => {
        setError('Failed to read file.')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    },
    [onUpload]
  )

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div className={className}>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleClick}
          className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white dark:border-stone-900 shadow-lg group transition-transform hover:scale-105`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-200 dark:bg-stone-700">
              <span className="material-symbols-outlined text-primary animate-spin">
                progress_activity
              </span>
            </div>
          ) : preview ? (
            <>
              <Image
                src={preview}
                alt="Avatar"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  edit
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-200 dark:bg-stone-700 group-hover:bg-stone-300 dark:group-hover:bg-stone-600 transition-colors">
              <span className="material-symbols-outlined text-stone-400 group-hover:text-primary transition-colors text-[32px]">
                add_a_photo
              </span>
            </div>
          )}
        </button>

        {/* Camera badge */}
        <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
          <span className="material-symbols-outlined text-[16px]">photo_camera</span>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  )
}
