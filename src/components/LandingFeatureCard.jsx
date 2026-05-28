import React from 'react'

function LandingFeatureCard({ icon, title, description, color }) {
  return (
    <div className="group">
      <div className={`bg-gradient-to-br ${color} p-0.5 rounded-lg h-full cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
        <div className="bg-slate-800 rounded-lg p-6 h-full">
          <div className="text-4xl mb-4">{icon}</div>
          <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default LandingFeatureCard
