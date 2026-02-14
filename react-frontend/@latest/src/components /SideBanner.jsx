import React from "react";
import { useNavigate } from "react-router-dom";
export default function SideBannerVertical({
  href = "/login",
  onClick,
  visible = true,
  text = "click to login",
  barHeight = "260px",
  barWidth = "40px",
}) {
  const navigate = useNavigate();
  if (!visible) return null;

  function handleClick(e) {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    } else if (href) {
      e.preventDefault();
      navigate(href);
    }
  }

  // Ensure numeric values get px
  const barW = typeof barWidth === "number" ? `${barWidth}px` : barWidth;
  const barH = typeof barHeight === "number" ? `${barHeight}px` : barHeight;

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label="Login"
      className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50"
      style={{ textDecoration: "none" }}
    >
      {/* Narrow vertical bar */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: barH }}
      >
        <div
          className="bg-indigo-600 rounded-r-full shadow-lg flex items-center justify-center"
          style={{
            width: barW,
            height: "100%",
            minWidth: barW,
            position: "relative",
            overflow: "visible",
            cursor: "pointer",
          }}
          aria-hidden="true"
        >
          {/* Text inside the narrow bar, rotated -90deg so text is horizontal visually
              while placed within the narrow vertical bar. */}
          <span
            className="text-white font-medium select-none"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-90deg)",
              transformOrigin: "center center",
              whiteSpace: "nowrap",
              fontSize: 16,
              padding: "2px 4px",
            }}
          >
            {text}
          </span>
        </div>
      </div>
    </a>
  );
}