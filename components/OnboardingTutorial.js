import { useState, useEffect } from 'react'
import { FiArrowRight, FiArrowLeft, FiX, FiCheck, FiZap, FiUsers, FiClock, FiFileText } from 'react-icons/fi'

export default function OnboardingTutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show tutorial after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const steps = [
    {
      title: 'Welcome to Boarded! 🎉',
      description: 'Let\'s take a quick tour of your new workspace. This will only take 2 minutes.',
      icon: FiZap,
      content: (
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiZap className="text-white" size={32} />
          </div>
          <p className="text-text-secondary">
            Boarded is designed specifically for freelancers and indie founders. 
            Everything you need to manage clients, projects, and get paid - all in one place.
          </p>
        </div>
      )
    },
    {
      title: 'Add Your First Client',
      description: 'Start by adding a client to your workspace.',
      icon: FiUsers,
      content: (
        <div className="space-y-4">
          <div className="bg-background-elevated border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">1. Go to Clients</h4>
            <p className="text-sm text-text-secondary">Click on &ldquo;Clients&rdquo; in the sidebar to add your first client.</p>
          </div>
          <div className="bg-background-elevated border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">2. Click &ldquo;Add Client&rdquo;</h4>
            <p className="text-sm text-text-secondary">Fill in their details and project requirements.</p>
          </div>
          <div className="bg-background-elevated border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">3. Set Up Project</h4>
            <p className="text-sm text-text-secondary">Create tasks and start tracking your work.</p>
          </div>
        </div>
      )
    },
    {
      title: 'Track Your Time',
      description: 'Use our built-in time tracker to log billable hours.',
      icon: FiClock,
      content: (
        <div className="space-y-4">
          <div className="bg-background-elevated border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">Start Timer</h4>
            <p className="text-sm text-text-secondary">Click the play button to start tracking time for any project.</p>
          </div>
          <div className="bg-background-elevated border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">Add Notes</h4>
            <p className="text-sm text-text-secondary">Describe what you worked on for accurate billing.</p>
          </div>
          <div className="bg-background-elevated border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">Generate Reports</h4>
            <p className="text-sm text-text-secondary">Export timesheets for invoicing.</p>
          </div>
        </div>
      )
    },
    {
      title: 'Share Work with Clients',
      description: 'Use our unique Live Preview feature to share your work.',
      icon: FiFileText,
      content: (
        <div className="space-y-4">
          <div className="bg-background-elevated border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">Create Preview Link</h4>
            <p className="text-sm text-text-secondary">Go to &ldquo;Live Previews&rdquo; and create a temporary link to your localhost.</p>
          </div>
          <div className="bg-background-elevated border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">Share QR Code</h4>
            <p className="text-sm text-text-secondary">Clients can scan the QR code to view your work on their phone.</p>
          </div>
          <div className="bg-background-elevated border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">Get Feedback</h4>
            <p className="text-sm text-text-secondary">Clients can leave comments and feedback directly.</p>
          </div>
        </div>
      )
    },
    {
      title: 'You\'re All Set! 🚀',
      description: 'Start managing your clients like a pro.',
      icon: FiCheck,
      content: (
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-white" size={32} />
          </div>
          <p className="text-text-secondary mb-4">
            You now know the basics of Boarded. Start by adding your first client and creating some tasks!
          </p>
          <div className="bg-background-elevated border border-border rounded-lg p-4 text-left">
            <h4 className="font-semibold text-text-primary mb-2">Pro Tips:</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Use the dashboard to get a quick overview</li>
              <li>• Set up recurring tasks for regular work</li>
              <li>• Use tags to organize your tasks</li>
              <li>• Enable notifications to stay on top of deadlines</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTutorial = () => {
    setIsVisible(false)
    localStorage.setItem('boarded_tutorial_completed', 'true')
    if (onComplete) onComplete()
  }

  const skipTutorial = () => {
    completeTutorial()
  }

  if (!isVisible) return null

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background-elevated border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Icon className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{currentStepData.title}</h2>
              <p className="text-sm text-text-secondary">{currentStepData.description}</p>
            </div>
          </div>
          <button
            onClick={skipTutorial}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-accent' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-text-tertiary">
              {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="btn btn-ghost btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiArrowLeft size={16} />
              Previous
            </button>

            <div className="flex gap-2">
              <button
                onClick={skipTutorial}
                className="btn btn-ghost btn-sm"
              >
                Skip Tutorial
              </button>
              <button
                onClick={nextStep}
                className="btn btn-primary btn-sm"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
