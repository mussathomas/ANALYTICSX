import { motion } from "framer-motion";
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { Activity, ShieldCheck, Cpu, TrendingUp, Sparkles, Users, BarChart3 } from "lucide-react";
import LandingFeatureCard from "./LandingFeatureCard.jsx";

const heroMetrics = [
  { label: "Conversion rate", value: "42.6%", delta: "+8.4%" },
  { label: "Session growth", value: "38.1%", delta: "+5.2%" },
  { label: "Customer retention", value: "91.7%", delta: "+3.9%" },
];

const platformStats = [
  { label: "Reports Generated", value: "10K+" },
  { label: "Active Users", value: "500+" },
  { label: "Uptime", value: "99.9%" },
  { label: "Data Points", value: "120M+" },
];

const features = [
  {
    title: "Real-Time Analytics",
    description: "Visualize live KPI streams, activity flows and telemetry in a single viewport.",
    icon: Activity,
    accent: "#3B82F6",
  },
  {
    title: "AI-Powered Insights",
    description: "Auto-generate recommendations and anomaly alerts with intelligent forecasting.",
    icon: Sparkles,
    accent: "#06B6D4",
  },
  {
    title: "Interactive Dashboards",
    description: "Drag, filter and drill into data with responsive widget panels and charts.",
    icon: BarChart3,
    accent: "#8B5CF6",
  },
  {
    title: "Data Export & Reporting",
    description: "Export reports in seconds with curated PDF, CSV and insight summaries.",
    icon: Cpu,
    accent: "#F97316",
  },
  {
    title: "Predictive Analytics",
    description: "Plan ahead with trend models, forecast scenarios and seasonality signals.",
    icon: TrendingUp,
    accent: "#22C55E",
  },
  {
    title: "Secure Cloud Infrastructure",
    description: "Enterprise-grade safety, compliance and 24/7 monitoring for every client.",
    icon: ShieldCheck,
    accent: "#0EA5E9",
  },
];

const revenueData = [
  { month: "Jan", revenue: 52, value: 45 },
  { month: "Feb", revenue: 75, value: 70 },
  { month: "Mar", revenue: 86, value: 78 },
  { month: "Apr", revenue: 92, value: 84 },
  { month: "May", revenue: 109, value: 97 },
  { month: "Jun", revenue: 124, value: 110 },
];

const userGrowth = [
  { week: "W1", users: 420, sessions: 520 },
  { week: "W2", users: 550, sessions: 600 },
  { week: "W3", users: 630, sessions: 710 },
  { week: "W4", users: 760, sessions: 820 },
];

const activityData = [
  { label: "Data ingest", value: "24.7%" },
  { label: "Queries", value: "18.9%" },
  { label: "Alerts", value: "12.4%" },
  { label: "Bot actions", value: "43.9%" },
];

const segmentData = [
  { name: "Sales", value: 42 },
  { name: "Marketing", value: 26 },
  { name: "Operations", value: 20 },
  { name: "Support", value: 12 },
];

const motionVariants = {
  fadeUp: { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } },
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
};

export default function LandingPage({ onEnter }) {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="landing-shell bg-[#0B1020] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-56 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-0 bottom-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <motion.header
            initial="hidden"
            animate="visible"
            variants={motionVariants.fadeIn}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="flex flex-col gap-6 border-b border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-2xl shadow-glow-soft">
                📊
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">analyticsX</p>
                <h1 className="text-xl font-semibold text-white">ThinkLab_Solutions</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollToSection("features")}
                className="rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Explore features
              </button>
              <button
                onClick={onEnter}
                className="rounded-3xl bg-gradient-to-r from-[#3B82F6] via-[#06B6D4] to-[#22C55E] px-5 py-3 text-sm font-semibold text-white shadow-glow-soft transition hover:scale-[1.01]"
              >
                Enter analyticsX
              </button>
            </div>
          </motion.header>

          <main className="grid gap-14 py-12 lg:grid-cols-[1.15fr_0.95fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 shadow-sm">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Live data from the thinklab analytics engine
              </div>
              <div className="space-y-6">
                <h2 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl">
                  Transform Data Into Intelligent Decisions
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  analyticsX helps businesses monitor KPIs, visualize trends, and generate actionable insights through powerful real-time analytics dashboards.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onEnter}
                  className="rounded-full bg-gradient-to-r from-[#3B82F6] via-[#06B6D4] to-[#22C55E] px-6 py-4 text-sm font-semibold text-white shadow-glow-soft transition hover:-translate-y-0.5"
                >
                  Launch Dashboard
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  View Features
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="glass-card rounded-[28px] border border-white/10 p-5 shadow-glow-soft">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                      {metric.delta}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="relative"
            >
              <div className="glass-card relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-glow-soft">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Revenue tempo</p>
                      <p className="text-2xl font-semibold text-white">$4.9M</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                      <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-emerald-200">+12.6%</span>
                      vs last month
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-4 shadow-inner">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95} />
                            <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.95} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.08)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#0B1020", border: "1px solid rgba(148,163,184,0.16)", color: "#fff" }} />
                        <Line type="monotone" dataKey="revenue" stroke="url(#lineGradient)" strokeWidth={4} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="glass-card rounded-[28px] border border-white/10 p-4">
                      <p className="text-sm text-slate-400">Product mix</p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="h-24 w-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={segmentData} dataKey="value" innerRadius={30} outerRadius={42} paddingAngle={4}>
                                {segmentData.map((entry, index) => (
                                  <Cell key={entry.name} fill={["#3B82F6", "#06B6D4", "#8B5CF6", "#F97316"][index]} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 text-sm text-slate-300">
                          {segmentData.map((item) => (
                            <div key={item.name} className="flex items-center gap-3">
                              <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.name === "Sales" ? "#3B82F6" : item.name === "Marketing" ? "#06B6D4" : item.name === "Operations" ? "#8B5CF6" : "#F97316" }} />
                              <span>{item.name}</span>
                              <span className="ml-auto text-slate-400">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="glass-card rounded-[28px] border border-white/10 p-4">
                      <p className="text-sm text-slate-400">Growth signal</p>
                      <div className="mt-4 flex items-end gap-3">
                        <div className="rounded-3xl bg-slate-900/70 p-4 text-center">
                          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Sessions</p>
                          <p className="mt-3 text-2xl font-semibold text-white">82.3K</p>
                        </div>
                        <div className="rounded-3xl bg-slate-900/70 p-4 text-center">
                          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Active</p>
                          <p className="mt-3 text-2xl font-semibold text-white">14.7K</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute left-0 top-10 hidden h-28 w-28 animate-float rounded-[32px] bg-slate-900/70 p-5 text-sm text-slate-200 shadow-xl sm:block">
                <div className="mb-3 rounded-3xl bg-white/5 p-3 text-xs uppercase tracking-[0.2em] text-slate-400">Realtime</div>
                <div className="text-xl font-semibold">24.7%</div>
                <div className="text-slate-400">data drift</div>
              </div>
              <div className="absolute right-0 bottom-8 hidden h-32 w-32 animate-float rounded-[36px] bg-slate-900/80 p-4 text-sm text-slate-200 shadow-xl sm:block">
                <div className="text-slate-400">Alert score</div>
                <div className="mt-4 text-3xl font-semibold text-white">98</div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      <section id="stats" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="grid gap-6 rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-glow-soft sm:grid-cols-2 lg:grid-cols-4"
        >
          {platformStats.map((item) => (
            <div key={item.label} className="space-y-2 rounded-3xl bg-slate-950/70 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
              <p className="text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9 }}
          className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.30em] text-cyan-300/80">Premium analytics features</p>
            <h3 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Built for modern teams that need fast, strategic intelligence.
            </h3>
            <p className="max-w-xl text-base leading-7 text-slate-300">
              analyticsX combines real-time dashboards, intelligent forecasting and secure data workflows so your teams can unlock decisions faster.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <LandingFeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9 }}
          className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Analytics visualization</p>
            <h3 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              See revenue, growth, and activity in one immersive analytics canvas.
            </h3>
            <p className="max-w-xl text-base leading-7 text-slate-300">
              Experience premium chart transitions, interactive segments, and real-time KPI signals designed for high-performing analytics teams.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="glass-card rounded-[36px] border border-white/10 p-6 shadow-glow-soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Revenue trends</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Forecast ready</p>
                </div>
                <span className="rounded-full bg-slate-900/70 px-3 py-2 text-sm text-slate-200">+22% QoQ</span>
              </div>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0B1020", border: "1px solid rgba(148,163,184,0.16)", color: "#fff" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fill="url(#areaGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="glass-card rounded-[36px] border border-white/10 p-6 shadow-glow-soft">
                <p className="text-sm text-slate-400">User growth</p>
                <div className="mt-5 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userGrowth} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0B1020", border: "1px solid rgba(148,163,184,0.16)", color: "#fff" }} />
                      <Bar dataKey="users" radius={[10, 10, 0, 0]} fill="#06B6D4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card rounded-[36px] border border-white/10 p-6 shadow-glow-soft">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">Active workflow</p>
                  <span className="rounded-full bg-slate-900/70 px-3 py-2 text-sm text-slate-200">Live</span>
                </div>
                <div className="mt-6 space-y-4">
                  {activityData.map((item) => (
                    <div key={item.label} className="rounded-3xl bg-slate-950/70 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                        <p>{item.label}</p>
                        <span className="text-white">{item.value}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] via-[#06B6D4] to-[#22C55E]" style={{ width: item.value }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9 }}
          className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
        >
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Why choose analyticsX?</p>
            <h3 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Fast analytics, enterprise-grade confidence, and AI forecasting all in one platform.
            </h3>
            <ul className="space-y-4 text-base leading-7 text-slate-300">
              <li className="flex gap-4"><span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" /> Fast performance with lightning reactive charts and instant filters.</li>
              <li className="flex gap-4"><span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" /> Enterprise-grade analytics built to support secure collaboration and scale.</li>
              <li className="flex gap-4"><span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" /> AI-driven forecasting surfaces the next impact areas and custom recommendations.</li>
              <li className="flex gap-4"><span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" /> A modern dashboard experience crafted for product, finance, and growth teams.</li>
            </ul>
          </div>

          <div className="relative">
            <div className="glass-card absolute left-0 top-0 z-10 w-full rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-glow-soft sm:w-4/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Team revenue</p>
                  <p className="mt-3 text-3xl font-semibold text-white">$1.2M</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">+18%</span>
              </div>
              <div className="mt-6 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowth} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0B1020", border: "1px solid rgba(148,163,184,0.16)", color: "#fff" }} />
                    <Line type="monotone" dataKey="users" stroke="#06B6D4" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card absolute right-0 top-36 z-20 w-full rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-glow-soft sm:w-4/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Forecast signal</p>
                  <p className="mt-3 text-3xl font-semibold text-white">+32%</p>
                </div>
                <span className="rounded-full bg-slate-900/70 px-3 py-2 text-sm text-slate-200">AI model</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Accuracy</p>
                  <p className="mt-4 text-2xl font-semibold text-white">91.3%</p>
                </div>
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Ready alerts</p>
                  <p className="mt-4 text-2xl font-semibold text-white">18</p>
                </div>
              </div>
            </div>

            <div className="glass-card relative mt-60 rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-950/70 to-slate-900/50 p-6 shadow-glow-soft">
              <div className="flex items-center gap-3 text-slate-300">
                <Users className="h-5 w-5 text-cyan-300" />
                <span className="text-sm uppercase tracking-[0.25em]">Live platform pulse</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Connected teams</p>
                  <p className="mt-3 text-2xl font-semibold text-white">82</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Queries / min</p>
                  <p className="mt-3 text-2xl font-semibold text-white">4.8K</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9 }}
          className="overflow-hidden rounded-[40px] bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#031528] p-1 shadow-glow-soft"
        >
          <div className="glass-card rounded-[40px] border border-white/10 bg-white/5 px-6 py-12 sm:px-10 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Ready for impact</p>
                <h3 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Start Making Smarter Decisions Today
                </h3>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                  Launch analyticsX and bring premium SaaS analytics to your team with confidence, speed and modern design.
                </p>
              </div>
              <button
                onClick={onEnter}
                className="mx-auto rounded-full bg-gradient-to-r from-[#3B82F6] via-[#06B6D4] to-[#22C55E] px-8 py-4 text-sm font-semibold text-white shadow-glow-soft transition hover:scale-[1.01]"
              >
                Enter analyticsX
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 bg-[#070b18]/90 px-6 py-10 text-slate-400 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-2xl">📊</div>
              <div>
                <p className="font-semibold text-white">analyticsX</p>
                <p className="text-sm text-slate-400">Modern analytics for high-growth teams.</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Built by mussa Thomas · ThinkLab_Solutions · mussathomas98@gmail.com
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Product</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>Dashboard</li>
                <li>Insights</li>
                <li>Reports</li>
              </ul>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Company</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Connect</p>
              <ul className="mt-4 flex flex-wrap gap-3 text-slate-400">
                <li className="rounded-full border border-white/10 px-4 py-2 text-xs hover:text-white">Twitter</li>
                <li className="rounded-full border border-white/10 px-4 py-2 text-xs hover:text-white">LinkedIn</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
