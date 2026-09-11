import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const models = ['gemini-1.5-flash', 'gemini-flash-latest', 'gemini-3.6-flash', 'gemini-2.5-flash-lite'];

async function testCascade() {
  for (const model of models) {
    console.log('Testing model:', model);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Return JSON: {"status": "ok"}' }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await res.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(`✅ SUCCESS with ${model}:`, data.candidates[0].content.parts[0].text);
        return model;
      } else {
        console.log(`❌ ${model} error:`, data.error?.message?.substring(0, 120));
      }
    } catch (err) {
      console.log(`❌ ${model} network error:`, err.message);
    }
  }
}

testCascade();
