import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FiPlay, FiPause, FiRefreshCw, FiEye, FiUsers, FiClock, FiFileText, FiDollarSign } from 'react-icons/fi'

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const demoSteps = [
    {
      title: 'Dashboard Overview',
      description: 'Get a bird\'s eye view of all your projects and clients',
      icon: FiEye,
      content: 'dashboard'
    },
    {
      title: 'Client Management',
      description: 'Add and manage all your client relationships',
      icon: FiUsers,
      content: 'clients'
    },
    {
      title: 'Task Management',
      description: 'Organize work with our Kanban board',
      icon: FiFileText,
      content: 'tasks'
    },
    {
      title: 'Time Tracking',
      description: 'Track billable hours and generate reports',
      icon: FiClock,
      content: 'time-tracking'
    },
    {
      title: 'Live Previews',
      description: 'Share your work with clients in real-time',
      icon: FiEye,
      content: 'previews'
    },
    {
      title: 'Invoicing',
      description: 'Create professional invoices and get paid',
      icon: FiDollarSign,
      content: 'invoices'
    }
  ]

  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoSteps.length)
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, demoSteps.length])

  const toggleDemo = () => {
    setIsPlaying(!isPlaying)
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const currentStepData = demoSteps[currentStep]
  const Icon = currentStepData.icon

  return (
    <>
      <Head>
        <title>Live Demo - Boarded</title>
        <meta name="description" content="Try Boarded with our interactive demo. See how it works before you sign up." />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background-secondary">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-text-primary">Boarded Demo</h1>
                  <p className="text-sm text-text-tertiary">Interactive preview</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={resetDemo}
                  className="btn btn-ghost btn-sm"
                >
                  <FiRefreshCw size={16} />
                  Reset
                </button>
                <button
                  onClick={toggleDemo}
                  className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                >
                  {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
                  {isPlaying ? 'Pause' : 'Play'} Demo
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Demo Controls */}
          <div className="mb-8">
            <div className="bg-background-elevated border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Icon className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">{currentStepData.title}</h2>
                    <p className="text-text-secondary">{currentStepData.description}</p>
                  </div>
                </div>
                <div className="text-sm text-text-tertiary">
                  {currentStep + 1} of {demoSteps.length}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-border rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                />
              </div>

              {/* Step Indicators */}
              <div className="flex items-center justify-center gap-2">
                {demoSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentStep(index)
                      setIsPlaying(false)
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep 
                        ? 'bg-accent' 
                        : index < currentStep 
                          ? 'bg-accent/50' 
                          : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Demo Content */}
          <div className="bg-background-elevated border border-border rounded-xl overflow-hidden">
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-white" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {currentStepData.title} Demo
                </h3>
                <p className="text-text-secondary mb-6 max-w-md">
                  This is where you would see the actual {currentStepData.content} interface. 
                  In the real app, you would be able to interact with all the features.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-background border border-border rounded-lg px-4 py-2">
                    <span className="text-sm text-text-secondary">Interactive UI would be here</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoSteps.map((step, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  index === currentStep 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border bg-background-elevated hover:border-border-hover'
                }`}
                onClick={() => {
                  setCurrentStep(index)
                  setIsPlaying(false)
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === currentStep 
                      ? 'bg-accent' 
                      : 'bg-background'
                  }`}>
                    <step.icon className={`${
                      index === currentStep ? 'text-white' : 'text-text-primary'
                    }`} size={16} />
                  </div>
                  <h4 className="font-semibold text-text-primary">{step.title}</h4>
                </div>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-subtle border border-border rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-text-primary mb-4">
                Ready to try the real thing?
              </h3>
              <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                This demo shows just a glimpse of what Boarded can do. 
                Sign up for free to access the full experience and start managing your clients like a pro.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard" className="btn btn-primary btn-lg">
                  Start Free Trial
                </Link>
                <Link href="/" className="btn btn-ghost btn-lg">
                  Learn More
                </Link>
              </div>
              <p className="text-sm text-text-tertiary mt-4">
                No credit card required • Free during beta
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
