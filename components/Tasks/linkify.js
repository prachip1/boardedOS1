import React from 'react'

// Matches http(s):// URLs and bare www. links so pasted links in task
// descriptions render as real clickable anchors instead of plain text.
const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<]+[^\s<.,:;"')\]}])/gi

/**
 * Turn a plain text string into an array of React nodes where any URLs become
 * clickable <a> elements. Non-URL text is returned as-is.
 *
 * Anchors stop click/drag propagation so clicking a link inside a draggable
 * task card opens the link instead of starting a drag or opening the editor.
 */
export function linkify(text) {
  if (!text) return text

  const parts = String(text).split(URL_REGEX)

  return parts.map((part, i) => {
    if (!part) return null
    if (i % 2 === 1) {
      const href = part.startsWith('http') ? part : `https://${part}`
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-accent underline break-all hover:opacity-80"
        >
          {part}
        </a>
      )
    }
    return part
  })
}
