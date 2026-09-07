export type EnglishLevel = 'A2' | 'B1' | 'B2' | 'C1';

export type ReadingMode = 'bilingual' | 'en_only' | 'vi_only';

export type ActiveTab =
  | 'trang_chu'
  | 'nong_nghiep'
  | 'bai_doc_hom_nay'
  | 'tu_vung'
  | 'kiem_tra'
  | 'tien_do'
  | 'cai_dat';

export type MasteryLevel = 'chua_thuoc' | 'dang_hoc' | 'da_nho';

export interface SentenceItem {
  id: string;
  en: string;
  vi: string;
  subject?: string;
  verb?: string;
  object?: string;
  grammarStructure?: string;
  clauses?: string;
  tense?: string;
  keyPhrases?: Array<{ phrase: string; meaning: string; usage: string }>;
  learningTip?: string;
}

export interface ArticleParagraph {
  id: string;
  en: string;
  vi: string;
  sentences: SentenceItem[];
}

export interface WordLookupData {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  simpleEnglish: string;
  example: string;
  exampleVi: string;
  collocations: string[];
  agriculturalContextNote?: string;
}

export interface SavedWord extends WordLookupData {
  id: string;
  sourceSentenceEn: string;
  sourceSentenceVi: string;
  articleTitle: string;
  topic: string;
  savedAt: string;
  masteryLevel: MasteryLevel;
}

export interface SentenceAnalysis {
  originalSentence: string;
  vietnameseTranslation: string;
  subject: string;
  verb: string;
  object: string;
  grammarStructure: string;
  clauses: string;
  tense: string;
  keyPhrases: Array<{ phrase: string; meaning: string; usage: string }>;
  learningTip: string;
}

export interface QuizQuestion {
  id: number;
  type: string;
  questionEn: string;
  questionVi: string;
  options: string[];
  correctAnswerIndex: number;
  explanationVi: string;
}

export interface AiExplanationData {
  summary: string;
  mainPoints: string[];
  paragraphExplanations: Array<{ paragraphIndex: number; vietnameseExplanation: string }>;
  agriculturalKnowledge: Array<{ concept: string; explanation: string }>;
  keyVocabulary: WordLookupData[];
  difficultSentences: Array<{ englishSentence: string; vietnameseTranslation: string; grammarNote: string }>;
}

export interface Article {
  id: string;
  titleEn: string;
  titleVi: string;
  topic: string;
  level: EnglishLevel;
  readTimeMin: number;
  newWordsCount: number;
  date: string;
  image: string;
  author: string;
  source: string;
  summaryEn: string;
  summaryVi: string;
  isDailyPick?: boolean;
  paragraphs: ArticleParagraph[];
  curatedVocab: WordLookupData[];
  curatedQuiz: QuizQuestion[];
  curatedAiExplanation: AiExplanationData;
}

export type NavigationTab =
  | 'trang_chu'
  | 'nong_nghiep'
  | 'bai_doc_hom_nay'
  | 'tu_vung'
  | 'tien_do'
  | 'cai_dat';

export interface UserProgress {
  articlesReadCount: number;
  wordsLearnedCount: number;
  studyStreakDays: number;
  averageQuizScore: number;
  readingTimeMinutes: number;
  vocabularyMemorizationRate?: number;
  currentLevel: EnglishLevel;
  lastReadDate?: string;
  readArticleIds?: string[];
  quizScoresHistory: Array<{
    id: string;
    articleId?: string;
    articleTitle: string;
    score: number;
    total: number;
    percentage: number;
    date: string;
  }>;
}

export interface UserSettings {
  level: EnglishLevel;
  defaultReadingMode: ReadingMode;
  fontSize: 'normal' | 'large' | 'extra-large';
  autoPronounceWord: boolean;
  highlightTechnicalTerms?: boolean;
  dailyGoalArticles?: number;
}
