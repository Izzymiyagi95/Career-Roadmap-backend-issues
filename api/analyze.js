// /api/analyze.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeText, transcriptText } = req.body;

    // Truncate to prevent token overflow (adjust if DeepSeek has stricter limits)
    const truncatedResume = resumeText?.substring(0, 4000) || '';
    const truncatedTranscript = transcriptText?.substring(0, 4000) || '';

    const systemMessage = `You are an expert career advisor specializing in IT and data careers. 
Output ONLY valid JSON with this structure:
{
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

    const userMessage = `RESUME:\n${truncatedResume || 'Not provided'}\n\nTRANSCRIPT:\n${truncatedTranscript || 'Not provided'}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
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
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Safely extract and parse JSON from the model output
    const content = data.choices?.[0]?.message?.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      throw new Error('Invalid JSON returned from DeepSeek');
    }

    res.status(200).json(parsed);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      fallback: true
    });
  }
}
