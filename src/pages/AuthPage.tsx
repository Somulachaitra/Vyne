import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { MapPin, Flower2, Sprout, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  
  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Gardener' as 'Gardener' | 'Land Host' | 'Both',
    location: null as { lat: number, lng: number } | null,
  });

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const requestGeolocation = () => {
    setGeoLoading(true);
    setGeoError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setGeoLoading(false);
        },
        (error) => {
          setGeoError('Unable to get location. ' + error.message);
          setGeoLoading(false);
        }
      );
    } else {
      setGeoError('Geolocation is not supported by your browser');
      setGeoLoading(false);
    }
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        if (step === 1) {
          setStep(2);
        } else {
          await signup(formData);
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred during authentication');
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal text-slate-800 dark:text-cream flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-forest/5 dark:bg-moss/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-terracotta/10 blur-[120px]" />

      <motion.button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium hover:opacity-70 z-20"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Vyne
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/40 dark:bg-charcoal/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold mb-2 text-forest dark:text-moss">
            {isLogin ? 'Welcome back.' : (step === 1 ? 'Start harvesting.' : 'Tell us about yourself.')}
          </h2>
          <p className="opacity-70 font-medium text-sm">
            {isLogin ? 'Enter your details to access your garden.' : 'Join the peer-to-peer urban gardening platform.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && step === 2 ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="space-y-4">
                <label className="block text-sm font-medium mb-2">I am a...</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { role: 'Gardener', icon: Sprout },
                    { role: 'Land Host', icon: MapPin },
                    { role: 'Both', icon: Flower2 }
                  ].map(({ role, icon: Icon }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: role as any }))}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                        formData.role === role 
                          ? "border-forest bg-forest text-cream dark:border-moss dark:bg-moss dark:text-charcoal"
                          : "border-forest/20 hover:border-forest/50 dark:border-moss/20"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="block text-sm font-medium">My Location</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={requestGeolocation}
                    disabled={geoLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-forest/20 dark:border-moss/20 hover:bg-forest/5 dark:hover:bg-moss/5 transition-colors"
                  >
                    <MapPin className="w-4 h-4" /> 
                    {geoLoading ? 'Locating...' : (formData.location ? 'Location Captured' : 'Share Location (Browser API)')}
                  </button>
                  {geoError && <p className="text-xs text-terracotta">{geoError}</p>}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-1 ml-1 opacity-80">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-forest/10 dark:border-moss/10 focus:outline-none focus:ring-2 focus:ring-terracotta/50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 ml-1 opacity-80">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-forest/10 dark:border-moss/10 focus:outline-none focus:ring-2 focus:ring-terracotta/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 ml-1 opacity-80">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-forest/10 dark:border-moss/10 focus:outline-none focus:ring-2 focus:ring-terracotta/50"
                />
              </div>
            </motion.div>
          )}

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-forest text-cream dark:bg-moss dark:text-forest font-bold tracking-wide uppercase text-sm shadow-xl hover:shadow-2xl transition-all flex justify-center items-center gap-2"
            >
              {isLogin ? 'Sign In' : (step === 1 ? 'Continue' : 'Complete Signup')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setStep(1);
                }}
                className="text-sm opacity-80 hover:opacity-100 underline decoration-forest/30 dark:decoration-moss/30"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
