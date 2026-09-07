import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize GoogleGenAI
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    service: "AgriRead API",
  });
});

// AI: Explain Article
app.post("/api/ai/explain-article", async (req, res) => {
  try {
    const { titleEn, contentEn, level = "B1" } = req.body;
    if (!contentEn) {
      return res.status(400).json({ error: "Thiếu nội dung bài báo" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY",
        fallbackAvailable: true,
      });
    }

    const prompt = `Bạn là một gia sư tiếng Anh chuyên ngành Nông nghiệp cao cấp dành cho người học Việt Nam ở trình độ ${level}.
Hãy phân tích và giải thích bài báo tiếng Anh sau đây bằng TIẾNG VIỆT tự nhiên, chuẩn xác thuật ngữ nông nghiệp (ví dụ: "crop yield" -> "năng suất cây trồng", "pathogen" -> "tác nhân gây bệnh", "sustainable agriculture" -> "nông nghiệp bền vững").

TIÊU ĐỀ: ${titleEn || "Bài viết nông nghiệp"}
NỘI DUNG:
${contentEn}

Vui lòng trả về kết quả dưới định dạng JSON thuần túy (không bọc trong \`\`\`json) với cấu trúc sau:
{
  "summary": "Tóm tắt bài báo nói về gì một cách đơn giản, súc tích (khoảng 3-4 câu tiếng Việt).",
  "mainPoints": [
    "Ý chính 1 (tiếng Việt)",
    "Ý chính 2 (tiếng Việt)",
    "Ý chính 3 (tiếng Việt)",
    "Ý chính 4 (tiếng Việt)"
  ],
  "paragraphExplanations": [
    {
      "paragraphIndex": 1,
      "vietnameseExplanation": "Giải thích nội dung đoạn 1 bằng tiếng Việt dễ hiểu."
    }
  ],
  "agriculturalKnowledge": [
    {
      "concept": "Tên khái niệm nông nghiệp (Ví dụ: Precision Agriculture)",
      "explanation": "Giải thích chi tiết khái niệm này trong thực tiễn nông nghiệp bằng tiếng Việt."
    }
  ],
  "keyVocabulary": [
    {
      "word": "từ tiếng Anh",
      "phonetic": "/phiên âm IPA/",
      "partOfSpeech": "loại từ (danh từ, động từ...)",
      "vietnameseMeaning": "nghĩa chuyên ngành nông nghiệp",
      "simpleEnglish": "giải thích bằng tiếng Anh đơn giản",
      "example": "câu ví dụ tiếng Anh",
      "exampleVi": "bản dịch ví dụ tiếng Việt"
    }
  ],
  "difficultSentences": [
    {
      "englishSentence": "câu tiếng Anh khó trong bài",
      "vietnameseTranslation": "bản dịch tiếng Việt tự nhiên",
      "grammarNote": "phân tích ngữ pháp và điểm cần chú ý"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Không nhận được phản hồi từ AI");
    }

    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Lỗi AI explain-article:", error);
    return res.status(500).json({
      error: error.message || "Lỗi xử lý giải thích bài báo từ AI",
    });
  }
});

// AI: Sentence Analysis
app.post("/api/ai/analyze-sentence", async (req, res) => {
  try {
    const { sentence, context = "", level = "B1" } = req.body;
    if (!sentence) {
      return res.status(400).json({ error: "Thiếu câu cần phân tích" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY",
        fallbackAvailable: true,
      });
    }

    const prompt = `Bạn là chuyên gia phân tích ngữ pháp tiếng Anh và tiếng Anh chuyên ngành nông nghiệp.
Hãy phân tích câu tiếng Anh sau cho người học Việt Nam ở trình độ ${level}:
CÂU: "${sentence}"
NGỮ CẢNH: "${context}"

Yêu cầu trả về JSON thuần túy (không bọc trong markdown) với cấu trúc:
{
  "originalSentence": "${sentence}",
  "vietnameseTranslation": "Bản dịch tự nhiên, chuẩn xác theo thuật ngữ nông nghiệp",
  "subject": "Chủ ngữ (Subject) trong câu và giải thích",
  "verb": "Động từ chính (Main verb) và trợ động từ (nếu có)",
  "object": "Tân ngữ (Object) hoặc bổ ngữ (Complement)",
  "grammarStructure": "Cấu trúc ngữ pháp trọng tâm (ví dụ: Mệnh đề quan hệ rút gọn, Câu điều kiện loại 2, Thể bị động...)",
  "clauses": "Các mệnh đề cấu thành câu (Mệnh đề chính, mệnh đề phụ thuộc...)",
  "tense": "Thì của động từ và lý do sử dụng thì này",
  "keyPhrases": [
    {
      "phrase": "cụm từ hoặc thuật ngữ",
      "meaning": "nghĩa tiếng Việt trong nông nghiệp",
      "usage": "cách dùng trong văn cảnh này"
    }
  ],
  "learningTip": "Mẹo dịch hoặc điểm ngữ pháp cốt lõi cần nhớ bằng tiếng Việt"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Không nhận được phản hồi từ AI");
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Lỗi AI analyze-sentence:", error);
    return res.status(500).json({
      error: error.message || "Lỗi phân tích câu từ AI",
    });
  }
});

// AI: Word Lookup
app.post("/api/ai/lookup-word", async (req, res) => {
  try {
    const { word, sentence = "", level = "B1" } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Thiếu từ cần tra cứu" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY",
        fallbackAvailable: true,
      });
    }

    const prompt = `Bạn là từ điển Anh - Việt chuyên ngành nông nghiệp.
Hãy tra cứu từ vựng tiếng Anh sau trong ngữ cảnh bài báo nông nghiệp cho người học Việt Nam:
TỪ: "${word}"
CÂU CHỨA TỪ: "${sentence}"
TRÌNH ĐỘ NGƯỜI HỌC: ${level}

Trả về JSON thuần túy (không bọc trong \`\`\`json) với cấu trúc:
{
  "word": "${word}",
  "phonetic": "/phiên âm chuẩn IPA/",
  "partOfSpeech": "Loại từ (Danh từ, Động từ, Tính từ, Trạng từ)",
  "vietnameseMeaning": "Nghĩa tiếng Việt chuẩn xác nhất trong ngữ cảnh nông nghiệp",
  "simpleEnglish": "Giải thích ngắn gọn bằng tiếng Anh đơn giản",
  "example": "Một câu ví dụ tiếng Anh liên quan đến nông nghiệp",
  "exampleVi": "Bản dịch tiếng Việt của câu ví dụ",
  "collocations": [
    "Cụm từ thường gặp 1 (Ví dụ: crop yield)",
    "Cụm từ thường gặp 2",
    "Cụm từ thường gặp 3"
  ],
  "agriculturalContextNote": "Lưu ý hoặc kiến thức nông nghiệp thú vị liên quan đến từ này (tiếng Việt)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Không nhận được phản hồi");
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Lỗi AI lookup-word:", error);
    return res.status(500).json({
      error: error.message || "Lỗi tra từ từ AI",
    });
  }
});

// AI: Quiz Generator
app.post("/api/ai/generate-quiz", async (req, res) => {
  try {
    const { titleEn, contentEn, level = "B1" } = req.body;
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY",
        fallbackAvailable: true,
      });
    }

    const prompt = `Tạo bài kiểm tra đọc hiểu nông nghiệp gồm 5 câu hỏi dựa trên bài báo sau cho người học tiếng Anh trình độ ${level}.
TIÊU ĐỀ: ${titleEn}
NỘI DUNG:
${contentEn}

Các dạng câu hỏi cần bao gồm:
1. Ý chính (Main idea)
2. Chi tiết trong bài (Detail)
3. Từ vựng chuyên ngành nông nghiệp (Vocabulary)
4. Đúng / Sai (True / False)
5. Nguyên nhân - kết quả (Cause and effect)

Tất cả hướng dẫn và giải thích bằng TIẾNG VIỆT. Câu hỏi viết bằng tiếng Anh có kèm bản dịch tiếng Việt để người học luyện tập.
Trả về JSON thuần túy (không bọc trong \`\`\`json):
{
  "questions": [
    {
      "id": 1,
      "type": "Ý chính | Chi tiết | Từ vựng | Đúng / Sai | Nguyên nhân – kết quả",
      "questionEn": "Câu hỏi bằng tiếng Anh",
      "questionVi": "Dịch câu hỏi sang tiếng Việt",
      "options": [
        "Lựa chọn A",
        "Lựa chọn B",
        "Lựa chọn C",
        "Lựa chọn D"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết tại sao đáp án này đúng bằng tiếng Việt"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Không nhận được phản hồi từ AI");
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Lỗi AI generate-quiz:", error);
    return res.status(500).json({
      error: error.message || "Lỗi tạo bài kiểm tra từ AI",
    });
  }
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AgriRead server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
