import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { WordManager } from './views/WordManager';
import { Study } from './views/Study';
import { Admin } from './views/Admin';
import { UserProfile, ViewState } from './types';
import { api } from './services/supabase';

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  // Check LocalStorage and fetch fresh data from Supabase
  useEffect(() => {
    const initSession = async () => {
      const savedUserStr = localStorage.getItem('kelime_user');
      if (savedUserStr) {
        const localUser = JSON.parse(savedUserStr);
        // 1. Show cached user immediately for speed
        setUser(localUser);
        
        // 2. Fetch fresh data from DB (in case avatar or points changed externally)
        try {
          const freshUser = await api.getUserProfile(localUser.id);
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('kelime_user', JSON.stringify(freshUser));
          }
        } catch (e) {
          console.error("Failed to refresh user profile", e);
        }
      }
    };
    
    initSession();
  }, []);

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    localStorage.setItem('kelime_user', JSON.stringify(loggedInUser));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kelime_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Layout 
        user={user} 
        currentView={currentView} 
        setView={setCurrentView} 
        logout={handleLogout}
      >
        {currentView === 'dashboard' && <Dashboard currentUser={user} />}
        {currentView === 'words' && <WordManager user={user} />}
        {currentView === 'study' && <Study user={user} />}
        {currentView === 'admin' && user.role === 'admin' && <Admin currentUser={user} />}
        {/* Redirect non-admins trying to access admin */}
        {currentView === 'admin' && user.role !== 'admin' && (
          <div className="text-center mt-20 text-gray-400">Bu sayfaya erişim yetkiniz yok.</div>
        )}
      </Layout>
    </HashRouter>
  );
};

export default App;