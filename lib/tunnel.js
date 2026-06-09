/**
 * Tunnel Management for Live Preview Links
 * This creates public URLs for localhost development
 */

let activeTunnels = new Map() // Store active tunnels

/**
 * Create a tunnel to localhost
 * @param {string} localUrl - The localhost URL (e.g., 'http://localhost:3000')
 * @param {string} subdomain - Optional custom subdomain
 * @returns {Promise<{url: string, close: function}>}
 */
export async function createTunnel(localUrl, subdomain = null) {
  try {
    // This will be called on the server side
    // For client-side, we'll use API route
    const response = await fetch('/api/tunnels/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localUrl, subdomain }),
    })

    if (!response.ok) {
      throw new Error('Failed to create tunnel')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating tunnel:', error)
    throw error
  }
}

/**
 * Close a tunnel
 * @param {string} tunnelId - The tunnel ID to close
 */
export async function closeTunnel(tunnelId) {
  try {
    const response = await fetch('/api/tunnels/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tunnelId }),
    })

    if (!response.ok) {
      throw new Error('Failed to close tunnel')
    }

    return await response.json()
  } catch (error) {
    console.error('Error closing tunnel:', error)
    throw error
  }
}

/**
 * Get tunnel status
 * @param {string} tunnelId - The tunnel ID
 */
export async function getTunnelStatus(tunnelId) {
  try {
    const response = await fetch(`/api/tunnels/status?id=${tunnelId}`)
    
    if (!response.ok) {
      throw new Error('Failed to get tunnel status')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting tunnel status:', error)
    return { active: false }
  }
}

/**
 * Parse localhost URL to get port
 */
export function parseLocalhost(url) {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return parseInt(urlObj.port) || 3000
    }
    return null
  } catch (error) {
    // Try to extract port from string like "localhost:3000"
    const match = url.match(/localhost:(\d+)/)
    if (match) {
      return parseInt(match[1])
    }
    return null
  }
}

/**
 * Check if URL is localhost
 */
export function isLocalhost(url) {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

