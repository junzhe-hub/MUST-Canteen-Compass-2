import { GoogleGenAI } from "@google/genai";
import { RESTAURANTS } from '../constants';

// Use Vite environment variables exposed to the client. In Vite, only
// variables prefixed with `VITE_` are exposed to the browser via
// `import.meta.env`.
const apiKey = (import.meta as any).env?.VITE_API_KEY as string | undefined;
const ai = new GoogleGenAI({ apiKey: apiKey ?? '' });

export const generateFoodRecommendation = async (userQuery: string): Promise<string> => {
  try {
    // Prepare context from our mock data including detailed ratings
    const menuContext = RESTAURANTS.map(r => {
      const reviewSummary = r.reviews.length > 0 
        ? `近期评价: ${r.reviews.map(rev => `"${rev.comment}"`).join('; ')}`
        : "暂无评价。";
        
      return `
        档口: ${r.name}
        位置: ${r.location}
        菜系: ${r.cuisineType}
        综合评分: ${r.rating}/5
        评分明细 - 卖相: ${r.ratingBreakdown.appearance}, 香气: ${r.ratingBreakdown.aroma}, 味道: ${r.ratingBreakdown.taste}
        菜单: ${r.menu.map(d => `${d.name} (${d.price} MOP)`).join(', ')}
        评论: ${reviewSummary}
      `;
    }).join('\n---\n');

    const prompt = `
      你是 "MUST 食堂指南" 的 AI 助手，这是一个旨在帮助学生避免“踩雷”（难吃的食物）并发现宝藏美食的大学美食指南。
      
      以下是校园内档口和菜品的实时数据：
      ${menuContext}

      用户问道: "${userQuery}"

      你的目标是：
      1. 帮助用户避免“踩雷”（低评分或差评的档口）。
      2. 根据他们的口味偏好（辣、甜等）推荐菜品。
      3. 提及具体的评分维度（例如，“它的香气得分很高，但味道一般”）。
      4. 简洁、友好，表现得像一位给建议的学长/学姐。
      5. 请务必使用中文回答。
      
      控制在 120 字以内。适当使用表情符号。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "抱歉，我现在想不出什么好推荐的。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "哎呀！我的大脑短路了，请稍后再试。";
  }
};