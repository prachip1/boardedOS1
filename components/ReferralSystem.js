import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FiCopy, FiGift, FiUsers, FiCheck } from 'react-icons/fi'

export default function ReferralSystem() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(false)

  const referralCode = user?.id?.slice(-8).toUpperCase() || 'BOARDED'
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOnTwitter = () => {
    const text = `Just discovered @boardedapp - the best client management tool for freelancers! 🚀\n\nCheck it out: ${referralLink}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const text = `I've been using Boarded for my client management and it's been a game-changer! Perfect for freelancers and indie founders. Check it out: ${referralLink}`
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&summary=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="bg-background-elevated border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <FiGift className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Referral Program</h3>
          <p className="text-sm text-text-secondary">Earn rewards for every friend you refer</p>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">0</p>
          <p className="text-xs text-text-tertiary">Referrals</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">$0</p>
          <p className="text-xs text-text-tertiary">Earned</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">∞</p>
          <p className="text-xs text-text-tertiary">Days Free</p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Your Referral Code
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2 font-mono text-sm">
            {referralCode}
          </div>
          <button
            onClick={copyToClipboard}
            className="btn btn-secondary btn-sm"
          >
            {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
          </button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Your Referral Link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-secondary truncate">
            {referralLink}
          </div>
          <button
            onClick={copyToClipboard}
            className="btn btn-secondary btn-sm"
          >
            {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="mb-6">
        <p className="text-sm font-medium text-text-primary mb-3">Share with friends</p>
        <div className="flex gap-2">
          <button
            onClick={shareOnTwitter}
            className="flex-1 btn btn-secondary btn-sm"
          >
            Share on Twitter
          </button>
          <button
            onClick={shareOnLinkedIn}
            className="flex-1 btn btn-secondary btn-sm"
          >
            Share on LinkedIn
          </button>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="bg-background border border-border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-text-primary mb-2">How it works</h4>
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• Share your referral link with friends</li>
          <li>• They get 1 month free when they sign up</li>
          <li>• You get 1 month free for each successful referral</li>
          <li>• No limit on referrals - earn unlimited free months!</li>
        </ul>
      </div>
    </div>
  )
}
