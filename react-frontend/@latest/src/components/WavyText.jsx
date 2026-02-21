import React from 'react'
import { motion } from 'framer-motion'

export default function WavyText({
  text = 'Finding Missing Person',
  className = '',
  amplitude = 8,
  duration = 1.2,
  delayStep = 0.06,
}) {
  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span
          key={`${i}-${char}`}
          className="inline-block"
          animate={{ y: [0, -amplitude, 0] }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay: i * delayStep }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}


