import React, { useState } from 'react';
import { api } from '../services/supabase';
import { UserPlus, Database, Copy, Check, Info } from 'lucide-react';
import { UserProfile } from '../types';
import { Avatar } from '../components/Avatar';

interface AdminProps {
  currentUser: UserProfile;
}

export const Admin: React.FC<AdminProps> = ({ currentUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await api.addUser({
      username,
      password,
      role: 'user',
      points: 0,
      word_count: 0
    });

    if (error) {
      setMessage(`Hata: ${error.message}`);
    } else {
      setMessage('Kullanıcı başarıyla oluşturuldu!');
      setUsername('');
      setPassword('');
    }
  };

  const sqlCode = `-- 1. PROFILLER TABLOSU
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password text not null,
  role text default 'user',
  points int default 0,
  word_count int default 0,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. KELIMELER TABLOSU
create table public.words (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  english text not null,
  turkish text not null,
  example_sentence text,
  example_turkish text,
  status text default 'new',
  created_at timestamptz default now()
);

-- 3. ÖZEL FONKSIYONLAR (RPC)
-- Puan ekleme
create or replace function add_points(user_id_param uuid, points int)
returns void as $$
begin
  update profiles
  set points = profiles.points + add_points.points
  where id = user_id_param;
end;
$$ language plpgsql;

-- Kelime sayacı artırma
create or replace function increment_word_count(user_id_param uuid)
returns void as $$
begin
  update profiles
  set word_count = profiles.word_count + 1
  where id = user_id_param;
end;
$$ language plpgsql;

-- 4. AİLE ÜYELERİ VE ÖRNEK VERİLER
insert into public.profiles (username, password, role, points, word_count)
values 
('Harun', 'harun123', 'admin', 0, 0),
('Uraz', 'uraz123', 'user', 0, 0),
('Elif', 'elif123', 'user', 0, 0);

-- Örnek kelime (Harun için)
insert into public.words (user_id, english, turkish, example_sentence, example_turkish, status)
select id, 'Success', 'Başarı', 'Hard work leads to success.', 'Sıkı çalışma başarıya götürür.', 'new'
from public.profiles where username = 'Harun';`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. VISUAL CHECK CARD */}
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-yellow-50 to-white p-6 rounded-3xl border border-yellow-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-yellow-200 overflow-hidden">
               <Avatar username={currentUser.username} avatarUrl={currentUser.avatar_url} className="w-full h-full" />
            </div>
            <div>
                <h3 className="font-bold text-xl text-gray-800">Merhaba, {currentUser.username}!</h3>
                <p className="text-sm text-gray-500 mb-1">Profil resminiz yukarıda/solda görünüyor mu?</p>
                <div className="flex items-center text-xs text-yellow-700 bg-yellow-100 px-3 py-1 rounded-lg w-fit">
                    <Info size={14} className="mr-1" /> DiceBear API üzerinden çekiliyor.
                </div>
            </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="max-w-3xl mx-auto bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start justify-between shadow-sm">
        <div className="flex items-start">
            <Info className="mr-4 text-blue-600 mt-1" size={24} />
            <div>
                <h3 className="font-bold text-blue-800">Veritabanı Kurulum Talimatı</h3>
                <p className="text-sm text-blue-600">
                   Aşağıdaki SQL kodunu Supabase panelindeki <b>SQL Editor</b> kısmına yapıştırın ve <b>Run</b> butonuna basın. 
                   Bu işlem Harun (Admin), Uraz ve Elif kullanıcılarını oluşturacaktır.
                </p>
            </div>
        </div>
      </div>

      {/* User Creation Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <UserPlus className="mr-3 text-yellow-500" /> Yeni Aile Üyesi Ekle
        </h2>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kullanıcı Adı</label>
            <input 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="Örn: Mehmet"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Şifre</label>
            <input 
              type="text"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="*****"
              required
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-xl transition-colors shadow-md">
              Kaydet
            </button>
          </div>
        </form>
        {message && <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold ${message.includes('Hata') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{message}</div>}
      </div>

      {/* SQL Setup Guide */}
      <div className="max-w-3xl mx-auto bg-slate-900 p-8 rounded-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Database className="mr-3 text-blue-400" /> Veritabanı Kurulum Scripti (Harun, Uraz, Elif)
          </h2>
          <button 
            onClick={copyToClipboard}
            className="flex items-center text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"
          >
            {copied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
            {copied ? 'Kopyalandı!' : 'SQL Kodunu Kopyala'}
          </button>
        </div>
        
        <p className="text-slate-400 text-sm mb-4">
          Bu script; Harun'u admin, Uraz ve Elif'i ise standart kullanıcı olarak kaydeder.
        </p>

        <div className="bg-black/50 p-4 rounded-xl overflow-x-auto border border-slate-700">
          <pre className="text-xs font-mono text-green-400 leading-relaxed">
            {sqlCode}
          </pre>
        </div>
      </div>
    </div>
  );
};