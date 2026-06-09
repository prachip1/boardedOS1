import { useState } from 'react'
import { FiTerminal, FiCopy, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

export default function TunnelSetup({ localUrl, onTunnelCreated }) {
  const [tunnelUrl, setTunnelUrl] = useState('')
  const [step, setStep] = useState(1)

  // Extract port from localhost URL
  const extractPort = (url) => {
    try {
      const urlObj = new URL(url)
      return parseInt(urlObj.port) || 3000
    } catch (error) {
      const match = url.match(/localhost:(\d+)/)
      return match ? parseInt(match[1]) : 3000
    }
  }

  const port = extractPort(localUrl)
  const tunnelCommand = `npx localtunnel --port ${port} --local-host 127.0.0.1`
  const tunnelCommandWithOpen = `npx localtunnel --port ${port} --local-host 127.0.0.1 --open`

  const copyCommand = () => {
    navigator.clipboard.writeText(tunnelCommand)
    alert('Command copied!')
  }

  const copyNgrokCommand = () => {
    navigator.clipboard.writeText(`npx ngrok http ${port}`)
    alert('ngrok command copied!')
  }

  const copyServeoCommand = () => {
    navigator.clipboard.writeText(`ssh -R 80:localhost:${port} serveo.net`)
    alert('serveo command copied!')
  }

  const handleTunnelUrl = (e) => {
    e.preventDefault()
    if (tunnelUrl.trim()) {
      onTunnelCreated(tunnelUrl.trim())
    }
  }

  return (
    <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <FiTerminal className="text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Create Public Tunnel
            </h3>
            <p className="text-sm text-text-secondary">
              Make your localhost accessible to clients
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Run Command */}
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border-2 ${step === 1 ? 'border-blue-500 bg-blue-500/5' : 'border-border'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step > 1 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <h4 className="text-sm font-semibold text-text-primary">
              Run this command in your terminal
            </h4>
          </div>

          <div className="bg-black rounded-lg p-4 mb-3">
            <code className="text-green-400 text-sm font-mono">
              {tunnelCommand}
            </code>
          </div>

          <button
            onClick={copyCommand}
            className="btn btn-secondary btn-sm w-full"
          >
            <FiCopy size={14} />
            Copy Command
          </button>

          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-200 flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={14} />
              <span>
                <strong>IPv4/IPv6 Issue:</strong> If the tunnel URL asks for IPv4/IPv6 addresses, 
                the command above includes <code className="bg-black/20 px-1 rounded">--local-host 127.0.0.1</code> to fix this.
              </span>
            </p>
          </div>

          <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-200 flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={14} />
              <span>
                <strong>If still having issues:</strong> Try: <code className="bg-black/20 px-1 rounded">npx localtunnel --port {port} --local-host localhost</code>
              </span>
            </p>
          </div>
        </div>

        {/* Step 2: Paste URL */}
        <div className={`p-4 rounded-lg border-2 ${step === 2 ? 'border-blue-500 bg-blue-500/5' : 'border-border'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h4 className="text-sm font-semibold text-text-primary">
              Paste the generated URL here
            </h4>
          </div>

          <form onSubmit={handleTunnelUrl} className="space-y-3">
            <input
              type="url"
              value={tunnelUrl}
              onChange={(e) => setTunnelUrl(e.target.value)}
              onFocus={() => setStep(2)}
              placeholder="https://abc123.loca.lt"
              className="input"
              required
            />
            
            <p className="text-xs text-text-tertiary">
              After running the command, copy the URL that appears (looks like: https://xyz.loca.lt)
            </p>

            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              <FiCheckCircle size={16} />
              Use This Tunnel URL
            </button>
          </form>
        </div>

        {/* Troubleshooting */}
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h4 className="text-sm font-semibold text-red-200 mb-3">
            🔧 Troubleshooting IPv4/IPv6 Issue
          </h4>
          <div className="space-y-2 text-xs text-red-200/80">
            <p><strong>Problem:</strong> Tunnel URL asks for IPv4/IPv6 addresses</p>
            <p><strong>Solution 1:</strong> Use the updated command above with <code className="bg-black/20 px-1 rounded">--local-host 127.0.0.1</code></p>
            <p><strong>Solution 2:</strong> Try <code className="bg-black/20 px-1 rounded">npx localtunnel --port {port} --local-host localhost</code></p>
            <p><strong>Solution 3:</strong> Use ngrok instead (see below) - more reliable</p>
          </div>
        </div>

        {/* Alternative Services */}
        <div className="p-4 bg-background-elevated rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-text-primary mb-3">
            🔄 Alternative Tunnel Services (More Reliable)
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h5 className="text-xs font-semibold text-green-200 mb-1">ngrok (Recommended)</h5>
              <p className="text-xs text-green-200/80 mb-2">Most reliable, no password needed</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-black/20 px-2 py-1 rounded flex-1">
                  npx ngrok http {port}
                </code>
                <button
                  onClick={copyNgrokCommand}
                  className="btn btn-secondary btn-xs"
                >
                  <FiCopy size={12} />
                </button>
              </div>
            </div>
            
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h5 className="text-xs font-semibold text-purple-200 mb-1">serveo.net</h5>
              <p className="text-xs text-purple-200/80 mb-2">Simple SSH tunnel, no installation</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-black/20 px-2 py-1 rounded flex-1">
                  ssh -R 80:localhost:{port} serveo.net
                </code>
                <button
                  onClick={copyServeoCommand}
                  className="btn btn-secondary btn-xs"
                >
                  <FiCopy size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="p-4 bg-background-elevated rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-text-primary mb-2">
            💡 How it works
          </h4>
          <ul className="text-xs text-text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-accent">1.</span>
              <span>Run any tunnel command to create a public URL that forwards to your localhost</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">2.</span>
              <span>Your client can access this URL from anywhere in the world</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">3.</span>
              <span>The preview link tracks views and auto-expires after your set time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">4.</span>
              <span>Keep the terminal running while clients need access</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

