// Trello-style label palette. Each color is light enough that dark text reads
// cleanly on top, so a label can tint a whole card while staying legible.
export const LABEL_COLORS = [
  { name: 'green',  hex: '#bbf7d0' },
  { name: 'yellow', hex: '#fef08a' },
  { name: 'orange', hex: '#fed7aa' },
  { name: 'red',    hex: '#fecaca' },
  { name: 'purple', hex: '#e9d5ff' },
  { name: 'blue',   hex: '#bfdbfe' },
  { name: 'sky',    hex: '#bae6fd' },
  { name: 'lime',   hex: '#e4f9a8' },
  { name: 'pink',   hex: '#fbcfe8' },
  { name: 'gray',   hex: '#e2e8f0' },
]

/**
 * Pick a readable text color (near-black or white) for a given background hex,
 * using the YIQ perceived-brightness formula. Keeps card text legible whatever
 * label color the user chooses.
 */
export function contrastText(hex) {
  if (!hex) return '#ffffff'
  const c = hex.replace('#', '')
  if (c.length < 6) return '#ffffff'
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 150 ? '#1d2125' : '#ffffff'
}
