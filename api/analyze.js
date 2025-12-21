// /api/analyze.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeText, transcriptText } = req.body;

    // Truncate to prevent token overflow
    const truncatedResume = resumeText?.substring(0, 5000) || '';
    const truncatedTranscript = transcriptText?.substring(0, 5000) || '';

    const prompt = `You are an expert career advisor specializing in IT and data careers. Analyze the following resume and academic transcript to create a personalized career roadmap.

RESUME:
${truncatedResume || 'Not provided'}

TRANSCRIPT:
${truncatedTranscript || 'Not provided'}

Based on this information, provide a comprehensive career analysis in valid JSON format with the following structure: {
  "currentProfile": {
    "currentRole": "string",
    "yearsExperience": 5,
    "salaryRange": "string",
    "keyStrengths": ["strength1", "strength2"],
    "technicalSkills": ["skill1", "skill2"],
    "education": "string"
  },
  "careerPaths": [
    {
      "role": "string",
      "priority": "High/Medium/Low",
      "timeframe": "string",
      "salaryRange": "string",
      "fitReason": "string"
    }
  ]
}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career advisor. Output ONLY valid JSON. No explanations, no markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message,
      fallback: true 
    });
  }
}