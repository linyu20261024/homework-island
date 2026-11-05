import { GoogleGenAI } from '@google/genai';
import { SubjectType } from '../types/homework';

export interface ExtractedHomeworkFromAI {
  title: string;
  subject: SubjectType;
  description: string;
  estimatedMinutes: number;
}

export async function extractHomeworkFromImage(
  imageBase64: string,
  customApiKey?: string
): Promise<ExtractedHomeworkFromAI | null> {
  const apiKey =
    customApiKey ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    localStorage.getItem('hw_gemini_api_key');

  if (!apiKey) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Remove base64 data header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: `这是学生黑板、作业单或课本上的作业照片。请识别并提取作业信息，以纯 JSON 格式输出，不要包含 Markdown 标记或多余文字。
JSON 字段：
{
  "title": "精炼的作业标题（如：数学练习册第15页第1-4题）",
  "subject": "chinese" | "math" | "english" | "science" | "art" | "sports" | "reading" | "other",
  "description": "详细要求与注意事项",
  "estimatedMinutes": 预估用时数字（如 20）
}`,
            },
          ],
        },
      ],
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ExtractedHomeworkFromAI;
    }
    return null;
  } catch (error) {
    console.error('Gemini image extraction error:', error);
    return null;
  }
}
