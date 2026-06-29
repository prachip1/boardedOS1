// Trello-style label palette. Each color is light enough that dark text reads
// cleanly on top, so a label can tint a whole card while staying legible.
export const LABEL_COLORS = [
  { name: 'green',  hex: '#4bce97' },
  { name: 'yellow', hex: '#f5cd47' },
  { name: 'orange', hex: '#fea362' },
  { name: 'red',    hex: '#f87168' },
  { name: 'purple', hex: '#b8a6ff' },
  { name: 'blue',   hex: '#579dff' },
  { name: 'sky',    hex: '#6cc3e0' },
  { name: 'lime',   hex: '#c7f751' },
  { name: 'pink',   hex: '#e774bb' },
  { name: 'gray',   hex: '#9fadbc' },
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
