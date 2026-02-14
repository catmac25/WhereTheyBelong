
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize theme from localStorage; default to light for consistency
;(() => {
  try {
    const applyTheme = (mode) => {
      const isDark = mode === 'dark'
      document.documentElement.classList.toggle('dark', isDark)
    }
    const saved = localStorage.getItem('theme') // 'light' | 'dark' | null
    const initial = saved === 'dark' ? 'dark' : 'light'
    applyTheme(initial)
  } catch {}
})()

createRoot(document.getElementById('root')).render(
 
    <App />

)
