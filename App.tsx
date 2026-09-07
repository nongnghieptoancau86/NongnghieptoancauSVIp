import React, { useState, useEffect } from 'react';
import {
  Article,
  SavedWord,
  UserProgress,
  UserSettings,
  WordLookupData,
  SentenceItem,
  MasteryLevel,
  NavigationTab
} from './types';
import { ARTICLES_DATA } from './data/articles';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { AgricultureTopics } from './components/AgricultureTopics';
import { DailyReading } from './components/DailyReading';
import { MyVocabulary } from './components/MyVocabulary';
import { UserProgressDashboard } from './components/UserProgressDashboard';
import { SettingsView } from './components/SettingsView';
import { ArticleReader } from './components/ArticleReader';
import { ReadingQuiz } from './components/ReadingQuiz';
import { WordLookupModal } from './components/WordLookupModal';
import { SentenceAnalysisModal } from './components/SentenceAnalysisModal';
import { AiExplainModal } from './components/AiExplainModal';
import { Sprout, BookOpen, ShieldCheck, Heart } from 'lucide-react';

const INITIAL_PROGRESS: UserProgress = {
  articlesReadCount: 3,
  wordsLearnedCount: 18,
  studyStreakDays: 5,
  averageQuizScore: 88,
  readingTimeMinutes: 46,
  vocabularyMemorizationRate: 72,
  currentLevel: 'B1',
  quizScoresHistory: [
    {
      id: 'quiz-init-1',
      articleTitle: 'Biến đổi khí hậu đang định hình lại nền nông nghiệp toàn cầu',
      date: '2025-05-17',
      score: 4,
      total: 5,
      percentage: 80,
    },
    {
      id: 'quiz-init-2',
      articleTitle: 'Thị trường sầu riêng Việt Nam bứt phá xuất khẩu',
      date: '2025-05-16',
      score: 5,
      total: 5,
      percentage: 100,
    },
  ],
};

const INITIAL_SETTINGS: UserSettings = {
  level: 'B1',
  defaultReadingMode: 'bilingual',
  fontSize: 'normal',
  autoPronounceWord: true,
  dailyGoalArticles: 1,
};

const INITIAL_WORDS: SavedWord[] = [
  {
    id: 'drought-1',
    word: 'drought',
    phonetic: '/draʊt/',
    partOfSpeech: 'Danh từ (noun)',
    vietnameseMeaning: 'hạn hán, đợt khô hạn kéo dài',
    simpleEnglish: 'a long period of time when there is little or no rain',
    example: 'Prolonged drought severely reduced rice yields.',
    exampleVi: 'Hạn hán kéo dài làm suy giảm nghiêm trọng năng suất lúa.',
    collocations: ['severe drought', 'drought-resistant variety', 'drought stress'],
    agriculturalContextNote: 'Rất phổ biến khi thảo luận về biến đổi khí hậu tại Đồng bằng Sông Cửu Long.',
    sourceSentenceEn: 'Extreme weather events, including prolonged droughts and unseasonal downpours, are severely disrupting traditional farming calendars.',
    sourceSentenceVi: 'Các hiện tượng thời tiết cực đoan, bao gồm hạn hán kéo dài và mưa lớn trái mùa, đang làm đảo lộn nghiêm trọng lịch mùa vụ truyền thống.',
    articleTitle: 'Biến đổi khí hậu đang định hình lại nền nông nghiệp toàn cầu',
    topic: 'Biến đổi khí hậu',
    savedAt: '2025-05-17',
    masteryLevel: 'da_nho',
  },
  {
    id: 'cultivar-1',
    word: 'cultivar',
    phonetic: '/ˈkʌltɪvɑːr/',
    partOfSpeech: 'Danh từ (noun)',
    vietnameseMeaning: 'giống cây trồng thuần dưỡng do con người lai tạo',
    simpleEnglish: 'a variety of plant that has been produced by deliberate breeding',
    example: 'Scientists developed a new drought-tolerant cultivar.',
    exampleVi: 'Các nhà khoa học đã phát triển một giống cây trồng chịu hạn mới.',
    collocations: ['commercial cultivar', 'crop cultivar', 'resistant cultivar'],
    agriculturalContextNote: 'Từ ghép của "cultivated variety", là thuật ngữ khoa học chính thức của giống cây trồng.',
    sourceSentenceEn: 'Agronomists are accelerating research into heat-resilient cultivars.',
    sourceSentenceVi: 'Các chuyên gia nông học đang đẩy mạnh nghiên cứu về các giống cây trồng chống chịu nhiệt độ cao.',
    articleTitle: 'Biến đổi khí hậu đang định hình lại nền nông nghiệp toàn cầu',
    topic: 'Trồng trọt',
    savedAt: '2025-05-16',
    masteryLevel: 'dang_hoc',
  },
  {
    id: 'pesticide-1',
    word: 'pesticide',
    phonetic: '/ˈpestɪsaɪd/',
    partOfSpeech: 'Danh từ (noun)',
    vietnameseMeaning: 'thuốc bảo vệ thực vật, thuốc trừ sâu',
    simpleEnglish: 'a chemical substance used to kill harmful insects and pests',
    example: 'Farmers are reducing chemical pesticide application.',
    exampleVi: 'Nông dân đang giảm thiểu việc phun thuốc trừ sâu hóa học.',
    collocations: ['biological pesticide', 'pesticide residue', 'organic pesticide'],
    agriculturalContextNote: 'Trong xuất khẩu sầu riêng và rau quả, tiêu chuẩn dư lượng thuốc bảo vệ thực vật (MRL) là chỉ số sống còn.',
    sourceSentenceEn: 'Strict export compliance requires zero chemical pesticide residues.',
    sourceSentenceVi: 'Quy định xuất khẩu nghiêm ngặt đòi hỏi không còn tồn dư thuốc bảo vệ thực vật hóa học.',
    articleTitle: 'Thị trường sầu riêng Việt Nam bứt phá xuất khẩu',
    topic: 'Thuốc bảo vệ thực vật',
    savedAt: '2025-05-15',
    masteryLevel: 'da_nho',
  },
];

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('trang_chu');

  // Active Reading states
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isTakingQuiz, setIsTakingQuiz] = useState<boolean>(false);

  // Modals state
  const [lookupWordData, setLookupWordData] = useState<{
    data: WordLookupData;
    contextEn: string;
    contextVi: string;
  } | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<SentenceItem | null>(null);
  const [isAiExplainOpen, setIsAiExplainOpen] = useState<boolean>(false);

  // Persisted state
  const [articles] = useState<Article[]>(ARTICLES_DATA);
  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => {
    try {
      const stored = localStorage.getItem('agriread_words');
      return stored ? JSON.parse(stored) : INITIAL_WORDS;
    } catch {
      return INITIAL_WORDS;
    }
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const stored = localStorage.getItem('agriread_progress');
      return stored ? JSON.parse(stored) : INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem('agriread_settings');
      return stored ? JSON.parse(stored) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [readArticleIds, setReadArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('agriread_read_articles');
      return stored ? JSON.parse(stored) : ['article-1', 'article-3'];
    } catch {
      return ['article-1', 'article-3'];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('agriread_words', JSON.stringify(savedWords));
    } catch (e) {
      console.warn('localStorage error', e);
    }
  }, [savedWords]);

  useEffect(() => {
    try {
      localStorage.setItem('agriread_progress', JSON.stringify(progress));
    } catch (e) {
      console.warn('localStorage error', e);
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem('agriread_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('localStorage error', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('agriread_read_articles', JSON.stringify(readArticleIds));
    } catch (e) {
      console.warn('localStorage error', e);
    }
  }, [readArticleIds]);

  // Handlers
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsTakingQuiz(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToArticleList = () => {
    setSelectedArticle(null);
    setIsTakingQuiz(false);
  };

  const handleMarkAsRead = (articleId: string) => {
    if (!readArticleIds.includes(articleId)) {
      const updated = [...readArticleIds, articleId];
      setReadArticleIds(updated);
      setProgress((prev) => ({
        ...prev,
        articlesReadCount: updated.length,
        readingTimeMinutes: prev.readingTimeMinutes + (selectedArticle?.readTimeMin || 5),
      }));
    }
  };

  const handleSaveWord = (newWord: SavedWord) => {
    setSavedWords((prev) => {
      const existsIndex = prev.findIndex((w) => w.word.toLowerCase() === newWord.word.toLowerCase());
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newWord;
        return copy;
      }
      return [newWord, ...prev];
    });

    setProgress((prev) => ({
      ...prev,
      wordsLearnedCount: prev.wordsLearnedCount + 1,
    }));
  };

  const handleUpdateWordMastery = (id: string, level: MasteryLevel) => {
    setSavedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, masteryLevel: level } : w))
    );
  };

  const handleRemoveWord = (id: string) => {
    setSavedWords((prev) => prev.filter((w) => w.id !== id));
  };

  const handleCompleteQuiz = (score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    const newQuizRecord = {
      id: `quiz-${Date.now()}`,
      articleTitle: selectedArticle ? selectedArticle.titleVi : 'Bài kiểm tra',
      date: new Date().toISOString().split('T')[0],
      score,
      total,
      percentage,
    };

    setProgress((prev) => {
      const updatedHistory = [newQuizRecord, ...(prev.quizScoresHistory || [])];
      const avg = Math.round(
        updatedHistory.reduce((acc, curr) => acc + curr.percentage, 0) / updatedHistory.length
      );
      return {
        ...prev,
        averageQuizScore: avg,
        quizScoresHistory: updatedHistory,
      };
    });

    // Also auto-mark article as read if not yet
    if (selectedArticle) {
      handleMarkAsRead(selectedArticle.id);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      if (newSettings.level) {
        setProgress((p) => ({ ...p, currentLevel: newSettings.level! }));
      }
      return merged;
    });
  };

  const handleResetProgress = () => {
    setProgress({
      articlesReadCount: 0,
      wordsLearnedCount: savedWords.length,
      studyStreakDays: 1,
      averageQuizScore: 0,
      readingTimeMinutes: 0,
      vocabularyMemorizationRate: 0,
      currentLevel: settings.level,
      quizScoresHistory: [],
    });
    setReadArticleIds([]);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Navigation Bar (Entirely in Vietnamese) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedArticle(null);
          setIsTakingQuiz(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedWordsCount={savedWords.length}
        streakDays={progress.studyStreakDays}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* If user is inside an Article view */}
        {selectedArticle ? (
          isTakingQuiz ? (
            <ReadingQuiz
              article={selectedArticle}
              onCompleteQuiz={handleCompleteQuiz}
              onBackToArticle={() => setIsTakingQuiz(false)}
              userLevel={settings.level}
            />
          ) : (
            <ArticleReader
              article={selectedArticle}
              onBack={handleBackToArticleList}
              onOpenAiExplain={() => setIsAiExplainOpen(true)}
              onStartQuiz={() => setIsTakingQuiz(true)}
              onSelectSentence={(sentence) => setSelectedSentence(sentence)}
              onSelectWord={(wordData, contextEn, contextVi) => {
                setLookupWordData({ data: wordData, contextEn, contextVi });
              }}
              onMarkAsRead={handleMarkAsRead}
              isRead={readArticleIds.includes(selectedArticle.id)}
              settings={settings}
            />
          )
        ) : (
          /* Main Tab Views */
          <>
            {currentTab === 'trang_chu' && (
              <HomeView
                articles={articles}
                progress={progress}
                onSelectArticle={handleSelectArticle}
                onNavigateTab={(tab) => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                readArticleIds={readArticleIds}
              />
            )}

            {currentTab === 'nong_nghiep' && (
              <AgricultureTopics
                articles={articles}
                onSelectArticle={handleSelectArticle}
                readArticleIds={readArticleIds}
                userLevel={settings.level}
              />
            )}

            {currentTab === 'bai_doc_hom_nay' && (
              <DailyReading
                articles={articles}
                onSelectArticle={handleSelectArticle}
                readArticleIds={readArticleIds}
              />
            )}

            {currentTab === 'tu_vung' && (
              <MyVocabulary
                savedWords={savedWords}
                onUpdateMastery={handleUpdateWordMastery}
                onRemoveWord={handleRemoveWord}
              />
            )}

            {currentTab === 'tien_do' && (
              <UserProgressDashboard
                progress={progress}
                savedWords={savedWords}
                onGoToReading={() => setCurrentTab('nong_nghiep')}
                onGoToVocabulary={() => setCurrentTab('tu_vung')}
              />
            )}

            {currentTab === 'cai_dat' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetProgress={handleResetProgress}
              />
            )}
          </>
        )}
      </main>

      {/* Footer in Vietnamese */}
      <footer className="mt-16 border-t border-stone-200 bg-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900 text-sm">AgriRead</span>
              <span className="text-stone-400 ml-2">Nâng cao tiếng Anh qua tin tức Nông nghiệp</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => {
                setCurrentTab('trang_chu');
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 transition"
            >
              Trang chủ
            </button>
            <button
              onClick={() => {
                setCurrentTab('nong_nghiep');
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 transition"
            >
              Nông nghiệp (21 chủ đề)
            </button>
            <button
              onClick={() => {
                setCurrentTab('bai_doc_hom_nay');
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 transition"
            >
              Bài đọc hôm nay
            </button>
            <button
              onClick={() => {
                setCurrentTab('tu_vung');
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 transition"
            >
              Từ vựng của tôi
            </button>
            <button
              onClick={() => {
                setCurrentTab('tien_do');
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 transition"
            >
              Tiến độ học tập
            </button>
            <button
              onClick={() => {
                setCurrentTab('cai_dat');
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 transition"
            >
              Cài đặt
            </button>
          </div>

          <div className="text-stone-400 text-center md:text-right">
            <span>Thiết kế dành riêng cho người học Việt Nam</span>
          </div>
        </div>
      </footer>

      {/* Popups & Modals */}
      {/* 1. Word Lookup Modal */}
      {lookupWordData && (
        <WordLookupModal
          wordData={lookupWordData.data}
          isOpen={!!lookupWordData}
          onClose={() => setLookupWordData(null)}
          onSaveWord={handleSaveWord}
          isWordSaved={savedWords.some(
            (w) => w.word.toLowerCase() === lookupWordData.data.word.toLowerCase()
          )}
          sentenceContextEn={lookupWordData.contextEn}
          sentenceContextVi={lookupWordData.contextVi}
          articleTitle={selectedArticle?.titleVi || 'Nông nghiệp'}
          topic={selectedArticle?.topic || 'Nông nghiệp'}
          userLevel={settings.level}
        />
      )}

      {/* 2. Sentence-by-Sentence Analysis Modal */}
      {selectedSentence && (
        <SentenceAnalysisModal
          sentenceItem={selectedSentence}
          isOpen={!!selectedSentence}
          onClose={() => setSelectedSentence(null)}
          userLevel={settings.level}
        />
      )}

      {/* 3. AI Explain Article Modal */}
      {selectedArticle && isAiExplainOpen && (
        <AiExplainModal
          article={selectedArticle}
          isOpen={isAiExplainOpen}
          onClose={() => setIsAiExplainOpen(false)}
          onSelectWord={(word) => {
            setIsAiExplainOpen(false);
            setLookupWordData({
              data: word,
              contextEn: word.example,
              contextVi: word.exampleVi,
            });
          }}
          userLevel={settings.level}
        />
      )}
    </div>
  );
}
