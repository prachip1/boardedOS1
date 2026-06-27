import Link from 'next/link'
import { FiArrowRight, FiZap, FiUsers, FiTrendingUp, FiCheck, FiStar } from 'react-icons/fi'
import SEO from '../components/SEO'

export default function HomePage() {
  // Only show 3 main features on homepage
  const features = [
    {
      icon: FiUsers,
      title: 'Client Management',
      description: 'Organize and track all your client relationships in one place',
      chip: 'bg-accent-lavender',
    },
    {
      icon: FiZap,
      title: 'Live Preview Sharing',
      description: 'Share your work instantly with temporary preview links',
      chip: 'bg-accent-lime',
    },
    {
      icon: FiTrendingUp,
      title: 'Time Tracking',
      description: 'Track billable hours and generate detailed timesheets',
      chip: 'bg-accent-coral',
    },
  ]

  const steps = [
    {
      n: 1,
      color: '#b8a6ff',
      title: 'Add Client',
      description: 'Create a client profile with all their details and project requirements',
    },
    {
      n: 2,
      color: '#c7f751',
      title: 'Collaborate',
      description: 'Share work, get feedback, track time, and manage deliverables',
    },
    {
      n: 3,
      color: '#ff7a59',
      title: 'Get Paid',
      description: 'Send contracts, create invoices, and receive payments seamlessly',
    },
  ]

  const testimonials = [
    {
      quote: "Boarded transformed how I manage my freelance business. Everything in one place.",
      author: "Sarah Chen",
      role: "Product Designer",
      gradient: 'from-[#c7f751] to-[#b8a6ff]',
    },
    {
      quote: "The live preview feature alone is worth it. Clients love seeing work in real-time.",
      author: "Marcus Rivera",
      role: "Web Developer",
      gradient: 'from-[#b8a6ff] to-[#ff7a59]',
    },
    {
      quote: "Finally, a tool that understands what indie founders actually need.",
      author: "Alex Kim",
      role: "Indie Maker",
      gradient: 'from-[#ff7a59] to-[#c7f751]',
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
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
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
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/dashboard" className="btn btn-accent btn-sm">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* Ambient accent glows */}
          <div className="pointer-events-none absolute -top-20 -left-32 w-[36rem] h-[36rem] rounded-full bg-[#c7f751]/10 blur-[120px]" />
          <div className="pointer-events-none absolute top-10 right-0 w-[32rem] h-[32rem] rounded-full bg-[#b8a6ff]/10 blur-[120px]" />

          <div className="relative max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-medium text-accent">Free during beta</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.05] max-w-4xl">
              <span className="text-text-primary">Your complete</span>
              <br />
              <span className="bg-gradient-to-r from-[#c7f751] via-[#b8a6ff] to-[#ff7a59] bg-clip-text text-transparent">
                client workspace
              </span>
            </h1>

            <p className="text-xl text-text-secondary max-w-2xl mb-10">
              Manage your entire client workflow — from onboarding to delivery — in one clean and simple workspace built for freelancers and indie founders.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <Link href="/dashboard" className="btn btn-accent btn-lg px-8">
                Start for free
                <FiArrowRight size={18} />
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-lg px-8">
                View demo
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-tertiary mb-14">
              <span className="inline-flex items-center gap-2"><FiCheck className="text-accent" size={15} /> No credit card required</span>
              <span className="inline-flex items-center gap-2"><FiCheck className="text-accent" size={15} /> Set up in minutes</span>
              <span className="inline-flex items-center gap-2"><FiCheck className="text-accent" size={15} /> Cancel anytime</span>
            </div>

            {/* Hero board mock — echoes the in-app Kanban */}
            <BoardMock />
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

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="card card-accent group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.chip} text-black mb-6 transition-transform group-hover:-rotate-6`}>
                    <feature.icon size={26} />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/features" className="btn btn-secondary btn-lg">
                Explore More Features
                <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6 bg-background-secondary/50 border-y border-border">
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
              {steps.map((step) => (
                <div key={step.n} className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-black"
                    style={{ backgroundColor: step.color, boxShadow: `0 8px 24px ${step.color}33` }}
                  >
                    {step.n}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-text-secondary">{step.description}</p>
                </div>
              ))}
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
                <div key={index} className="card">
                  <div className="flex items-center gap-1 mb-4 text-accent">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={14} className="fill-current" />
                    ))}
                  </div>
                  <p className="text-text-primary mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full`} />
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
            <div className="relative overflow-hidden bg-background-elevated border border-border rounded-2xl p-12">
              <div className="pointer-events-none absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-accent/10 blur-[100px]" />
              <div className="relative">
                <h2 className="text-4xl font-bold text-text-primary mb-4">
                  Ready to get started?
                </h2>
                <p className="text-lg text-text-secondary mb-8 max-w-2xl">
                  Join hundreds of freelancers and indie founders managing their business with Boarded.
                </p>
                <Link href="/dashboard" className="btn btn-accent btn-lg px-8 inline-flex">
                  Start for free
                  <FiArrowRight size={18} />
                </Link>
                <p className="text-sm text-text-tertiary mt-4">
                  <span className="text-accent">Free during beta</span> • No credit card required
                </p>
              </div>
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

/* A lightweight, non-interactive Kanban mock for the hero — mirrors the real
   board's vibrant columns so the landing page shows the actual product feel. */
function BoardMock() {
  const columns = [
    { name: 'To Do', color: '#b8a6ff', cards: [70, 45] },
    { name: 'In Progress', color: '#c7f751', cards: [85, 55, 40] },
    { name: 'Done', color: '#34d399', cards: [60] },
  ]

  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="absolute inset-0 bg-gradient-radial blur-3xl opacity-40 -z-10" />
      <div className="bg-background-elevated border border-border rounded-xl p-1 shadow-2xl">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <span className="w-3 h-3 rounded-full bg-[#ff7a59]" />
          <span className="w-3 h-3 rounded-full bg-[#c7f751]" />
          <span className="w-3 h-3 rounded-full bg-[#b8a6ff]" />
          <span className="ml-3 text-xs text-text-tertiary">boarded — Project board</span>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-3 gap-4 p-4 md:p-6">
          {columns.map((col) => (
            <div key={col.name} className="rounded-lg bg-background-secondary/40 border border-border/40 p-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-5 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-semibold text-text-primary">{col.name}</span>
                <span
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${col.color}26`, color: col.color }}
                >
                  {col.cards.length}
                </span>
              </div>
              <div className="space-y-2">
                {col.cards.map((w, i) => (
                  <div key={i} className="rounded-md bg-background-elevated border border-border p-2.5">
                    <div className="h-2 rounded bg-text-tertiary/40 mb-2" style={{ width: `${w}%` }} />
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                      <div className="h-1.5 w-8 rounded bg-text-tertiary/25" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
