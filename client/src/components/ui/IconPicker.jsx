import { useState, useRef } from 'react'
import { Sparkles, Upload, Search, X, Check, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export const BUILTIN_ICONS = [
  { icon: '⚡', label: 'Lightning / Speed', category: 'General' },
  { icon: '🚀', label: 'Rocket / Launch', category: 'General' },
  { icon: '💻', label: 'Laptop / Code', category: 'Dev' },
  { icon: '⚙️', label: 'Gear / System', category: 'Dev' },
  { icon: '🤖', label: 'AI / Robot', category: 'AI' },
  { icon: '🧠', label: 'Brain / Neural', category: 'AI' },
  { icon: '🎨', label: 'Palette / UI UX', category: 'Design' },
  { icon: '📱', label: 'Mobile / App', category: 'Mobile' },
  { icon: '🌐', label: 'Globe / Web', category: 'Web' },
  { icon: '☁️', label: 'Cloud / DevOps', category: 'Dev' },
  { icon: '🛡️', label: 'Shield / Security', category: 'Security' },
  { icon: '🔒', label: 'Lock / Privacy', category: 'Security' },
  { icon: '🔍', label: 'Search / Audit', category: 'General' },
  { icon: '📊', label: 'Chart / Analytics', category: 'Data' },
  { icon: '📈', label: 'Growth / Scale', category: 'Data' },
  { icon: '💳', label: 'Card / Fintech', category: 'Fintech' },
  { icon: '📦', label: 'Package / Docker', category: 'Dev' },
  { icon: '🛠️', label: 'Tools / Build', category: 'Dev' },
  { icon: '💡', label: 'Bulb / Strategy', category: 'General' },
  { icon: '💎', label: 'Diamond / Quality', category: 'General' },
  { icon: '🏆', label: 'Trophy / Top Rank', category: 'General' },
  { icon: '🎯', label: 'Target / Goals', category: 'General' },
  { icon: '🧪', label: 'Flask / R&D', category: 'Science' },
  { icon: '📡', label: 'Antenna / Telemetry', category: 'Dev' },
  { icon: '🔋', label: 'Battery / Power', category: 'General' },
  { icon: '🎧', label: 'Headset / 24/7 SLA', category: 'Support' },
  { icon: '💬', label: 'Chat / Messaging', category: 'Support' },
  { icon: '🔔', label: 'Bell / Alert', category: 'General' },
  { icon: '📑', label: 'Document / PRD', category: 'General' },
  { icon: '🔗', label: 'Link / API', category: 'Dev' },
  { icon: '🏎️', label: 'Speed / Velocity', category: 'General' },
  { icon: '✨', label: 'Sparkles / Polish', category: 'General' },
]

export default function IconPicker({
  label = 'Icon',
  value = '⚡',
  onChange,
  helperText,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('library') // 'library' | 'upload' | 'custom'
  const fileRef = useRef(null)

  const filteredIcons = BUILTIN_ICONS.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.icon.includes(search)
  )

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an icon file (SVG, PNG, ICO, WebP)')
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      onChange(evt.target.result)
      setIsOpen(false)
      toast.success('Custom icon uploaded!')
    }
    reader.readAsDataURL(file)
  }

  const isDataUrl = typeof value === 'string' && (value.startsWith('data:') || value.startsWith('http') || value.startsWith('/'))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[0.65rem] text-[#00d4f5] font-semibold">
          32+ Built-in &amp; Custom Upload
        </span>
      </div>

      {/* Selected Icon Trigger Box */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(o => !o)}
          className="h-12 w-12 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-[#00d4f5]/60 transition-all flex items-center justify-center text-2xl flex-shrink-0 cursor-pointer shadow-sm relative group"
          title="Click to pick or upload icon"
        >
          {isDataUrl ? (
            <img src={value} alt="Icon" className="w-6 h-6 object-contain" />
          ) : (
            <span>{value || '⚡'}</span>
          )}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00d4f5] text-black text-[0.6rem] font-bold flex items-center justify-center shadow">
            +
          </span>
        </button>

        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsOpen(o => !o)}
            className="w-full text-left bg-[#0d0d1e] border border-white/[0.1] hover:border-[#00d4f5]/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 flex items-center justify-between transition-colors"
          >
            <span className="truncate">
              {isDataUrl ? 'Custom Uploaded Icon' : `Icon: ${value}`}
            </span>
            <span className="text-[0.68rem] text-[#00d4f5] font-bold">
              {isOpen ? 'Close' : 'Choose Icon →'}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Icon Library Dropdown Modal / Popover */}
      {isOpen && (
        <div className="p-4 rounded-2xl bg-[#0b0b18] border border-white/[0.14] shadow-2xl space-y-3.5 mt-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Tabs */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'library' ? 'bg-[#00d4f5] text-black' : 'text-slate-400 hover:text-white bg-white/[0.04]'
                }`}
              >
                Built-in Icons (32)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'upload' ? 'bg-[#00d4f5] text-black' : 'text-slate-400 hover:text-white bg-white/[0.04]'
                }`}
              >
                <Upload size={11} className="inline mr-1" /> Upload Local
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'custom' ? 'bg-[#00d4f5] text-black' : 'text-slate-400 hover:text-white bg-white/[0.04]'
                }`}
              >
                Custom Emoji
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X size={14} />
            </button>
          </div>

          {/* Tab 1: Builtin Library */}
          {activeTab === 'library' && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search icons (e.g. AI, Code, Cloud, Security)…"
                  className="w-full bg-[#06060f] border border-white/[0.08] focus:border-[#00d4f5] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-8 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredIcons.map((item, idx) => {
                  const isSelected = value === item.icon
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(item.icon)
                        setIsOpen(false)
                      }}
                      className={`h-10 rounded-xl flex items-center justify-center text-xl transition-all border relative group ${
                        isSelected
                          ? 'bg-[#00d4f5]/20 border-[#00d4f5] shadow-[0_0_12px_rgba(0,212,245,0.3)]'
                          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                      title={item.label}
                    >
                      <span>{item.icon}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Upload Custom SVG / PNG */}
          {activeTab === 'upload' && (
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/svg+xml,image/png,image/webp,image/x-icon"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/[0.12] hover:border-[#00d4f5]/60 hover:bg-[#00d4f5]/[0.02] transition-all rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload size={18} className="text-[#00d4f5]" />
                <p className="text-xs font-semibold text-slate-200">
                  Upload custom SVG or PNG icon from your computer
                </p>
                <p className="text-[0.65rem] text-slate-400">
                  Recommended size: 64x64 transparent SVG/PNG
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Custom Emoji or Text */}
          {activeTab === 'custom' && (
            <div className="space-y-2">
              <label className="text-[0.7rem] text-slate-400">Type or paste any custom emoji character:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  placeholder="Paste emoji (e.g. 🛸)"
                  className="flex-1 bg-[#06060f] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#00d4f5]"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#00d4f5] text-black font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {helperText && <p className="text-[0.7rem] text-slate-400">{helperText}</p>}
    </div>
  )
}
