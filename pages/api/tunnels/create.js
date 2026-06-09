// API Route to create localtunnel
// This runs on the server side

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { localUrl, subdomain } = req.body

    // Extract port from localhost URL
    const port = extractPort(localUrl)
    if (!port) {
      return res.status(400).json({ error: 'Invalid localhost URL' })
    }

    // Note: localtunnel needs to run on the CLIENT side (user's machine)
    // This API endpoint provides instructions
    
    return res.status(200).json({
      success: true,
      message: 'To create tunnel, user needs to run localtunnel on their machine',
      instructions: {
        install: 'npm install -g localtunnel',
        run: `lt --port ${port} --subdomain ${subdomain || 'random'}`,
      },
      port,
      subdomain,
    })
  } catch (error) {
    console.error('Tunnel creation error:', error)
    return res.status(500).json({ error: error.message })
  }
}

function extractPort(url) {
  try {
    const urlObj = new URL(url)
    return parseInt(urlObj.port) || 3000
  } catch (error) {
    const match = url.match(/localhost:(\d+)/)
    return match ? parseInt(match[1]) : null
  }
}

