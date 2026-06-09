import Link from 'next/link'
import { FiUsers, FiTarget, FiHeart, FiAward, FiZap, FiShield, FiGlobe } from 'react-icons/fi'
import SEO from '../components/SEO'

export default function AboutPage() {
  const team = [
    {
      name: 'Prachi',
      role: 'Founder & CEO',
      bio: 'Passionate about empowering freelancers and indie founders to build successful businesses.',
      avatar: 'P'
    },
    {
      name: 'AI Assistant',
      role: 'Co-founder & CTO',
      bio: 'Helping build the future of client management with cutting-edge technology.',
      avatar: 'AI'
    }
  ]

  const values = [
    {
      icon: FiUsers,
      title: 'Freelancer-First',
      description: 'We built Boarded specifically for freelancers and indie founders. Every feature is designed with your workflow in mind.'
    },
    {
      icon: FiTarget,
      title: 'Simplicity',
      description: 'Complex tools create friction. We believe in powerful simplicity - everything you need, nothing you don\'t.'
    },
    {
      icon: FiHeart,
      title: 'Community',
      description: 'We\'re not just building software, we\'re building a community of successful freelancers who support each other.'
    },
    {
      icon: FiZap,
      title: 'Innovation',
      description: 'We\'re constantly innovating to bring you the latest tools and features that give you a competitive edge.'
    }
  ]

  const stats = [
    { number: '1000+', label: 'Happy Users' },
    { number: '50+', label: 'Countries' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ]

  return (
    <>
      <SEO
        title="About - Empowering Freelancers & Indie Founders"
        description="Learn about Boarded's mission to empower freelancers and indie founders with the best client management tools. Built by freelancers, for freelancers."
        keywords="about boarded, freelancer tools, indie founder tools, client management mission, freelancer software company, team behind boarded"
        url="https://boarded.vercel.app/about"
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
                <Link href="/pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Pricing
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
            <div className="max-w-6xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                We&apos;re on a mission to empower freelancers
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl">
                Boarded was born from a simple observation: freelancers and indie founders 
                deserve better tools. We&apos;re building the client management platform 
                that puts you in control of your business.
              </p>
            </div>
          </section>

          {/* Story Section */}
          <section className="py-20 px-6 bg-background-secondary/50">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-6">
                    Our Story
                  </h2>
                  <div className="space-y-4 text-text-secondary">
                    <p>
                      As freelancers ourselves, we experienced the pain of juggling multiple clients, 
                      projects, and deadlines with scattered tools and processes. We knew there had to be 
                      a better way.
                    </p>
                    <p>
                      Boarded started as a simple idea: what if we could create one platform that 
                      handles everything from client onboarding to project delivery? A tool that 
                      grows with you as your business grows.
                    </p>
                    <p>
                      Today, we&apos;re proud to serve thousands of freelancers and indie founders 
                      worldwide, helping them build successful, sustainable businesses.
                    </p>
                  </div>
                </div>
                <div className="bg-background-elevated border border-border rounded-2xl p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <FiHeart className="text-white" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-4">
                      Built with Love
                    </h3>
                    <p className="text-text-secondary">
                      Every feature, every interaction, every detail is crafted with care 
                      to make your work life better.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Our Values
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl">
                  The principles that guide everything we do
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon
                  return (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Icon className="text-white" size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {value.title}
                      </h3>
                      <p className="text-text-secondary">
                        {value.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 px-6 bg-background-secondary/50">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  By the Numbers
                </h2>
                <p className="text-lg text-text-secondary">
                  Our impact in the freelancer community
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-text-secondary">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Meet the Team
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl">
                  The passionate people behind Boarded
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {team.map((member, index) => (
                  <div key={index} className="bg-background-elevated border border-border rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl">
                      {member.avatar}
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-2">
                      {member.name}
                    </h3>
                    <p className="text-accent mb-4">
                      {member.role}
                    </p>
                    <p className="text-text-secondary">
                      {member.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-20 px-6 bg-background-secondary/50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl">
                To democratize success for freelancers and indie founders by providing 
                the tools, resources, and community they need to build thriving businesses.
              </p>
              <div className="bg-background-elevated border border-border rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <FiGlobe className="text-accent" size={24} />
                  <h3 className="text-2xl font-bold text-text-primary">
                    Join Our Community
                  </h3>
                </div>
                <p className="text-text-secondary mb-6 max-w-2xl">
                  Connect with thousands of freelancers, share experiences, 
                  and grow together.
                </p>
                <Link href="/dashboard" className="btn btn-primary btn-lg">
                  Get Started Today
                </Link>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-subtle border border-border rounded-2xl p-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to join us?
                </h2>
                <p className="text-lg text-text-secondary mb-8 max-w-2xl">
                  Start your journey with Boarded today and discover what it means 
                  to have a client management platform that truly understands your needs.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/dashboard" className="btn btn-primary btn-lg">
                    Start Free Trial
                  </Link>
                  <Link href="/demo" className="btn btn-ghost btn-lg">
                    View Demo
                  </Link>
                </div>
                <p className="text-sm text-text-tertiary mt-4">
                  <span style={{ color: '#af81fb' }}>No credit card required</span> • Join thousands of successful freelancers
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
