import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import BIRDS from "vanta/dist/vanta.birds.min"

export default function VantaBackground({
  scale = 1.0,
  scaleMobile = 1.0,
  mouseControls = true,
  touchControls = true,
  gyroControls = false,
  minHeight = 200,
  minWidth = 200,
}) {
  const ref = useRef(null)
  const vantaRef = useRef(null)

  useEffect(() => {
    if (!ref.current || vantaRef.current) return

    vantaRef.current = BIRDS({
      el: ref.current,
      THREE,
      mouseControls,
      touchControls,
      gyroControls,
      minHeight,
      minWidth,
      scale,
      scaleMobile,
      backgroundAlpha: 0.0, // 👈 makes background transparent
      color1: 0x00ffcc,     // bird color
      color2: 0xffffff,     // second bird color
      quantity: 3.0,        // number of birds
      wingSpan: 25.0,       // tweak for visual style
      speedLimit: 5.0,      // movement speed
      separation: 20.0,
      alignment: 20.0,
      cohesion: 20.0,
    })

    // make sure Vanta canvas doesn’t block clicks
    const canvas = ref.current.querySelector("canvas")
    if (canvas) canvas.style.pointerEvents = "none"

    return () => {
      if (vantaRef.current) {
        try {
          vantaRef.current.destroy()
        } catch (e) {
          // ignore cleanup errors
        }
        vantaRef.current = null
      }
    }
  }, [])

  return (
    <>
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0, // top, right, bottom, left = 0
          zIndex: 0,
          background: "transparent", // ensure full transparency
        }}
      />
      <style>{`
        /* Keep app content above the Vanta background */
        #root, .app-content {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  )
}
