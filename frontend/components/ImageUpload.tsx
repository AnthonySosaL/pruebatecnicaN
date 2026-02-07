'use client';

import { useState, useRef, useCallback } from 'react';
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImageUploadProps {
  label: string;
  required?: boolean;
  onChange: (files: FileList | null) => void;
  error?: string;
  accept?: string;
}

export default function ImageUpload({ 
  label, 
  required = false, 
  onChange, 
  error,
  accept = 'image/*'
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Create a DataTransfer to pass to onChange
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      onChange(dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {preview ? (
        <div className="relative rounded-xl border-2 border-[var(--border)] overflow-hidden bg-[var(--muted)]">
          <div className="relative aspect-video">
            <Image
              src={preview}
              alt="Vista previa"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white truncate max-w-[200px]">{fileName}</p>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed p-8
            transition-all duration-200 ease-in-out
            ${isDragging 
              ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.02]' 
              : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]'
            }
            ${error ? 'border-red-500 bg-red-500/5' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`
              p-3 rounded-full mb-4 transition-colors
              ${isDragging ? 'bg-[var(--primary)]/10' : 'bg-[var(--muted)]'}
            `}>
              {isDragging ? (
                <CloudArrowUpIcon className="w-8 h-8 text-[var(--primary)]" />
              ) : (
                <PhotoIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
              )}
            </div>
            
            <p className="text-sm font-medium text-[var(--foreground)] mb-1">
              {isDragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen aquí'}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">
              o haz clic para seleccionar
            </p>
            
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 rounded-lg transition-colors"
            >
              Seleccionar archivo
            </button>
            
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              PNG, JPG, GIF hasta 10MB
            </p>
          </div>
          
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
