import Link from 'next/link'
import { FiUsers, FiZap, FiTrendingUp, FiShield, FiCode, FiGlobe, FiClock, FiFileText, FiDollarSign, FiMessageSquare, FiFolder, FiBell, FiCheck, FiArrowRight } from 'react-icons/fi'
import SEO from '../components/SEO'

export default function FeaturesPage() {
  const features = [
    {
      icon: FiUsers,
      title: 'Client Management',
      description: 'Organize and track all your client relationships in one place',
      details: [
        'Complete client profiles with contact information',
        'Project history and relationship tracking',
        'Client communication logs',
        'Custom client fields and tags',
        'Client portal access for transparency',
        'Bulk client operations and imports'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FiZap,
      title: 'Live Preview Sharing',
      description: 'Share your work instantly with temporary preview links',
      details: [
        'One-click localhost tunneling',
        'QR code generation for mobile access',
        'Temporary links with expiration',
        'Real-time collaboration features',
        'Client feedback collection',
        'Version control and history'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FiTrendingUp,
      title: 'Time Tracking',
      description: 'Track billable hours and generate detailed timesheets',
      details: [
        'One-click timer start/stop',
        'Automatic time categorization',
        'Detailed time reports and analytics',
        'Billable vs non-billable hours',
        'Time tracking by project and client',
        'Export to various formats'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FiShield,
      title: 'Contracts & Invoices',
      description: 'Professional contracts with digital signatures and automated invoicing',
      details: [
        'Digital signature integration',
        'Automated invoice generation',
        'Payment tracking and reminders',
        'Contract templates and customization',
        'Legal compliance features',
        'Multi-currency support'
      ],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: FiCode,
      title: 'Project Collaboration',
      description: 'Get feedback and manage deliverables with your clients',
      details: [
        'Real-time project updates',
        'Client feedback and approval workflows',
        'File sharing and version control',
        'Project milestone tracking',
        'Team collaboration tools',
        'Integration with popular tools'
      ],
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: FiGlobe,
      title: 'File Management',
      description: 'Secure file sharing with expiring links and access control',
      details: [
        'Secure cloud storage',
        'Expiring download links',
        'Access control and permissions',
        'File versioning and history',
        'Bulk file operations',
        'Integration with external storage'
      ],
      color: 'from-teal-500 to-blue-500'
    },
    {
      icon: FiClock,
      title: 'Task Management',
      description: 'Organize work with our intuitive Kanban board system',
      details: [
        'Drag-and-drop Kanban boards',
        'Custom task statuses and workflows',
        'Task dependencies and subtasks',
        'Priority levels and due dates',
        'Team task assignment',
        'Progress tracking and analytics'
      ],
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: FiFileText,
      title: 'Timesheets',
      description: 'Generate professional timesheets for billing and reporting',
      details: [
        'Automated timesheet generation',
        'Customizable timesheet templates',
        'Client-specific timesheet views',
        'Approval workflows',
        'Export to PDF and Excel',
        'Integration with accounting software'
      ],
      color: 'from-cyan-500 to-teal-500'
    },
    {
      icon: FiDollarSign,
      title: 'Financial Management',
      description: 'Track income, expenses, and profitability across all projects',
      details: [
        'Revenue tracking and analytics',
        'Expense management and categorization',
        'Profitability analysis by project',
        'Tax reporting and preparation',
        'Financial forecasting',
        'Integration with accounting tools'
      ],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: FiMessageSquare,
      title: 'Communication Hub',
      description: 'Centralized communication with clients and team members',
      details: [
        'In-app messaging system',
        'Email integration and tracking',
        'Video call scheduling',
        'Communication history',
        'Automated follow-ups',
        'Client portal messaging'
      ],
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: FiFolder,
      title: 'Document Management',
      description: 'Organize and manage all your project documents',
      details: [
        'Centralized document storage',
        'Document templates and libraries',
        'Version control and history',
        'Collaborative editing',
        'Document approval workflows',
        'Search and tagging system'
      ],
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: FiBell,
      title: 'Smart Notifications',
      description: 'Stay on top of deadlines and important updates',
      details: [
        'Customizable notification preferences',
        'Email and in-app notifications',
        'Deadline reminders and alerts',
        'Client activity notifications',
        'Team collaboration alerts',
        'Mobile push notifications'
      ],
      color: 'from-rose-500 to-pink-500'
    }
  ]

  const categories = [
    {
      name: 'Core Features',
      description: 'Essential tools for managing your freelance business',
      features: [0, 1, 2, 3]
    },
    {
      name: 'Project Management',
      description: 'Tools to organize and track your work',
      features: [4, 5, 6, 7]
    },
    {
      name: 'Business Tools',
      description: 'Advanced features for growing your business',
      features: [8, 9, 10, 11]
    }
  ]

  return (
    <>
      <SEO
        title="Features - Complete Client Management Platform"
        description="Discover all the powerful features that make Boarded the perfect client management platform for freelancers and indie founders. Client management, time tracking, invoicing, contracts, and more."
        keywords="client management features, freelancer tools, project management features, time tracking, invoicing software, contract management, task management, file sharing, live preview sharing"
        url="https://boarded.vercel.app/features"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background-secondary">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-lg font-medium text-text-primary">boarded.</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link href="/pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Pricing
                </Link>
                <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  About
                </Link>
                <Link href="/demo" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Demo
                </Link>
                <Link href="/dashboard" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Everything you need to succeed as a freelancer
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl">
                From client management to project delivery, Boarded provides all the tools 
                you need to build a successful freelance business. No more juggling multiple 
                apps or losing track of important details.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link href="/dashboard" className="btn btn-primary btn-lg">
                  Start Free Trial
                  <FiArrowRight size={18} />
                </Link>
                <Link href="/demo" className="btn btn-ghost btn-lg">
                  View Demo
                </Link>
              </div>
            </div>
          </section>

          {/* Features by Category */}
          {categories.map((category, categoryIndex) => (
            <section key={categoryIndex} className={`py-20 px-6 ${categoryIndex % 2 === 1 ? 'bg-background-secondary/50' : ''}`}>
              <div className="max-w-6xl mx-auto">
                <div className="mb-16">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    {category.name}
                  </h2>
                  <p className="text-lg text-text-secondary max-w-2xl">
                    {category.description}
                  </p>
                </div>

                <div className="space-y-6">
                  {category.features.map((featureIndex) => {
                    const feature = features[featureIndex]
                    const Icon = feature.icon
                    return (
                      <div key={featureIndex} className="bg-background-elevated border border-border rounded-2xl p-8 hover:border-border-hover transition-all">
                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Left Column - Icon, Title, Description */}
                          <div className="flex flex-col items-center text-center">
                            <div className="mb-6">
                              <div className={`w-20 h-20 relative transform rotate-12`}>
                                {/* Shadow behind icon - gray/black only - always glowing */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl blur-lg opacity-40"></div>
                                
                                {/* Icon with no background - just the icon */}
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <Icon className="text-white" size={40} />
                                </div>
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-3">
                              {feature.title}
                            </h3>
                            <p className="text-text-secondary text-lg">
                              {feature.description}
                            </p>
                          </div>

                          {/* Right Column - Feature Details */}
                          <div className="flex items-start">
                            <ol className="grid grid-cols-1 gap-3 w-full list-decimal list-inside">
                              {feature.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="text-text-secondary text-base">
                                  {detail}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          ))}

          {/* Integration Section */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Integrates with your favorite tools
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl">
                  Boarded works seamlessly with the tools you already use
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {['Slack', 'Discord', 'Zoom', 'Google Drive', 'Dropbox', 'Stripe', 'PayPal', 'QuickBooks', 'Xero', 'GitHub', 'Figma', 'Notion'].map((tool, index) => (
                  <div key={index} className="bg-background-elevated border border-border rounded-xl p-6 text-center hover:border-border-hover transition-all">
                    <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-text-primary font-semibold text-sm">
                        {tool.charAt(0)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">{tool}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-subtle border border-border rounded-2xl p-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to experience all these features?
                </h2>
                <p className="text-lg text-text-secondary mb-8 max-w-2xl">
                  Join thousands of freelancers who are already using Boarded 
                  to streamline their workflow and grow their business.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/dashboard" className="btn btn-primary btn-lg">
                    Start Free Trial
                    <FiArrowRight size={18} />
                  </Link>
                  <Link href="/demo" className="btn btn-ghost btn-lg">
                    View Interactive Demo
                  </Link>
                </div>
                <p className="text-sm text-text-tertiary mt-4">
                  <span style={{ color: '#af81fb' }}>No credit card required</span> • 14-day free trial • Cancel anytime
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-medium text-white">boarded.</span>
                </div>
                <p className="text-sm text-text-tertiary">
                  Your complete client workspace for freelancers and indie founders.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li><Link href="/features" className="hover:text-text-primary transition-colors">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link></li>
                  <li><Link href="/demo" className="hover:text-text-primary transition-colors">Demo</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li><a href="#" className="hover:text-text-primary transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-text-primary transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-text-primary transition-colors">Community</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li><Link href="/about" className="hover:text-text-primary transition-colors">About</Link></li>
                  <li><a href="#" className="hover:text-text-primary transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-text-primary transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-text-tertiary">
                © 2025 Boarded. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-text-tertiary">
                <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-text-primary transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
