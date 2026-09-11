import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;

async function testLite() {
  const modelsToTest = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
  for (const m of modelsToTest) {
    console.log('Testing Lite model:', m);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Return JSON: {"status": "ok"}' }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 200 }
      })
    });
    const json = await res.json();
    if (json.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log(`✅ ${m} WORKS:`, json.candidates[0].content.parts[0].text);
      return m;
    } else {
      console.log(`❌ ${m} error:`, json.error?.message?.substring(0, 100));
    }
  }
}

testLite();
