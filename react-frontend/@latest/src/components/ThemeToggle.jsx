import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    try {
      setIsDark(document.documentElement.classList.contains('dark'))
    } catch {}
  }, [])

  function applyTheme(nextDark) {
    document.documentElement.classList.toggle('dark', nextDark)
    try {
      localStorage.setItem('theme', nextDark ? 'dark' : 'light')
    } catch {}
  }

  function onToggle() {
    const next = !isDark
    setIsDark(next)
    applyTheme(next)
  }

  return (
    <button
      onClick={onToggle}
      className="inline-flex w-auto items-center gap-2 rounded-full px-3 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
      aria-label="Toggle color theme"
      title="Toggle theme"
    >
      <span className="text-sm">{isDark ? 'Dark' : 'Light'}</span>
      <span
        className={
          'relative inline-flex h-5 w-10 items-center rounded-full overflow-hidden transition-colors ' +
          (isDark ? 'bg-gray-600' : 'bg-gray-300')
        }
      >
        <span
          className={
            'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ' +
            (isDark ? 'left-5' : 'left-0.5')
          }
        />
      </span>
    </button>
  )
}
