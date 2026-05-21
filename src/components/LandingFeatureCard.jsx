import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function LandingFeatureCard({ icon: Icon, title, description, accent }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      className="glass-card border border-white/10 p-6 rounded-[28px] shadow-glow-soft transition duration-300"
    >
      <div
        className="inline-flex h-14 w-14 items-center justify-center rounded-3xl mb-5"
        style={{ backgroundColor: `${accent}20`, color: accent }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-200 transition group-hover:text-white">
        <span>Discover more</span>
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </motion.div>
  );
}
