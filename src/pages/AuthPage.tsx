import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuthStore } from '@/lib/auth/AuthStore';

/** TBS members log in with their existing account; new shoppers get a free store account. */
export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pending, setPending] = useState(false);

  const isRegister = mode === 'register';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const res = isRegister
        ? await api.register({ email, password, firstName, lastName })
        : await api.login(email, password);
      login(res.user, res.accessToken, res.refreshToken);
      toast.success(isRegister ? 'Welcome to the TBS Store!' : 'Welcome back!');
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (isRegister ? 'Registration failed.' : 'Login failed.');
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  const input =
    'w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-brand-500';

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold text-ink-900">
        {isRegister ? 'Create a free store account' : 'Log in'}
      </h1>
      <p className="mb-8 text-gray-500">
        {isRegister
          ? 'Free forever — you only pay for what you buy.'
          : 'TBS members: use your existing Trainers By Sport login.'}
      </p>

      <form onSubmit={submit} className="space-y-4">
        {isRegister && (
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={input} />
            <input required placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={input} />
          </div>
        )}
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {isRegister ? (
          <>Already have an account? <Link to="/login" className="font-medium text-brand-600 hover:underline">Log in</Link></>
        ) : (
          <>New here? <Link to="/register" className="font-medium text-brand-600 hover:underline">Create a free account</Link></>
        )}
      </p>
    </div>
  );
}
