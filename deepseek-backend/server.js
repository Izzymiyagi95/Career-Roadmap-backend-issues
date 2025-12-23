// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');

// Ensure pdf-parse resolves to the function in CommonJS environments
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// Provide fetch in Node (compatible approach without changing module type)
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const mammoth = require('mammoth');

const app = express();
const PORT = 4000;

// ---- Startup diagnostics ----
console.log('pdfParse type:', typeof pdfParse); // should be "function"

// ---- Multer (file uploads) ----
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ---- CORS configuration ----
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  })
);

// ---- Body parsing ----
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ---- Health root ----
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// ---- Helpers ----
function isSupportedFile(filename) {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith('.pdf') ||
    lower.endsWith('.docx') ||
    lower.endsWith('.doc') ||
    lower.endsWith('.txt')
  );
}

// Extract text from different file types
async function extractTextFromFile(file) {
  if (!file) return '';
  const filename = file.originalname || 'unknown';
  const lower = filename.toLowerCase();

  if (!isSupportedFile(lower)) {
    console.warn(`Unsupported file type: ${filename}`);
    return '';
  }

  // TXT
  if (lower.endsWith('.txt')) {
    const text = file.buffer.toString('utf-8');
    console.log(`✅ TXT parsed: ${filename}, length: ${text.length}`);
    return text;
  }

  // DOC/DOCX via mammoth
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      const text = result?.value || '';
      console.log(`✅ DOCX parsed: ${filename}, length: ${text.length}`);
      return text;
    } catch (error) {
      console.error('❌ Error extracting DOCX:', error);
      return '';
    }
  }

  // PDF via pdf-parse
  if (lower.endsWith('.pdf')) {
    try {
      if (typeof pdfParse !== 'function') {
        throw new Error('pdfParse is not a function — check import');
      }
      const data = await pdfParse(file.buffer);
      const text = data?.text || '';
      console.log(`✅ PDF parsed: ${filename}, length: ${text.length}`);
      return text;
    } catch (error) {
      console.error('❌ Error extracting PDF:', error);
      return '';
    }
  }

  return '';
}

// ---- Analyze endpoint ----
app.post(
  '/api/analyze',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'transcript', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('📥 Analysis request received');

      let resumeText = req.body.resumeText || '';
      let transcriptText = req.body.transcriptText || '';

      // Extract from uploaded files if present
      if (req.files) {
        if (req.files.resume && req.files.resume[0]) {
          const extractedText = await extractTextFromFile(req.files.resume[0]);
          if (extractedText) resumeText = extractedText;
        }
        if (req.files.transcript && req.files.transcript[0]) {
          const extractedText = await extractTextFromFile(req.files.transcript[0]);
          if (extractedText) transcriptText = extractedText;
        }
      }

      console.log('Resume text length:', resumeText.length);
      console.log('Transcript text length:', transcriptText.length);

      if (!resumeText && !transcriptText) {
        return res.status(400).json({
          error: 'Missing resume and transcript content',
          message:
            'No readable text was extracted. Ensure files are text-based (not scanned images), or paste content manually.'
        });
      }

      // Dev mode fallback if no API key
      if (!process.env.DEEPSEEK_API_KEY) {
        const mockResponse = {
          currentProfile: {
            currentRole: 'Software Engineer',
            yearsExperience: '3 years',
            salaryRange: '$85,000 - $100,000',
            education: "Bachelor's in Computer Science",
            keyStrengths: ['Problem Solving', 'Teamwork', 'Adaptability'],
            technicalSkills: ['JavaScript', 'React', 'HTML/CSS', 'Git']
          },
          careerTimeline: [
            {
              timeframe: '6-12 months',
              role: 'Senior Developer',
              salary: '$110,000 - $130,000',
              requirements: ['Advanced JavaScript', 'React Mastery', 'Mentoring']
            }
          ],
          message: 'Analysis complete! Backend is working (mock mode).'
        };
        console.log('🔧 Mock mode response returned (no API key).');
        return res.json(mockResponse);
      }

      // Construct prompt
      const systemMessage =
        'You are an expert career advisor specializing in IT and data careers. Analyze the provided resume and/or transcript and output ONLY valid JSON with the specified structure.';
      const userMessage = `RESUME:\n${
        resumeText.substring(0, 4000) || 'Not provided'
      }\n\nTRANSCRIPT:\n${transcriptText.substring(0, 4000) || 'Not provided'}`;

      console.log('🌐 Calling DeepSeek API...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DeepSeek API error:', errorText);
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('No content in DeepSeek response');

      // Strip code fences if present and parse JSON safely
      const cleanContent = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      let parsed;
      try {
        parsed = JSON.parse(cleanContent);
      } catch (e) {
        console.error('❌ JSON parse error. Raw content:', content);
        throw new Error('Invalid JSON returned by AI');
      }

      console.log('✅ Analysis successful');
      return res.status(200).json(parsed);
    } catch (error) {
      console.error('❌ Analysis error:', error);
      return res.status(500).json({ error: 'Analysis failed', message: error.message });
    }
  }
);

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`🔐 API Key configured: ${process.env.DEEPSEEK_API_KEY ? 'Yes' : 'No'}`);
});
