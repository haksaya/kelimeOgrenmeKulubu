import React, { useState } from 'react';
import { BookOpen, Lock, User } from 'lucide-react';
import { api } from '../services/supabase';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { user, error: apiError } = await api.login(username, password);

    if (apiError) {
      setError(apiError);
      setLoading(false);
    } else if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-yellow-500/10 p-10 transform transition-all">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-yellow-400/40 mb-4 transform -rotate-3">
            <BookOpen size={32} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight text-center">Kelime <span className="text-yellow-500">Öğrenme Kulübü</span></h1>
          <p className="text-sm text-gray-400 font-medium mt-2">Aile Okuma Yarışı</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kullanıcı Adı</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Örn: admin"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all text-gray-700 font-medium"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="••••••"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all text-gray-700 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm font-semibold text-center bg-red-50 p-2 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 rounded-xl shadow-lg shadow-yellow-400/30 transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
               <>
                <Lock size={18} className="mr-2" />
                Giriş Yap
               </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
           <p className="text-xs text-gray-400">
            Kayıtlı hesabınız yoksa yönetici (baba) ile iletişime geçin.
          </p>
        </div>
      </div>
    </div>
  );
};