import React from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <nav className="bg-slate-800 border-b border-slate-700 p-4">
        <h1 className="text-2xl font-bold text-white">AnalyticsX</h1>
      </nav>
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to AnalyticsX</h2>
          <p className="text-gray-300 text-lg">Your analytics platform is loading...</p>
        </div>
      </main>
    </div>
  )
}

export default App
