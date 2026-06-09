import { useEffect, useRef, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import { FiDownload } from 'react-icons/fi'

export default function QRCodeDisplay({ url, title }) {
  const canvasRef = useRef(null)
  const [qrGenerated, setQrGenerated] = useState(false)

  useEffect(() => {
    if (url && canvasRef.current) {
      generateQR()
    }
  }, [url, generateQR])

  const generateQR = useCallback(async () => {
    try {
      await QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      })
      setQrGenerated(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }, [url])

  const downloadQR = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `${title || 'preview'}-qr-code.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas 
        ref={canvasRef} 
        className="border-4 border-white rounded-lg shadow-lg"
      />
      {qrGenerated && (
        <button
          onClick={downloadQR}
          className="btn btn-secondary btn-sm"
        >
          <FiDownload size={14} />
          Download QR Code
        </button>
      )}
      <p className="text-xs text-text-tertiary text-center">
        Scan with phone camera to open
      </p>
    </div>
  )
}

