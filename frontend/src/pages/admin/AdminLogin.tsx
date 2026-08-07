import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/Spinner';

export default function AdminLogin() {
  const { login, isAuthenticated, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('بيانات الدخول غير صحيحة');
      showToast('فشل تسجيل الدخول', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-ink dark:bg-paper-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-paper dark:text-ink-dark" />
          </div>
          <h1 className="font-display font-bold text-2xl">لوحة التحكم</h1>
          <p className="text-sm text-ink/50 mt-1">سجّل الدخول للمتابعة</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني" dir="ltr"
            className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent"
          />
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور" dir="ltr"
            className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent"
          />
          {error && <p className="text-xs text-rust-500">{error}</p>}
          <button
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark py-3 font-medium hover:bg-pine-600 disabled:opacity-60"
          >
            {loading && <Spinner size={16} />}
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}
