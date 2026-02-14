import React, { forwardRef } from "react"
import { motion, usePresenceData } from "motion/react"

const Slide = forwardRef(function Slide(props, ref) {
  const { color, src } = props
  const direction = usePresenceData()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: direction * 50 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          delay: 0.2,
          type: "spring",
          visualDuration: 0.3,
          bounce: 0.4,
        },
      }}
      exit={{ opacity: 0, x: direction * -50 }}
      style={{
        ...box,
        backgroundColor: color,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src={src}
        alt="carousel"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />
    </motion.div>
  )
})

const box = {
  width: 300,
  height: 200,
  borderRadius: "10px",
  overflow: "hidden",
}

export default Slide
