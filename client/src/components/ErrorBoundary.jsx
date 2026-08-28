import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('CodeLifeAI ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#06060f] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-[#0e0e24] border border-white/[0.1] shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#00d4f5]/10 text-[#00d4f5] flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              ⚠️
            </div>
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-6">
              We encountered an unexpected error. Please refresh the page or return to home.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00d4f5] text-black font-bold text-xs hover:bg-[#00d4f5]/90 transition-all"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
