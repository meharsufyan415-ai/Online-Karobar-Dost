import React, { useState } from 'react';
import { LogIn, UserPlus, Key, ArrowRight, Mail, Lock, Building, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  loginWithGoogle, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  auth,
  db,
  doc,
  setDoc
} from '../firebase';

interface AuthProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      onLoginSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set display name as Business Name
        await updateProfile(userCredential.user, { displayName: businessName });
        
        // Save business settings for new user
        const initialSettings = {
          primaryCurrency: 'PKR',
          currencySymbol: 'Rs.',
          businessName: businessName,
          whatsappNumber: '',
          businessAddress: businessAddress,
          defaultDeliveryCharges: 0,
          preferredCouriers: []
        };
        await setDoc(doc(db, 'settings', 'business'), initialSettings);
        
        onLoginSuccess();
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg('Password reset link sent to your email!');
        setMode('login');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl p-10 w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex justify-center">
            <img src="/logo.png" alt="Karobar Dost" className="w-48 h-auto" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Karobar Dost</h2>
          <p className="text-slate-500 font-urdu mt-1 text-sm">آنلائن کاروبار دوست میں خوش آمدید!</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all">
            <CheckCircle size={18} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Sufyan Store"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] transition-all text-sm"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="Store location..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] transition-all text-sm"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="email"
                placeholder="name@company.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00695C] hover:bg-[#004D40] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#00695C]/20 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              mode === 'login' ? 'Sign In' : (mode === 'signup' ? 'Create Account' : 'Send Reset Link')
            )}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-[1px] bg-slate-100 flex-1"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
          <div className="h-[1px] bg-slate-100 flex-1"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 mb-6"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="space-y-4 text-center">
          {mode === 'login' ? (
            <>
              <button 
                onClick={() => setMode('signup')}
                className="text-sm font-bold text-[#00695C] hover:underline"
              >
                Don't have an account? Sign Up
              </button>
              <br />
              <button 
                onClick={() => setMode('reset')}
                className="text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                Forgot your password?
              </button>
            </>
          ) : (
            <button 
              onClick={() => setMode('login')}
              className="text-sm font-bold text-[#1A237E] hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>

        <p className="mt-10 text-[10px] text-slate-300 text-center uppercase font-bold tracking-widest">
          Secured by Firebase Auth
        </p>
      </div>
    </div>
  );
}
