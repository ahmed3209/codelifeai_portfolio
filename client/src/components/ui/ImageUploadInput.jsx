import { useState, useRef } from 'react'
import { Upload, Link2, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * ImageUploadInput:
 * - Allows local file upload directly from user's computer (with instant client-side WebP/JPEG compression)
 * - Allows manual URL pasting
 * - Shows live image preview
 */
export default function ImageUploadInput({
  label = 'Image',
  value = '',
  onChange,
  placeholder = 'https://... or upload from your computer',
  helperText,
  accept = 'image/*',
  maxDimension = 1600,
}) {
  const fileInputRef = useRef(null)
  const [tab, setTab] = useState('upload') // 'upload' | 'url'
  const [isProcessing, setIsProcessing] = useState(false)

  // Compress and convert local image to efficient Data URL
  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP, SVG)')
      return
    }

    setIsProcessing(true)
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img

        // If SVG or small, keep as is
        if (file.type === 'image/svg+xml' || (width <= maxDimension && height <= maxDimension && file.size < 300000)) {
          onChange(event.target.result)
          setIsProcessing(false)
          toast.success('Local image loaded successfully!')
          return
        }

        // Scale down if larger than maxDimension to keep database light & fast
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedDataUrl = canvas.toDataURL('image/webp', 0.85)
        onChange(compressedDataUrl)
        setIsProcessing(false)
        toast.success('Local image optimized & loaded!')
      }

      img.onerror = () => {
        setIsProcessing(false)
        toast.error('Failed to parse image')
      }

      img.src = event.target.result
    }

    reader.readAsDataURL(file)
  }

  function handleClear() {
    onChange('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08] text-[0.65rem]">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
              tab === 'upload' ? 'bg-[#00d4f5] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload size={10} className="inline mr-1" /> Local File
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
              tab === 'url' ? 'bg-[#00d4f5] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 size={10} className="inline mr-1" /> Image URL
          </button>
        </div>
      </div>

      {tab === 'upload' ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/[0.12] hover:border-[#00d4f5]/60 hover:bg-[#00d4f5]/[0.02] transition-all rounded-xl p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5"
          >
            <Upload size={16} className="text-[#00d4f5]" />
            <p className="text-xs font-semibold text-slate-200">
              {isProcessing ? 'Optimizing image…' : 'Click to browse from your computer'}
            </p>
            <p className="text-[0.65rem] text-slate-400">PNG, JPG, WebP, SVG (Auto-optimized for instant loading)</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#0d0d1e] border border-white/[0.1] focus:border-[#00d4f5] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
          />
        </div>
      )}

      {/* Live Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/[0.1] p-2 flex items-center gap-3">
          <div className="w-16 h-12 rounded-lg bg-[#06060f] border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 truncate">
              <CheckCircle2 size={12} /> Image Ready
            </p>
            <p className="text-[0.65rem] text-slate-400 truncate">
              {value.startsWith('data:') ? 'Custom local uploaded asset' : value}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 transition-colors"
            title="Remove image"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {helperText && <p className="text-[0.7rem] text-slate-400">{helperText}</p>}
    </div>
  )
}
