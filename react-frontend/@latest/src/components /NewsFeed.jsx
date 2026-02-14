// import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { useInfiniteScroll } from './useInfiniteScroll'
// import { Spinner } from './Spinner'

// // Placeholder data generator (no external API yet)
// const TOTAL_LIMIT = 10
// async function fetchNews({ page, pageSize }) {
//   await new Promise(r => setTimeout(r, 400))
//   const start = page * pageSize
//   const remaining = Math.max(TOTAL_LIMIT - start, 0)
//   const count = Math.min(pageSize, remaining)
//   const data = Array.from({ length: count }, (_, i) => ({
//     id: start + i,
//     title: `Missing persons update #${start + i + 1}`,
//     summary: 'Authorities continue efforts to reunite families. Community support plays a vital role.'
//   }))
//   const hasMore = start + count < TOTAL_LIMIT
//   return { data, hasMore }
// }

// export default function NewsFeed() {
//   const [items, setItems] = useState([])
//   const [page, setPage] = useState(0)
//   const [loading, setLoading] = useState(false)
//   const [hasMore, setHasMore] = useState(true)
//   const containerRef = useRef(null)

//   const loadMore = useCallback(async () => {
//     if (loading || !hasMore) return
//     setLoading(true)
//     try {
//       const res = await fetchNews({ page, pageSize: 5 })
//       setItems(prev => [...prev, ...res.data])
//       setHasMore(res.hasMore)
//       if (res.hasMore) setPage(p => p + 1)
//     } finally {
//       setLoading(false)
//     }
//   }, [loading, hasMore, page])

//   useEffect(() => { loadMore() }, [])

//   const sentinelRef = useInfiniteScroll(loadMore, { root: containerRef.current, threshold: 0.2 })

//   // Render all loaded items; container height limits visible items (~4) and scroll reveals the rest

//   return (
//     <div ref={containerRef} className="space-y-3 max-h-96 overflow-y-auto pr-1">
//       {items.map(n => (
//         <article key={n.id} className="card p-4">
//           <h3 className="font-semibold heading-color">{n.title}</h3>
//           <p className="text-sm surface-text mt-1">{n.summary}</p>
//         </article>
//       ))}
//       {loading && <Spinner />}
//       {hasMore && <div ref={sentinelRef} className="h-8" />}
//       {!hasMore && <div className="py-6 text-center text-sm opacity-70">No more news</div>}
//     </div>
//   )
// }


import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useInfiniteScroll } from './useInfiniteScroll'
import { Spinner } from './Spinner'

// ---------------------------
// 📌 1. Actual News Array
// ---------------------------
const REAL_NEWS = [
  {
    id: 1,
    title: "Search intensifies for missing teenager in Mumbai",
    summary: "Police have expanded search operations as CCTV footage provides new leads."
  },
  {
    id: 2,
    title: "NGOs collaborate to track missing children",
    summary: "A coalition of NGOs has launched a data-driven initiative to assist authorities."
  },
  {
    id: 3,
    title: "Community volunteers join search efforts",
    summary: "Local volunteers are helping distribute posters and gather information."
  },
  {
    id: 4,
    title: "Helpline sees spike in missing person reports",
    summary: "Officials urge citizens to stay vigilant and report any suspicious activity."
  },
  {
    id: 5,
    title: "Police introduce AI assistance in tracking persons",
    summary: "New AI-powered tools help analyze sightings and movement patterns."
  },
  {
    id: 6,
    title: "Parents appeal for public help",
    summary: "Families hold a press conference requesting assistance from citizens."
  },
  {
    id: 7,
    title: "National database update expected soon",
    summary: "Authorities plan to integrate state-level records into one unified system."
  },
  {
    id: 8,
    title: "Authorities issue new advisory on child safety",
    summary: "Tips released to help parents safeguard children in crowded public places."
  },
  {
    id: 9,
    title: "Rehabilitation support for recovered individuals",
    summary: "Recovered persons receive counselling and reintegration services."
  },
  {
    id: 10,
    title: "Cyber cell tracks fake missing reports",
    summary: "Officials crack down on false alerts spreading across social media platforms."
  }
]

// ---------------------------
// 📌 2. Updated fetchNews()
// ---------------------------
async function fetchNews({ page, pageSize }) {
  await new Promise(r => setTimeout(r, 300)) // simulate delay

  const start = page * pageSize
  const end = start + pageSize

  const data = REAL_NEWS.slice(start, end)
  const hasMore = end < REAL_NEWS.length

  return { data, hasMore }
}

export default function NewsFeed() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const containerRef = useRef(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      const res = await fetchNews({ page, pageSize: 3 })
      setItems(prev => [...prev, ...res.data])
      setHasMore(res.hasMore)
      if (res.hasMore) setPage(p => p + 1)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page])

  useEffect(() => {
    loadMore()
  }, [])

  const sentinelRef = useInfiniteScroll(loadMore, {
    root: containerRef.current,
    threshold: 0.2
  })

  return (
    <div ref={containerRef} className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {items.map(n => (
        <article key={n.id} className="backdrop-blur-md bg-gray-200/20 dark:bg-gray-300/20 
        shadow-lg border border-white/30 dark:border-gray-700/30 
        rounded-xl p-4 transition hover:scale-[1.02] hover:shadow-xl ">
          <h3 className="font-semibold heading-color">{n.title}</h3>
          <p className="text-sm surface-text mt-1">{n.summary}</p>
        </article>
      ))}

      {loading && <Spinner />}

      {hasMore && <div ref={sentinelRef} className="h-8" />}

      {!hasMore && (
        <div className="py-6 text-center text-sm opacity-70">No more news</div>
      )}
    </div>
  )
}
