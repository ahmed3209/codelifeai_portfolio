import fs from 'fs'
import path from 'path'

// Let's inspect index-B1XRexer.js for any undefined variables or issues
const bundlePath = path.join(process.cwd(), 'client', 'dist', 'assets', 'index-B1XRexer.js')
const code = fs.readFileSync(bundlePath, 'utf8')

console.log('Bundle length:', code.length)
// Check for common pitfalls: missing exports, circular dependencies, syntax errors
console.log('Includes ErrorBoundary:', code.includes('ErrorBoundary'))
console.log('Includes DEFAULT_BLOGS:', code.includes('Building Production-Grade AI Agents'))
