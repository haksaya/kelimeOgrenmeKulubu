import React, { useState, useEffect } from 'react';
import { UserProfile, Word } from '../types';
import { api } from '../services/supabase';
import { geminiService } from '../services/gemini';
import { Plus, Upload, CheckCircle, Clock, Volume2, Sparkles, Loader2, Trash2 } from 'lucide-react';

interface WordManagerProps {
  user: UserProfile;
}

export const WordManager: React.FC<WordManagerProps> = ({ user }) => {
  const [newWord, setNewWord] = useState('');
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadWords();
  }, [user.id]);

  const loadWords = async () => {
    const data = await api.getUserWords(user.id);
    setWords(data);
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    setAnalyzing(true);

    try {
      // 1. Get AI Analysis
      const analysis = await geminiService.analyzeWord(newWord);

      // 2. Add to DB
      const wordEntry: Partial<Word> = {
        user_id: user.id,
        english: newWord,
        turkish: analysis.turkish,
        example_sentence: analysis.example,
        example_turkish: analysis.example_turkish,
        status: 'new'
      };

      await api.addWord(wordEntry);
      
      setNewWord('');
      await loadWords(); // Refresh
    } catch (error) {
      alert("Kelime eklenirken hata oluştu.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteWord = async (id: string, englishWord: string) => {
    if (!window.confirm(`"${englishWord}" kelimesini silmek istediğinize emin misiniz?`)) {
      return;
    }

    const { error } = await api.deleteWord(id, user.id);
    if (error) {
      alert("Silme işlemi başarısız oldu.");
    } else {
      // Optimistic update: remove from local state immediately
      setWords(words.filter(w => w.id !== id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length > 0) {
        setAnalyzing(true);
        // Process only first 3 for demo to avoid rate limits
        for (const w of lines.slice(0, 3)) {
           const analysis = await geminiService.analyzeWord(w);
           await api.addWord({
             user_id: user.id,
             english: w,
             turkish: analysis.turkish,
             example_sentence: analysis.example,
             example_turkish: analysis.example_turkish,
             status: 'new'
           });
        }
        await loadWords();
        setAnalyzing(false);
        alert(`${Math.min(lines.length, 3)} kelime eklendi! (Demo limiti)`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 text-white shadow-xl shadow-yellow-500/20">
        <h2 className="text-2xl font-bold mb-4">Yeni Kelime Öğren</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="İngilizce kelime yaz..."
              className="w-full p-4 rounded-xl text-gray-800 placeholder-gray-400 border-none focus:ring-4 focus:ring-yellow-300/50 shadow-inner"
              onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            />
            {analyzing && <Loader2 className="absolute right-4 top-4 animate-spin text-yellow-500" />}
          </div>
          <button 
            onClick={handleAddWord}
            disabled={analyzing}
            className="bg-white text-yellow-600 font-bold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {analyzing ? 'Analiz Ediliyor...' : <><Plus className="mr-2" /> Ekle</>}
          </button>
          
          <label className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-6 py-4 rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center">
            <Upload className="mr-2" /> Dosya Yükle (.txt)
            <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-700 mt-8 flex items-center">
        <Sparkles className="mr-2 text-yellow-500" /> 
        Kelime Listen ({words.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map((word) => (
           <div key={word.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
             <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-bold text-gray-800">{word.english}</h4>
                <span className={`text-xs px-2 py-1 rounded-lg font-bold uppercase ${
                  word.status === 'mastered' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-500'
                }`}>
                  {word.status === 'new' ? 'Yeni' : word.status}
                </span>
             </div>
             <p className="text-gray-500 font-medium mb-3">{word.turkish}</p>
             <div className="bg-gray-50 p-3 rounded-xl text-sm border-l-4 border-yellow-300">
               <div className="text-gray-800 italic mb-1">"{word.example_sentence}"</div>
               {word.example_turkish && (
                 <div className="text-gray-400 text-xs not-italic border-t border-gray-200 pt-1 mt-1">
                   {word.example_turkish}
                 </div>
               )}
             </div>
             
             {/* Action Buttons */}
             <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="text-gray-300 hover:text-yellow-500 transition-colors">
                  <Volume2 size={18} />
               </button>
               <button 
                  onClick={() => handleDeleteWord(word.id, word.english)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  title="Sil"
               >
                  <Trash2 size={18} />
               </button>
             </div>
           </div>
        ))}
        {words.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400">
            Henüz hiç kelime eklemedin. Hadi başla!
          </div>
        )}
      </div>
    </div>
  );
};