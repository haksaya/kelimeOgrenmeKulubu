import React from 'react';
import { BookOpen, Home, LogOut, PlusCircle, Trophy, User } from 'lucide-react';
import { UserProfile, ViewState } from '../types';
import { Avatar } from './Avatar';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  logout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, currentView, setView, logout }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => setView(view)}
      className={`flex items-center w-full p-3 mb-2 rounded-xl transition-all duration-200 ${
        currentView === view
          ? 'bg-yellow-100 text-yellow-800 font-bold shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col fixed h-full z-10 hidden md:flex shadow-lg">
        <div className="flex items-center mb-10">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-400/30 text-white mr-3 shrink-0">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight leading-tight">Kelime <span className="text-yellow-500">Öğrenme Kulübü</span></h1>
            <p className="text-xs text-gray-400 font-medium mt-1">Aile Okuma Yarışı</p>
          </div>
        </div>

        <nav className="flex-1">
          <NavItem view="dashboard" icon={Home} label="Genel Bakış" />
          <NavItem view="words" icon={PlusCircle} label="Kelime Hazinem" />
          <NavItem view="study" icon={Trophy} label="Eğitim & Test" />
          {user.role === 'admin' && (
             <NavItem view="admin" icon={User} label="Kullanıcı Yönetimi" />
          )}
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center mb-4 p-2 bg-gray-50 rounded-xl border border-gray-100">
            <Avatar 
              username={user.username} 
              avatarUrl={user.avatar_url} 
              className="w-10 h-10 rounded-full bg-yellow-200 border-2 border-white shadow-sm"
            />
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{user.username}</p>
              <p className="text-xs text-yellow-600 font-bold">{user.points} Puan</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center text-red-500 hover:text-red-700 w-full p-2 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b p-4 flex justify-between items-center shadow-sm">
        <span className="font-bold text-yellow-500 text-lg truncate">Kelime Öğrenme Kulübü</span>
        <button onClick={logout}><LogOut size={20} className="text-gray-500" /></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-14 md:mt-0 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};