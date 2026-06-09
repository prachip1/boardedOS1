import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import DashboardOverview from '../components/Dashboard/DashboardOverview'
import ReferralSystem from '../components/ReferralSystem'
import OnboardingTutorial from '../components/OnboardingTutorial'

export default function Dashboard() {
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    // Check if user has completed tutorial
    const tutorialCompleted = localStorage.getItem('boarded_tutorial_completed')
    if (!tutorialCompleted) {
      setShowTutorial(true)
    }
  }, [])

  const handleTutorialComplete = () => {
    setShowTutorial(false)
  }

  return (
    <>
      <Head>
        <title>Dashboard - Boarded</title>
        <meta name="description" content="Manage your entire client workflow from onboarding to delivery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <DashboardOverview />
        
        {/* Referral System */}
        <div className="mt-8">
          <ReferralSystem />
        </div>

        {/* Onboarding Tutorial */}
        {showTutorial && (
          <OnboardingTutorial onComplete={handleTutorialComplete} />
        )}
      </Layout>
    </>
  )
}

