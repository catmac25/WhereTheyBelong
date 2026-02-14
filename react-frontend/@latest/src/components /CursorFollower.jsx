import React, { useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function CursorFollower() {
  const spring = { damping: 20, stiffness: 200, mass: 0.4 }
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)

  useEffect(() => {
    const radius = 12 // half of size (24px)
    function handleMove(e) {
      x.set(e.clientX - radius)
      y.set(e.clientY - radius)
    }
    window.addEventListener('pointermove', handleMove, { passive: true })
    return () => window.removeEventListener('pointermove', handleMove)
  }, [x, y])

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: '#ff0088',
        mixBlendMode: 'difference',
        pointerEvents: 'none',
        zIndex: 50,
        x,
        y,
      }}
    />
  )
}


