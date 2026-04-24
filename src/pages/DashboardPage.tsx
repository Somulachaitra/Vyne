import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router';
import { Hexagon, Map as MapIcon, Archive, CircleDot, Bell, Plus, X, Send, Search, Leaf, ShieldCheck, MapPin, Database, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import DataManager from '../components/DataManager';
import { db } from '../services/db';

// --- MOCK DATA ---
const INITIAL_SWAPS = [
  { id: 1, title: 'Japanese Red Maple', offering: 'Heirloom Kale', status: 'PENDING' as const, bg: '' },
  { id: 2, title: 'Carbon Steel Spade', offering: 'Borrowing for 3 days', status: 'ACTIVE' as const, bg: 'bg-green-100 dark:bg-green-900/50' },
  { id: 3, title: 'Wildflower Mix', offering: 'Gifting to Plot #42', status: 'NEW' as const, bg: '' },
];

const MAP_PLOTS = [
  { id: 1, title: 'Rooftop Plot #204', distance: '4.2 miles away', available: '12 sq ft available', top: '25%', left: '33%', pulse: false },
  { id: 2, title: 'Sunny Balcony', distance: '1.2 miles away', available: '20 sq ft available', top: '50%', left: '66%', pulse: false },
  { id: 3, title: 'Community Garden A', distance: '0.8 miles away', available: '5 sq ft available', top: '75%', left: '25%', pulse: false },
  { id: 4, title: 'Backyard Share', distance: '2.5 miles away', available: '50 sq ft available', top: '33%', left: '75%', pulse: true },
];

const VAULT_SEEDS = [
  { id: 1, title: 'Cherokee Purple Tomato', count: 45, viability: '95%', acquired: 'Mar 2025' },
  { id: 2, title: 'Thai Basil', count: 120, viability: '88%', acquired: 'Jan 2025' },
  { id: 3, title: 'Heirloom Carrots', count: 300, viability: '92%', acquired: 'Feb 2026' },
  { id: 4, title: 'Lavender Springs', count: 50, viability: '70%', acquired: 'Aug 2025' },
];

const CIRCLE_MESSAGES = [
  { id: 1, author: 'Alice M.', role: 'Moderator', text: 'Hey everyone! The compost delivery arrived at the south community garden. Bring your own buckets.', time: '10:30 AM', isSystem: false },
  { id: 2, author: 'Bob K.', role: 'Gardener', text: 'Awesome, thanks Alice. Will swing by around 2 PM.', time: '10:45 AM', isSystem: false },
  { id: 3, author: 'System', role: '', text: 'Diana P. has joined the Growth Circle.', time: '11:00 AM', isSystem: true },
  { id: 4, author: 'Diana P.', role: 'Land Host', text: 'Hi neighbors! Excited to share some of my extra balcony space this season.', time: '11:05 AM', isSystem: false },
];

// --- COMPONENT ---
export default function DashboardPage() {
  const { user, theme, toggleTheme, logout } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<'swap' | 'plot' | 'vault' | 'circle' | 'admin'>('swap');
  const [swaps, setSwaps] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState(MAP_PLOTS[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSwap, setNewSwap] = useState({ title: '', offering: '' });
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(CIRCLE_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSwaps();
  }, []);

  const loadSwaps = async () => {
    const { data } = await db.getAll('swaps');
    if (data && data.length > 0) {
      setSwaps(data);
    } else {
      setSwaps(INITIAL_SWAPS); // fallback to initial fake data if empty
    }
  };

  if (!user) return <Navigate to="/auth" />;

  const handleCreateSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSwap.title || !newSwap.offering) return;
    
    setIsSubmitting(true);
    const { data, error } = await db.createRecord('swaps', {
      title: newSwap.title,
      offering: newSwap.offering,
      status: 'NEW'
    });
    
    setIsSubmitting(false);

    if (!error) {
      await loadSwaps();
    } else {
      console.error(error);
      // Fallback local UI push if error (e.g. backend not fully set up)
      setSwaps(prev => [{
        id: Date.now(),
        title: newSwap.title,
        offering: newSwap.offering,
        status: 'NEW',
        bg: ''
      }, ...prev]);
    }
    
    setIsAddModalOpen(false);
    setNewSwap({ title: '', offering: '' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      author: user.name,
      role: user.role,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    }]);
    setChatInput('');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-cream dark:bg-charcoal transition-colors duration-300">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-forest text-white h-full flex flex-col p-8 shrink-0 z-20 shadow-2xl">
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold tracking-tight">vyne.</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Neighborhood Harvest</p>
        </div>

        <nav className="space-y-6 flex-1">
          {[
            { id: 'swap', icon: Hexagon, label: 'Swap Shop' },
            { id: 'plot', icon: MapIcon, label: 'Plot Finder' },
            { id: 'vault', icon: Archive, label: 'Seed Vault' },
            { id: 'circle', icon: CircleDot, label: 'Growth Circles' },
            { id: 'admin', icon: Database, label: 'Data Manager' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex items-center space-x-3 w-full text-left transition-all duration-200",
                activeTab === item.id || (activeTab === 'swap' && item.id === 'plot') // grouped conceptually
                  ? "text-white opacity-100 translate-x-1" 
                  : "text-white/60 hover:text-white hover:opacity-80"
              )}
            >
              <item.icon className="w-5 h-5 opacity-70" />
              <span className="font-medium tracking-wide text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="p-4 bg-[#24523e] rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">{user.name}</p>
                <p className="text-[10px] opacity-70 italic">{user.role}</p>
              </div>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full relative z-10 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-moss h-full rounded-full" 
              />
            </div>
            <p className="text-[9px] uppercase tracking-wider text-right mt-1 opacity-50 relative z-10">Trust Score</p>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-full flex flex-col p-8 relative overflow-hidden text-slate-800 dark:text-cream">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 shrink-0">
          <div className="flex flex-col">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-forest dark:text-moss">
              {activeTab === 'swap' || activeTab === 'plot' ? 'Spring Overview' : 
               activeTab === 'vault' ? 'Your Inventory' : 'Williamsburg Sector'}
            </h2>
            <p className="text-sm font-medium opacity-60 flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5" /> Brooklyn, NY · 54°F Growing Conditions
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search Neighborhood..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass px-4 py-2 pl-10 rounded-full text-xs font-bold border-forest/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-moss/50 w-64 transition-all bg-transparent placeholder:text-slate-500 dark:placeholder:text-cream/50"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-forest dark:text-white" />
            </div>

            <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm hover:scale-105 transition-transform backdrop-blur-md">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button onClick={logout} className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm hover:scale-105 transition-transform backdrop-blur-md text-terracotta/80 hover:text-terracotta">
              <LogOut className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 flex items-center justify-center relative shadow-sm hover:scale-105 transition-transform backdrop-blur-md cursor-pointer">
              <Bell className="w-5 h-5 text-forest dark:text-white" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-terracotta rounded-full border-2 border-cream dark:border-charcoal"></div>
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            
            {(activeTab === 'swap' || activeTab === 'plot') && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-12 gap-6 h-full"
              >
                {/* Left Column (Swaps & Stats) */}
                <div className="col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                  
                  {/* Swaps Feed */}
                  <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col min-h-0 flex-1">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-cream/50">Active Swaps</h3>
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-6 h-6 rounded-full bg-forest text-cream flex items-center justify-center hover:bg-moss transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence>
                        {swaps.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).map((swap) => (
                          <motion.div 
                            key={swap.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/10 last:border-0"
                          >
                            <div className="flex flex-col">
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{swap.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-cream/60 font-medium tracking-wide">{swap.offering}</p>
                            </div>
                            <div className={cn("seed-badge", swap.bg)}>
                              {swap.status}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {swaps.length === 0 && (
                        <p className="text-center text-sm opacity-50 py-4">No active swaps found.</p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="w-full mt-auto pt-4 pb-2 border-2 border-dashed border-slate-200 dark:border-white/20 rounded-xl text-slate-400 dark:text-cream/40 text-xs font-bold hover:border-moss hover:text-moss transition-colors uppercase tracking-widest shrink-0"
                    >
                      + Start New Swap
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-cream/50 mb-5">Garden Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="stat-card">
                        <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-cream/50 tracking-wider">Germination</p>
                        <p className="text-3xl font-bold font-serif text-forest dark:text-moss">92%</p>
                      </div>
                      <div className="stat-card">
                        <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-cream/50 tracking-wider">Community</p>
                        <p className="text-3xl font-bold font-serif text-forest dark:text-moss">+14</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column (Map) */}
                <div className="col-span-8 h-full flex flex-col">
                  <div className="map-overlay flex-1 relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
                    
                    {MAP_PLOTS.map((plot) => (
                      <motion.div 
                        key={plot.id}
                        className={cn("dot-marker cursor-pointer z-10 transition-transform hover:scale-150", plot.pulse && "animate-pulse")}
                        style={{ top: plot.top, left: plot.left }}
                        onClick={() => setSelectedPlot(plot)}
                      >
                         <div className="absolute inset-0 bg-moss rounded-full blur-sm opacity-50"></div>
                      </motion.div>
                    ))}

                    <div className="absolute bottom-6 left-6 right-6 glass p-5 rounded-2xl flex justify-between items-center shadow-2xl border-white/20 border backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-forest/90 dark:bg-forest rounded-xl flex items-center justify-center text-white shadow-inner">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-serif text-lg font-bold text-slate-800 dark:text-white mb-1">{selectedPlot.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-cream/70 font-medium tracking-wide">
                            {selectedPlot.distance} · <span className="text-moss font-bold">{selectedPlot.available}</span>
                          </p>
                        </div>
                      </div>
                      <button className="terracotta-btn shadow-lg hover:-translate-y-0.5 transform flex items-center gap-2">
                        Inquire Lease
                      </button>
                    </div>

                    <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
                      <button className="glass w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-800 dark:text-white shadow-lg bg-white/60 dark:bg-black/60 hover:bg-white dark:hover:bg-black transition-colors backdrop-blur-md border border-white/20">
                        <Plus className="w-5 h-5" />
                      </button>
                      <button className="glass w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-800 dark:text-white shadow-lg bg-white/60 dark:bg-black/60 hover:bg-white dark:hover:bg-black transition-colors backdrop-blur-md border border-white/20">
                        <div className="w-4 h-0.5 bg-current rounded-full" />
                      </button>
                    </div>

                    <div className="absolute top-6 left-6 glass px-4 py-2 rounded-full text-[10px] font-bold text-forest dark:text-moss uppercase tracking-widest shadow-md">
                      Live Plot Finder Map
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'vault' && (
              <motion.div 
                key="vault"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col"
              >
                <div className="grid grid-cols-4 gap-6">
                  {VAULT_SEEDS.map((seed, i) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={seed.id} 
                      className="glass p-6 rounded-3xl border border-white/40 dark:border-white/10 hover:border-moss/50 transition-colors shadow-sm relative overflow-hidden group bg-white/40 dark:bg-black/20"
                    >
                      <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Leaf className="w-32 h-32 text-forest dark:text-moss" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-forest/10 dark:bg-moss/10 flex items-center justify-center mb-6 relative z-10">
                        <Archive className="w-6 h-6 text-forest dark:text-moss" />
                      </div>
                      <h3 className="font-serif text-lg font-bold mb-2 relative z-10">{seed.title}</h3>
                      <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center text-sm border-b border-black/5 dark:border-white/5 pb-2">
                          <span className="opacity-60 font-medium">Quantity</span>
                          <span className="font-bold">{seed.count} seeds</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-black/5 dark:border-white/5 pb-2">
                          <span className="opacity-60 font-medium">Viability</span>
                          <span className="font-bold text-moss">{seed.viability}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="opacity-40 uppercase tracking-widest">Acquired</span>
                          <span className="font-medium opacity-60">{seed.acquired}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Add Seed Card */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-3xl border-2 border-dashed border-forest/20 dark:border-white/10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-forest/5 dark:hover:bg-white/5 transition-colors group min-h-[220px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-forest dark:bg-moss text-white dark:text-charcoal flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm tracking-wide">Catalog New Seed</p>
                    <p className="text-xs opacity-50 mt-2 max-w-[150px]">Add a new packet to your digital inventory.</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'circle' && (
              <motion.div 
                key="circle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-white/40 dark:border-white/10 shadow-lg overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center gap-4 bg-white/40 dark:bg-white/5 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest to-moss flex items-center justify-center text-white shadow-inner">
                    <CircleDot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold">Williamsburg Urban Farmers</h3>
                    <p className="text-xs font-medium tracking-wide opacity-60">14 Members · Online</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[80%]", msg.isSystem ? "mx-auto items-center text-center" : (msg.author === user.name ? "ml-auto items-end" : "items-start"))}>
                      {!msg.isSystem && msg.author !== user.name && (
                        <div className="flex items-baseline gap-2 mb-1 pl-1">
                          <span className="text-xs font-bold text-forest dark:text-moss">{msg.author}</span>
                          <span className="text-[10px] uppercase tracking-widest opacity-50">{msg.role}</span>
                        </div>
                      )}
                      
                      {msg.isSystem ? (
                        <div className="px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-[11px] font-medium opacity-60">
                          {msg.text} · {msg.time}
                        </div>
                      ) : (
                        <div className={cn(
                          "p-4 rounded-2xl text-sm shadow-sm",
                          msg.author === user.name 
                            ? "bg-forest text-cream rounded-br-sm" 
                            : "bg-white dark:bg-[#2a2a2a] border border-black/5 dark:border-white/5 rounded-bl-sm"
                        )}>
                          <p className="leading-relaxed">{msg.text}</p>
                          <p className={cn("text-[10px] mt-2 font-medium tracking-wider", msg.author === user.name ? "text-cream/50 right-text" : "text-slate-400 flex justify-end")}>
                            {msg.time}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white/40 dark:bg-white/5 shrink-0 border-t border-black/5 dark:border-white/5">
                  <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Share tips, request tools, or organize events..."
                      className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-moss/50 text-sm shadow-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="absolute right-3 w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#a65d1d] transition-colors shadow-md"
                    >
                      <Send className="w-4 h-4 ml-1" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-white/40 dark:border-white/10 shadow-lg overflow-hidden"
              >
                 <DataManager />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* --- ADD PORTAL/MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-cream dark:bg-charcoal rounded-[2rem] shadow-2xl p-8 border border-white/20 overflow-hidden"
            >
              {/* Decorative blob */}
              <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-moss/20 blur-[60px] pointer-events-none" />
              
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-moss/10 flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-forest dark:text-moss" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-forest dark:text-moss">Start New Swap</h2>
                <p className="opacity-60 text-sm mt-2 font-medium">Offer a tool, seed packet, or harvest to the community.</p>
              </div>

              <form onSubmit={handleCreateSwap} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2 pl-1">Item Title</label>
                  <input 
                    type="text" 
                    required
                    value={newSwap.title}
                    onChange={(e) => setNewSwap(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Heirloom Tomato Seeds" 
                    className="w-full glass bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moss/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2 pl-1">What you're seeking (or offering)</label>
                  <input 
                    type="text" 
                    required
                    value={newSwap.offering}
                    onChange={(e) => setNewSwap(prev => ({ ...prev, offering: e.target.value }))}
                    placeholder="e.g. Trading for basil, or gifting!" 
                    className="w-full glass bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moss/50 text-sm"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-forest text-white dark:bg-moss dark:text-charcoal font-bold tracking-wide uppercase text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish to Swap Shop'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
