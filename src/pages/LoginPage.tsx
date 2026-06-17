import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signIn, signUp } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const { error } = await signUp(email, password, name);
      if (error) { addToast(error, 'error'); return; }
      addToast('Account created! You can now sign in.', 'success');
      setIsSignUp(false);
    } else {
      const { error } = await signIn(email, password);
      if (error) { addToast(error, 'error'); return; }
      addToast('Welcome back!', 'success');
      navigate('/account');
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen flex items-start justify-center">
      <div className="w-full max-w-md px-margin-mobile">
        <h1 className="font-headline-lg text-on-surface mb-2">{isSignUp ? 'Create Account' : 'Sign In'}</h1>
        <p className="font-body-lg text-on-surface-variant mb-8">
          {isSignUp ? 'Join Furniture Point for exclusive access.' : 'Welcome back to Furniture Point.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div>
              <label className="font-label-caps text-on-surface-variant block mb-1">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="form-input" />
            </div>
          )}
          <div>
            <label className="font-label-caps text-on-surface-variant block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="font-label-caps text-on-surface-variant block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="form-input" />
          </div>
          <button type="submit" className="w-full bg-charcoal text-white font-button py-4 rounded-lg btn-hover-lift">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="font-body-md text-on-surface-variant text-center mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-secondary font-semibold hover:underline">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
