import { useEffect, useRef } from 'react'

export function useInfiniteScroll(onLoadMore, { root = null, rootMargin = '0px', threshold = 0.1 } = {}) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (entry.isIntersecting) onLoadMore()
    }, { root, rootMargin, threshold })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [onLoadMore, root, rootMargin, threshold])

  return sentinelRef
}


