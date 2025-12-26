
import React, { useEffect, useState } from 'react';
import { UserProfile, RecentWord, Word } from '../types';
import { api } from '../services/supabase';
import { Avatar } from '../components/Avatar';
import { Award, BookOpen, Star, TrendingUp, LayoutGrid, Calendar, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardProps {
  currentUser: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [recentWords, setRecentWords] = useState<RecentWord[]>([]);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      const [usersData, activityData, allWordsData] = await Promise.all([
        api.getLeaderboard(),
        api.getRecentActivity(),
        api.getAllWords()
      ]);
      setUsers(usersData);
      setRecentWords(activityData);
      setAllWords(allWordsData);
      setLoading(false);
    };
    fetchData();
  }, [currentUser.id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin text-yellow-500"><Star size={48} fill="currentColor"/></div></div>;

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const first = sortedUsers[0];
  const second = sortedUsers[1];
  const third = sortedUsers[2];

  const maxPoints = Math.max(...users.map(u => u.points), 100);

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getActivityData = (userId: string, day: number) => {
    return allWords.filter(w => {
      const date = new Date(w.created_at);
      return w.user_id === userId && 
             date.getDate() === day && 
             date.getMonth() === selectedMonth && 
             date.getFullYear() === selectedYear;
    }).length;
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 border-gray-200';
    if (count <= 2) return 'bg-yellow-100 border-yellow-200';
    if (count <= 4) return 'bg-yellow-300 border-yellow-400';
    return 'bg-yellow-500 border-yellow-600';
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* 1. PODIUM SECTION */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-100"></div>
        
        <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-16 mt-4 min-h-[280px]">
          {second && (
            <div className="flex flex-col items-center order-2 md:order-1">
              <div className="relative mb-3">
                 <div className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden shadow-lg bg-yellow-400">
                    <Avatar username={second.username} avatarUrl={second.avatar_url} className="w-full h-full" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] border-2 border-white">2</div>
              </div>
              <span className="font-bold text-slate-600 text-lg mb-1 tracking-tight uppercase">{second.username}</span>
              <div className="bg-slate-50 w-24 md:w-32 h-32 rounded-t-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-slate-200 shadow-inner">
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">PUAN</span>
                <span className="text-2xl font-black text-slate-600">{second.points}</span>
              </div>
            </div>
          )}

          {first && (
            <div className="flex flex-col items-center order-1 md:order-2 z-10 -mt-10">
              <div className="relative mb-4">
                 <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-yellow-400 drop-shadow-sm animate-pulse">
                    <Award size={48} fill="currentColor" />
                 </div>
                 <div className="w-32 h-32 rounded-full border-4 border-yellow-300 overflow-hidden shadow-2xl bg-white p-1">
                    <Avatar username={first.username} avatarUrl={first.avatar_url} className="w-full h-full rounded-full" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-4 border-white">1</div>
              </div>
              <span className="font-black text-slate-800 text-xl mb-1 tracking-tight uppercase">{first.username}</span>
              <div className="bg-gradient-to-b from-yellow-300 to-yellow-400 w-32 md:w-40 h-48 rounded-t-[2.5rem] flex flex-col items-center justify-start pt-6 shadow-xl shadow-yellow-200">
                <span className="text-yellow-800/60 font-black text-[10px] uppercase tracking-[0.2em] mb-1">LİDER</span>
                <span className="text-4xl font-black text-white drop-shadow-md">{first.points}</span>
              </div>
            </div>
          )}

          {third && (
            <div className="flex flex-col items-center order-3 md:order-3">
              <div className="relative mb-3">
                 <div className="w-24 h-24 rounded-full border-4 border-yellow-100 overflow-hidden shadow-lg bg-yellow-400">
                    <Avatar username={third.username} avatarUrl={third.avatar_url} className="w-full h-full" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] border-2 border-white">3</div>
              </div>
              <span className="font-bold text-slate-600 text-lg mb-1 tracking-tight uppercase">{third.username}</span>
              <div className="bg-yellow-50 w-24 md:w-32 h-24 rounded-t-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-yellow-200 shadow-inner">
                <span className="text-yellow-600 font-black text-[10px] uppercase tracking-widest">PUAN</span>
                <span className="text-2xl font-black text-yellow-500">{third.points}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. FAMILY READING HEATMAP INFOGRAPHIC */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 mr-4 border border-yellow-100 shadow-inner">
               <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-800 tracking-tight uppercase">Okuma Zinciri</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Aylık Aile Aktivite Özeti</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent font-black text-slate-600 focus:outline-none px-3 py-2 text-[10px] uppercase tracking-widest cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent font-black text-slate-600 focus:outline-none px-3 py-2 text-[10px] uppercase tracking-widest cursor-pointer border-l border-slate-200"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-yellow-200 scrollbar-track-transparent">
          <div className="min-w-[800px]">
            {/* Header: Days of the month */}
            <div className="flex mb-3">
              <div className="w-32 shrink-0"></div>
              <div className="flex flex-1 justify-between px-1">
                {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }).map((_, i) => (
                  <div key={i} className="w-6 text-center text-[9px] font-black text-slate-300 uppercase">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows for each user */}
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center group">
                  <div className="w-32 shrink-0 flex items-center pr-4">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm mr-3 bg-yellow-400">
                      <Avatar username={user.username} className="w-full h-full" />
                    </div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight truncate">
                      {user.username}
                    </span>
                  </div>
                  
                  <div className="flex flex-1 justify-between bg-slate-50/50 p-1 rounded-xl border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                    {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }).map((_, i) => {
                      const day = i + 1;
                      const count = getActivityData(user.id, day);
                      return (
                        <div 
                          key={i} 
                          className={`w-6 h-6 rounded-md border transition-all relative cursor-help group/box ${getHeatmapColor(count)} hover:scale-110 hover:z-10`}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white rounded-xl text-[9px] font-bold opacity-0 group-hover/box:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-all scale-90 group-hover/box:scale-100 border border-slate-700">
                            <span className="text-yellow-400">{day} {months[selectedMonth]}</span>
                            <div className="h-px bg-white/10 my-1"></div>
                            <span>{count > 0 ? `${count} Kelime` : 'Aktivite yok'}</span>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-end text-[9px] font-black text-slate-400 uppercase tracking-widest space-x-3">
          <span>Az</span>
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-yellow-300 border border-yellow-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-yellow-500 border border-yellow-600 rounded-sm"></div>
          <span>Çok</span>
        </div>
      </div>

      {/* 3. STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
           <h3 className="font-black text-lg text-slate-800 mb-8 flex items-center uppercase tracking-tight">
             <LayoutGrid className="text-yellow-500 mr-3" size={22} /> Akış
           </h3>
           <div className="space-y-5">
             {recentWords.length > 0 ? recentWords.map((item, idx) => (
               <div key={idx} className="flex items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-yellow-100 transition-all cursor-default">
                 <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm bg-yellow-400 border border-yellow-300 shrink-0">
                    <Avatar username={item.profiles?.username || '?'} className="w-full h-full" />
                 </div>
                 <div className="ml-4 flex-1 min-w-0">
                   <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                     {item.profiles?.username} <span className="font-bold text-slate-400 normal-case ml-1">öğrendi:</span>
                   </p>
                   <p className="text-yellow-600 font-black truncate text-sm mt-0.5 uppercase tracking-wide">{item.english}</p>
                 </div>
                 <div className="text-[10px] text-slate-300 font-black uppercase tracking-tighter ml-3">
                   {new Date(item.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                 </div>
               </div>
             )) : (
               <div className="text-center text-slate-300 py-12 font-bold uppercase tracking-widest text-xs">Veri Bekleniyor</div>
             )}
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <h3 className="font-black text-lg text-slate-800 mb-10 flex items-center uppercase tracking-tight">
             <TrendingUp className="text-yellow-500 mr-3" size={22} /> Sıralama
          </h3>
          <div className="flex items-end justify-around h-48 px-2">
            {sortedUsers.slice(0, 5).map((u, i) => {
              const heightPercent = Math.max((u.points / maxPoints) * 100, 20);
              const colorClasses = [
                "bg-yellow-400", 
                "bg-slate-200", 
                "bg-yellow-200", 
                "bg-slate-100", 
                "bg-slate-100"
              ];
              return (
                <div key={u.id} className="flex flex-col items-center w-full group cursor-pointer relative">
                  <div className="absolute -top-7 text-[10px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    {u.points} PT
                  </div>
                  <div 
                    className={`w-4/5 rounded-t-xl transition-all duration-1000 origin-bottom ${colorClasses[i % colorClasses.length]}`} 
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className="text-[9px] font-black text-slate-400 mt-3 truncate max-w-[60px] uppercase tracking-tighter">{u.username}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
           <h3 className="font-black text-lg text-slate-800 mb-8 flex items-center uppercase tracking-tight">
             <BookOpen className="text-yellow-500 mr-3" size={22} /> Hedefler
           </h3>
           <div className="flex flex-col justify-center h-48 space-y-6">
              {users.map((u, idx) => (
                <div key={u.id} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                    <span>{u.username}</span>
                    <span className="text-yellow-600">{u.word_count} / 100</span>
                  </div>
                  <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-yellow-400' : 'bg-slate-300'}`} 
                      style={{ width: `${Math.min((u.word_count / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
