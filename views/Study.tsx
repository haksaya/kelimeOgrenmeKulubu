import React, { useState, useEffect } from 'react';
import { UserProfile, Word, QuizQuestion } from '../types';
import { api } from '../services/supabase';
import { geminiService } from '../services/gemini';
import { Brain, Check, X, RefreshCw, Trophy, ArrowRight, Layers, RotateCcw } from 'lucide-react';

interface StudyProps {
  user: UserProfile;
}

export const Study: React.FC<StudyProps> = ({ user }) => {
  const [mode, setMode] = useState<'menu' | 'quiz' | 'flashcards'>('menu');
  
  // Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Flashcard State
  const [cards, setCards] = useState<Word[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- QUIZ FUNCTIONS ---
  const startQuiz = async () => {
    setLoading(true);
    const words = await api.getUserWords(user.id);
    if (words.length < 3) {
      alert("Test oluşturmak için en az 3 kelime eklemelisin!");
      setLoading(false);
      return;
    }
    
    // Pick random words
    const randomWords = words.sort(() => 0.5 - Math.random()).slice(0, 5).map(w => w.english);
    const generatedQuestions = await geminiService.generateQuiz(randomWords);
    
    setQuestions(generatedQuestions);
    setMode('quiz');
    setLoading(false);
    setCurrentQIndex(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedOption(null);
  };

  const handleAnswer = (option: string) => {
    if (selectedOption) return; // Prevent double click
    setSelectedOption(option);
    
    if (option === questions[currentQIndex].correctAnswer) {
      setScore(s => s + 10);
    }

    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    // Determine final score logic
    const finalScore = score + (selectedOption === questions[currentQIndex].correctAnswer ? 10 : 0);
    if (finalScore > 0) {
      await api.updateScore(user.id, finalScore);
    }
  };

  // --- FLASHCARD FUNCTIONS ---
  const startFlashcards = async () => {
    setLoading(true);
    const words = await api.getUserWords(user.id);
    if (words.length === 0) {
      alert("Kelime kartları için önce kelime eklemelisin!");
      setLoading(false);
      return;
    }
    
    // Shuffle
    setCards(words.sort(() => 0.5 - Math.random()));
    setMode('flashcards');
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setLoading(false);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };


  // --- RENDERS ---

  // 1. MENU
  if (mode === 'menu') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200 border border-gray-100 flex flex-col items-center text-center hover:scale-[1.02] transition-transform cursor-pointer group" onClick={startQuiz}>
           <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-6 group-hover:bg-yellow-400 group-hover:text-white transition-colors">
             <Brain size={48} />
           </div>
           <h3 className="text-2xl font-bold text-gray-800 mb-2">Hızlı Test</h3>
           <p className="text-gray-500 mb-6">Eklediğin kelimelerden AI tarafından üretilen sorularla kendini sına.</p>
           <button 
             disabled={loading}
             className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-xl transition-colors flex justify-center"
            >
              {loading ? <RefreshCw className="animate-spin" /> : 'Başla'}
           </button>
        </div>

         <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200 border border-gray-100 flex flex-col items-center text-center hover:scale-[1.02] transition-transform cursor-pointer group" onClick={startFlashcards}>
           <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-400 group-hover:text-white transition-colors">
             <Layers size={48} />
           </div>
           <h3 className="text-2xl font-bold text-gray-800 mb-2">Kelime Kartları</h3>
           <p className="text-gray-500 mb-6">Klasik flashcard yöntemi ile kelimeleri ezberle ve tekrar et.</p>
           <button 
             disabled={loading}
             className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-3 rounded-xl transition-colors flex justify-center"
           >
              {loading ? <RefreshCw className="animate-spin" /> : 'Başla'}
           </button>
        </div>
      </div>
    );
  }

  // 2. QUIZ FINISHED
  if (mode === 'quiz' && quizFinished) {
    return (
       <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center shadow-2xl animate-fade-in">
         <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
         <h2 className="text-3xl font-bold text-gray-800 mb-2">Tebrikler!</h2>
         <p className="text-gray-500 mb-8">Testi tamamladın.</p>
         
         <div className="text-5xl font-black text-yellow-500 mb-8">+{score} <span className="text-lg text-gray-400 font-bold">PUAN</span></div>
         
         <button onClick={() => setMode('menu')} className="bg-gray-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-900 transition-colors">
            Ana Menüye Dön
         </button>
       </div>
    );
  }

  // 3. FLASHCARDS
  if (mode === 'flashcards') {
    const card = cards[currentCardIndex];
    return (
        <div className="max-w-md mx-auto h-[600px] flex flex-col animate-fade-in">
            {/* Header / Progress */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setMode('menu')} className="text-gray-500 hover:text-gray-800 font-bold flex items-center">
                   <ArrowRight className="rotate-180 mr-2" size={18} /> Menü
                </button>
                <span className="font-bold text-gray-400 bg-white px-4 py-1 rounded-full shadow-sm">
                    {currentCardIndex + 1} / {cards.length}
                </span>
            </div>

            {/* Card Area */}
            <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex-1 cursor-pointer group relative perspective-1000"
                style={{ perspective: '1000px' }}
            >
                <div 
                  className="relative w-full h-full transition-all duration-500"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                  }}
                >
                    {/* Front */}
                    <div 
                      className="absolute w-full h-full bg-white rounded-[2.5rem] shadow-2xl shadow-yellow-500/10 border border-gray-100 flex flex-col items-center justify-center p-8"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                        <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4">İngilizce</span>
                        <h2 className="text-5xl font-black text-gray-800 text-center break-words w-full">{card.english}</h2>
                        <div className="absolute bottom-8 flex flex-col items-center text-gray-300">
                           <RotateCcw size={20} className="mb-2" />
                           <span className="text-xs font-bold uppercase">Çevir</span>
                        </div>
                    </div>

                    {/* Back */}
                    <div 
                      className="absolute w-full h-full bg-yellow-400 rounded-[2.5rem] shadow-2xl border border-yellow-300 flex flex-col items-center justify-center p-8 text-yellow-900"
                      style={{ 
                        backfaceVisibility: 'hidden', 
                        transform: 'rotateY(180deg)' 
                      }}
                    >
                        <span className="text-xs font-bold text-yellow-800/60 uppercase tracking-widest mb-4">Türkçe</span>
                        <h2 className="text-4xl font-black mb-6 text-center break-words w-full">{card.turkish}</h2>
                        
                        {card.example_sentence && (
                            <div className="bg-white/20 p-6 rounded-2xl w-full text-center backdrop-blur-sm">
                                <p className="text-lg italic font-medium leading-relaxed mb-2">"{card.example_sentence}"</p>
                                {card.example_turkish && (
                                  <p className="text-sm font-bold text-yellow-900/70 not-italic">({card.example_turkish})</p>
                                )}
                            </div>
                        )}
                        <div className="absolute bottom-8 flex flex-col items-center text-yellow-800/50">
                           <RotateCcw size={20} className="mb-2" />
                           <span className="text-xs font-bold uppercase">Çevir</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mt-8 px-8">
                <button onClick={prevCard} className="p-4 rounded-2xl bg-white shadow-lg hover:bg-gray-50 text-gray-600 transition-all active:scale-95">
                    <ArrowRight className="rotate-180" />
                </button>
                <div className="flex space-x-2 overflow-hidden max-w-[150px] justify-center">
                   {cards.length <= 15 && cards.map((_, i) => (
                      <div key={i} className={`h-2 rounded-full transition-all shrink-0 ${i === currentCardIndex ? 'w-6 bg-yellow-400' : 'w-2 bg-gray-200'}`} />
                   ))}
                </div>
                <button onClick={nextCard} className="p-4 rounded-2xl bg-yellow-400 shadow-lg shadow-yellow-400/30 hover:bg-yellow-500 text-yellow-900 transition-all active:scale-95">
                    <ArrowRight />
                </button>
            </div>
        </div>
    )
  }

  // 4. QUIZ ACTIVE (Default fallback to quiz mode if not menu/flashcards)
  const currentQuestion = questions[currentQIndex] || questions[0]; // safety check

  if (!currentQuestion) return <div>Yükleniyor...</div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-400 font-bold">Soru {currentQIndex + 1}/{questions.length}</span>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold text-sm">Puan: {score}</span>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-yellow-500/5 mb-6">
         <h3 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">{currentQuestion.question}</h3>
         
         <div className="space-y-3">
           {currentQuestion.options.map((opt, idx) => {
             let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium ";
             if (selectedOption) {
               if (opt === currentQuestion.correctAnswer) btnClass += "border-green-500 bg-green-50 text-green-700";
               else if (opt === selectedOption) btnClass += "border-red-500 bg-red-50 text-red-700";
               else btnClass += "border-gray-100 text-gray-400";
             } else {
               btnClass += "border-gray-100 hover:border-yellow-400 hover:bg-yellow-50 text-gray-700";
             }

             return (
               <button 
                 key={idx} 
                 onClick={() => handleAnswer(opt)}
                 className={btnClass}
                 disabled={!!selectedOption}
               >
                 <div className="flex justify-between items-center">
                   <span>{opt}</span>
                   {selectedOption && opt === currentQuestion.correctAnswer && <Check size={20} className="text-green-600" />}
                   {selectedOption && opt === selectedOption && opt !== currentQuestion.correctAnswer && <X size={20} className="text-red-600" />}
                 </div>
               </button>
             );
           })}
         </div>

         {selectedOption && (
           <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
             <span className="font-bold block mb-1">Açıklama:</span>
             {currentQuestion.explanation}
           </div>
         )}
      </div>
    </div>
  );
};