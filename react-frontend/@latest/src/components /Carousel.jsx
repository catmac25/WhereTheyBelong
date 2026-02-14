"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion, wrap } from "motion/react"
import Slide from "./Slide" // ✅ import your Slide component
import img1 from "../assets/mediapipe.png"
import img2 from "../assets/node.png"
import img3 from "../assets/postgres.png"
import img4 from "../assets/react1.webp"
import img5 from "../assets/tensorflow.webp"
import img6 from "../assets/tailwind.png"

export default function Carousel() {
  const items = [
    img1, img2,img3,img4,img5,img6
  ]

  const [selectedItem, setSelectedItem] = useState(0)
  const [direction, setDirection] = useState(1)

  function setSlide(newDirection) {
    const nextItem = wrap(0, items.length, selectedItem + newDirection)
    setSelectedItem(nextItem)
    setDirection(newDirection)
  }

  const color = `var(--hue-${selectedItem + 1})`

  useEffect(() => {
    const timer = setInterval(() => setSlide(1), 4000)
    return () => clearInterval(timer)
  }, [selectedItem])

  return (
    <div style={container}>
      <motion.button
        initial={false}
        animate={{ backgroundColor: color }}
        onClick={() => setSlide(-1)}
        style={button}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowLeft />
      </motion.button>

      <AnimatePresence custom={direction} initial={false} mode="popLayout">
        <Slide key={selectedItem} color={color} src={items[selectedItem]} />
      </AnimatePresence>

      <motion.button
        initial={false}
        animate={{ backgroundColor: color }}
        onClick={() => setSlide(1)}
        style={button}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowRight />
      </motion.button>
    </div>
  )
}

const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
}

const button = {
  backgroundColor: "#0cdcf7",
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1,
  cursor: "pointer",
}

function ArrowLeft() {
  return (
    <svg width="24" height="24" stroke="white" strokeWidth="2">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="24" height="24" stroke="white" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
