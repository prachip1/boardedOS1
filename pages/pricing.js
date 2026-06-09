import Link from 'next/link'
import { FiCheck, FiZap, FiStar, FiArrowRight, FiUsers, FiClock, FiShield } from 'react-icons/fi'
import SEO from '../components/SEO'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: FiZap,
      color: 'from-gray-500 to-gray-600',
      features: [
        'Up to 3 clients',
        'Unlimited projects',
        'Basic time tracking',
        'Task management',
        'Email support',
        '1GB file storage'
      ],
      limitations: [
        'No live preview sharing',
        'No client portals',
        'Basic reporting'
      ],
      cta: 'Get Started Free',
      ctaLink: '/dashboard',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'For growing freelancers',
      icon: FiStar,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Unlimited clients',
        'Unlimited projects',
        'Advanced time tracking',
        'Live preview sharing',
        'Client portals',
        'Advanced reporting',
        'Priority support',
        '10GB file storage',
        'Custom branding',
        'API access'
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      ctaLink: '/dashboard',
      popular: true
    },
    {
      name: 'Team',
      price: '$19',
      period: 'per month',
      description: 'For agencies and teams',
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Everything in Pro',
        'Up to 5 team members',
        'Team collaboration',
        'Advanced permissions',
        'Team analytics',
        'White-label options',
        'Custom integrations',
        '50GB file storage',
        'Phone support',
        'Dedicated account manager'
      ],
      limitations: [],
      cta: 'Start Team Trial',
      ctaLink: '/dashboard',
      popular: false
    }
  ]

  const faqs = [
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate any billing differences.'
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'Your data is safe! You can export all your data before canceling, and we\'ll keep it for 30 days in case you want to reactivate your account.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us for a full refund.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.'
    },
    {
      question: 'Can I use Boarded for my agency?',
      answer: 'Absolutely! Our Team plan is designed specifically for agencies and teams. It includes advanced collaboration features and team management tools.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.'
    }
  ]

  return (
    <>
      <SEO
        title="Pricing - Simple & Transparent Plans"
        description="Simple, transparent pricing for freelancers and agencies. Start free, scale as you grow. Free plan available during beta."
        keywords="freelancer pricing, client management pricing, project management pricing, time tracking pricing, invoicing software pricing, free plan, pro plan, team plan"
        url="https://boarded.vercel.app/pricing"
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
                <Link href="/features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Features
                </Link>
                <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  About
                </Link>
                <Link href="/demo" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Demo
                </Link>
                <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ backgroundColor: '#af81fb', borderColor: '#af81fb' }}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="text-white">Simple pricing</span>
                <br />
                <span className="bg-gradient-to-r from-white via-text-secondary to-white bg-clip-text text-transparent">
                  for everyone
                </span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
                Start free and scale as you grow. No hidden fees, no surprises. 
                Choose the plan that fits your business needs.
              </p>
              
              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-2 bg-background-elevated border border-border rounded-lg p-1 mb-12">
                <span className="px-4 py-2 text-sm font-medium text-text-primary">Monthly</span>
                <span className="px-4 py-2 text-sm text-text-tertiary">Annual (Save 20%)</span>
              </div>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="pb-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan, index) => {
                  const Icon = plan.icon
                  return (
                    <div 
                      key={index}
                      className={`relative bg-background-elevated border rounded-2xl p-8 ${
                        plan.popular 
                          ? 'border-accent shadow-2xl shadow-accent/20' 
                          : 'border-border'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-8">
                        <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                          <Icon className="text-white" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                        <p className="text-text-secondary mb-4">{plan.description}</p>
                        <div className="mb-4">
                          <span className="text-5xl font-bold text-text-primary">{plan.price}</span>
                          <span className="text-text-tertiary">/{plan.period}</span>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-3">
                            <FiCheck className="text-green-500 flex-shrink-0" size={20} />
                            <span className="text-text-primary">{feature}</span>
                          </div>
                        ))}
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-center gap-3 opacity-50">
                            <div className="w-5 h-5 rounded-full border border-text-tertiary flex-shrink-0"></div>
                            <span className="text-text-tertiary">{limitation}</span>
                          </div>
                        ))}
                      </div>

                      <Link 
                        href={plan.ctaLink}
                        className={`w-full btn ${
                          plan.popular ? 'btn-primary' : 'btn-secondary'
                        } btn-lg`}
                      >
                        {plan.cta}
                        <FiArrowRight size={18} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 px-6 bg-background-secondary/50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Frequently asked questions
                </h2>
                <p className="text-lg text-text-secondary">
                  Everything you need to know about our pricing and plans
                </p>
              </div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-background-elevated border border-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-text-secondary">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-subtle border border-border rounded-2xl p-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to get started?
                </h2>
                <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                  Join thousands of freelancers and agencies who trust Boarded 
                  to manage their client relationships and grow their business.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/dashboard" className="btn btn-primary btn-lg">
                    Start Free Trial
                  </Link>
                  <Link href="/demo" className="btn btn-ghost btn-lg">
                    View Demo
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
