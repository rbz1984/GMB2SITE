import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
async function test() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Return JSON: {"hello": "world"}' }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}
test();
