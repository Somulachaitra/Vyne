import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Leaf, Navigation, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function FloatingSeeds() {
  const seeds = Array.from({ length: 15 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {seeds.map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-forest dark:bg-moss opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { toggleTheme, theme } = useAuth();

  return (
    <div className="relative min-h-screen bg-cream dark:bg-charcoal text-slate-800 dark:text-cream transition-colors duration-500 overflow-x-hidden">
      <FloatingSeeds />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-forest dark:text-moss">
          <Leaf className="h-8 w-8" />
          <span className="font-serif text-3xl font-bold tracking-tight">vyne.</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="text-sm font-medium hover:opacity-80">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="px-5 py-2.5 rounded-full bg-forest text-cream dark:bg-white dark:text-forest font-bold text-sm tracking-wide uppercase shadow-lg hover:shadow-xl transition-all"
          >
            Join Vyne
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-1.5 rounded-full border border-forest/20 dark:border-moss/20 text-sm font-medium text-terracotta dark:text-moss mb-8 inline-block tracking-wide uppercase"
            >
              Your neighborhood, harvested.
            </motion.span>
            
            <h1 className="font-serif text-6xl md:text-8xl font-bold leading-tight mb-6">
              Cultivate <span className="italic text-terracotta">Community</span>
            </h1>
            
            <p className="text-xl md:text-2xl opacity-80 mb-10 max-w-2xl mx-auto">
              Eliminate the entry tax of urban gardening. Share seeds, lend tools, and lease micro-plots right in your neighborhood.
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button 
                onClick={() => navigate('/auth')}
                className="px-8 py-4 rounded-full bg-terracotta text-cream text-lg font-medium shadow-xl shadow-terracotta/20 hover:shadow-terracotta/40 transition-all flex items-center gap-2"
              >
                Start Growing <Navigation className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Staggered Section */}
        <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "The Swap Shop",
                desc: "A high-end marketplace for seed trading and tool lending with Verified Lender statuses.",
                icon: ShieldCheck
              },
              {
                title: "Micro-Plot Directory",
                desc: "Map interface for Land Hosts to list small patches of soil for Gardeners to lease.",
                icon: Navigation
              },
              {
                title: "The Seed Vault",
                desc: "Digital inventory manager tracking seed lineage, germination rates, and sharing history.",
                icon: Leaf
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="p-8 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-forest/10 dark:border-moss/10 hover:border-terracotta/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-forest/10 dark:bg-moss/10 flex items-center justify-center mb-6">
                  <feat.icon className="w-6 h-6 text-forest dark:text-moss" />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-3">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
