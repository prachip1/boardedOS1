import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FiArrowRight, FiCheck, FiZap, FiShield, FiUsers, FiTrendingUp, FiCode, FiGlobe, FiSun, FiMoon } from 'react-icons/fi'
import SEO from '../components/SEO'

export default function HomePage() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Check for saved theme preference or default to 'dark'
    const savedTheme = localStorage.getItem('boarded_theme') || 'dark'
    setTheme(savedTheme)
    
    // Apply theme to document
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('boarded_theme', newTheme)
    
    if (newTheme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  // Only show 3 main features on homepage
  const features = [
    {
      icon: FiUsers,
      title: 'Client Management',
      description: 'Organize and track all your client relationships in one place',
    },
    {
      icon: FiZap,
      title: 'Live Preview Sharing',
      description: 'Share your work instantly with temporary preview links',
    },
    {
      icon: FiTrendingUp,
      title: 'Time Tracking',
      description: 'Track billable hours and generate detailed timesheets',
    },
  ]

  const testimonials = [
    {
      quote: "Boarded transformed how I manage my freelance business. Everything in one place.",
      author: "Sarah Chen",
      role: "Product Designer",
    },
    {
      quote: "The live preview feature alone is worth it. Clients love seeing work in real-time.",
      author: "Marcus Rivera",
      role: "Web Developer",
    },
    {
      quote: "Finally, a tool that understands what indie founders actually need.",
      author: "Alex Kim",
      role: "Indie Maker",
    },
  ]

  return (
    <>
      <SEO
        title="Boarded - Client Management for Freelancers & Indie Founders"
        description="Manage your entire client workflow from onboarding to delivery in one clean workspace built for freelancers and indie founders. Free during beta."
        keywords="client management, freelancer tools, project management, time tracking, invoicing, contracts, freelancer software, indie founder tools, client workspace"
        url="https://boarded.vercel.app"
      />

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-text-primary">boarded.</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</Link>
              <Link href="/pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</Link>
              <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">About</Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ backgroundColor: '#af81fb', borderColor: '#af81fb' }}>
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#af81fb]/10 border border-[#af81fb]/20 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#af81fb]"></div>
              <span className="text-xs font-medium" style={{ color: '#af81fb' }}>Free during beta</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight max-w-4xl">
              <span className="text-text-primary">Your complete</span>
              <br />
              <span className="bg-gradient-to-r from-[#c4a3ff] via-[#af81fb] to-[#8b5cf6] bg-clip-text text-transparent">
                client workspace
              </span>
            </h1>
            
            <p className="text-xl text-text-secondary max-w-2xl mb-10">
              Manage your entire client workflow — from onboarding to delivery — in one clean and simple workspace built for freelancers and indie founders.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Link href="/dashboard" className="btn btn-primary btn-lg px-8">
                Start for free
                <FiArrowRight size={18} />
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-lg px-8">
                View demo
              </Link>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-radial blur-3xl opacity-50 -z-10"></div>
              <div className="bg-background-elevated border border-border rounded-xl p-1 shadow-2xl">
                <div className="bg-gradient-subtle rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white border border-border rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FiZap className="text-black" size={32} />
                    </div>
                    <p className="text-text-secondary">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl">
                Built with the tools and workflows that successful freelancers and indie founders rely on every day.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                return (
                  <div key={index} className="group bg-background-secondary border border-border rounded-xl p-8 hover:border-border-hover transition-all hover:shadow-subtle relative overflow-hidden">
                    {/* Icon centered at top */}
                    <div className="flex justify-center mb-6">
                      <div className={`w-20 h-20 relative transform rotate-12`}>
                        {/* Shadow behind icon - gray/black only - always glowing */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl blur-lg opacity-40"></div>
                        
                        {/* Icon with no background - just the icon */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          <feature.icon className="text-text-primary" size={48} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Title and description centered below icon */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Explore More Features Button */}
            <div className="text-center mt-12">
              <Link href="/features" className="btn btn-primary btn-lg">
                Explore More Features
                <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6 bg-background-secondary/50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Simple workflow, powerful results
              </h2>
              <p className="text-lg text-text-secondary">
                From first contact to final delivery
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white border border-border rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-black relative">
                  1
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-green"></div>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Add Client</h3>
                <p className="text-text-secondary">
                  Create a client profile with all their details and project requirements
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white border border-border rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-black relative">
                  2
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-blue"></div>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Collaborate</h3>
                <p className="text-text-secondary">
                  Share work, get feedback, track time, and manage deliverables
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white border border-border rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-black relative">
                  3
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-purple"></div>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Get Paid</h3>
                <p className="text-text-secondary">
                  Send contracts, create invoices, and receive payments seamlessly
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Loved by freelancers worldwide
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-background-secondary border border-border rounded-xl p-6">
                  <p className="text-text-primary mb-4 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#af81fb] to-[#8b5cf6] rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{testimonial.author}</p>
                      <p className="text-xs text-text-tertiary">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-background-elevated border border-border rounded-2xl p-12 shadow-subtle">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg text-text-secondary mb-8 max-w-2xl">
                Join hundreds of freelancers and indie founders managing their business with Boarded.
              </p>
              <Link href="/dashboard" className="btn btn-primary btn-lg px-8 inline-flex">
                Start for free
                <FiArrowRight size={18} />
              </Link>
              <p className="text-sm text-text-tertiary mt-4">
                <span style={{ color: '#af81fb' }}>Free during beta</span> • No credit card required
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-medium text-text-primary">boarded.</span>
                </div>
                <p className="text-sm text-text-tertiary">
                  Your complete client workspace for freelancers and indie founders.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li><Link href="/features" className="hover:text-text-primary transition-colors">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link></li>
                  <li><Link href="/demo" className="hover:text-text-primary transition-colors">Demo</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li><a href="#" className="hover:text-text-primary transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-text-primary transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-text-primary transition-colors">Community</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li><Link href="/about" className="hover:text-text-primary transition-colors">About</Link></li>
                  <li><a href="#" className="hover:text-text-primary transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-text-primary transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-text-tertiary">
                © 2026 Boarded. All rights reserved.
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

