import React, { useState } from 'react'
import LandingFeatureCard from './LandingFeatureCard'

function LandingPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const features = [
    {
      icon: '🧹',
      title: 'Data Cleaning',
      description: 'Advanced cleaning engine with automated rules and custom pipelines',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📊',
      title: 'Visualizations',
      description: 'Create stunning interactive charts and dashboards',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🤖',
      title: 'AI Insights',
      description: 'Get intelligent insights powered by machine learning',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '💬',
      title: 'NL Chat',
      description: 'Query your data using natural language',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '🧮',
      title: 'Computations',
      description: 'Run complex calculations and transformations',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: '⚙️',
      title: 'Data Manager',
      description: 'Manage and organize your datasets efficiently',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  return (
    <div className="w-full">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AX</span>
            </div>
            <h1 className="text-2xl font-bold text-white">AnalyticsX</h1>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AnalyticsX</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Your comprehensive analytics platform for data cleaning, visualization, and AI-powered insights
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
              Explore Platform
            </button>
            <button className="border border-slate-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <LandingFeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-blue-400 mb-2">100K+</p>
            <p className="text-gray-400">Records Processed</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-cyan-400 mb-2">50+</p>
            <p className="text-gray-400">Cleaning Rules</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-purple-400 mb-2">25+</p>
            <p className="text-gray-400">Visualizations</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-pink-400 mb-2">99.9%</p>
            <p className="text-gray-400">Uptime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-400">
          <p>&copy; 2026 AnalyticsX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
