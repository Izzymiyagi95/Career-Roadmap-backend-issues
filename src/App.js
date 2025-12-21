import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Upload, Brain, TrendingUp, Award, BookOpen, Target, Loader2, FileText, GraduationCap, Briefcase, CheckCircle2, ArrowRight, DollarSign, Calendar, Sparkles, BarChart3, X, Home, User, Settings, LogOut, Download } from 'lucide-react';

// Create context for sharing analysis data
const AnalysisContext = createContext();

// Main Component - INSERT THE FULL COMPONENT HERE
const CareerRoadmapAI = () => {
  const [step, setStep] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      if (type === 'resume') {
        setResumeText(text);
        setResumeFile(file);
      } else {
        setTranscriptText(text);
        setTranscriptFile(file);
      }
    };
    reader.readAsText(file);
  };

  const removeFile = (type) => {
    if (type === 'resume') {
      setResumeFile(null);
      setResumeText('');
    } else {
      setTranscriptFile(null);
      setTranscriptText('');
    }
  };

 const analyzeWithAI = async () => {
  if (!resumeText && !transcriptText) {
    alert('Please upload or paste your resume or transcript');
    return;
  }

  setLoading(true);
  setStep('analyzing');

  try {
    const prompt = `You are an expert career advisor specializing in IT and data careers. Analyze the following resume and academic transcript to create a personalized career roadmap.

RESUME:
${resumeText || 'Not provided'}

TRANSCRIPT:
${transcriptText || 'Not provided'}

Based on this information, provide a comprehensive career analysis in the following JSON format (ONLY output valid JSON, no other text):

{
  "currentProfile": {
    "currentRole": "string",
    "yearsExperience": 5,
    "salaryRange": "string (e.g., R300K-R400K or $60K-$80K)",
    "keyStrengths": ["strength1", "strength2", "strength3", "strength4"],
    "technicalSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "education": "string"
  },
  "careerPaths": [
    {
      "role": "string",
      "priority": "High/Medium/Low",
      "difficulty": "Easy/Medium/Hard",
      "timeframe": "string (e.g., 3-6 months)",
      "salaryRange": "string",
      "seniorSalaryRange": "string",
      "fitReason": "string explaining why this fits their background",
      "requiredSkills": ["skill1", "skill2"]
    }
  ],
  "recommendedCourses": {
    "immediate": [
      {
        "name": "string",
        "platform": "Coursera/Udemy/edX/LinkedIn Learning",
        "duration": "string",
        "cost": "string",
        "priority": "Highest/High/Medium",
        "reason": "string explaining why this course",
        "skills": ["skill1", "skill2"],
        "url": "https://example.com"
      }
    ],
    "shortTerm": [],
    "longTerm": []
  },
  "certifications": [
    {
      "name": "string",
      "provider": "string",
      "cost": "string",
      "difficulty": "Associate/Professional/Expert",
      "timeToComplete": "string",
      "priority": "Highest/High/Medium/Low",
      "reason": "string",
      "salaryImpact": "string"
    }
  ],
  "learningRoadmap": {
    "phase1": {
      "title": "string",
      "duration": "string",
      "focus": "string",
      "expectedOutcome": "string",
      "items": ["item1", "item2", "item3"]
    },
    "phase2": {
      "title": "string",
      "duration": "string",
      "focus": "string",
      "expectedOutcome": "string",
      "items": ["item1", "item2", "item3"]
    },
    "phase3": {
      "title": "string",
      "duration": "string",
      "focus": "string",
      "expectedOutcome": "string",
      "items": ["item1", "item2", "item3"]
    }
  },
  "careerTimeline": [
    {
      "timeframe": "string",
      "role": "string",
      "salary": "string",
      "requirements": ["req1", "req2"]
    }
  ]
}

Provide specific, actionable recommendations based on their actual experience, education, and market demand. Focus on realistic career progression with courses from Coursera, Udemy, edX, LinkedIn Learning, and certifications from AWS, Azure, Google, Microsoft, etc.`;

    const response = await fetch('', { // <-- Change this line
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career advisor. You MUST respond with ONLY valid JSON in the exact format specified. Do not include any explanatory text, markdown, or code fences. Output pure JSON only.'
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
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Try to extract JSON if it's wrapped in markdown
    let jsonString = analysisText;
    
    // Remove markdown code fences if present
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Also try to extract JSON if it's in the middle of other text
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    
    const parsedAnalysis = JSON.parse(jsonString);
    setAnalysis(parsedAnalysis);
    setStep('results');
    
  } catch (error) {
    console.error('Analysis error:', error);
    alert('Error analyzing your documents. Please try again.');
    setStep('upload');
  } finally {
    setLoading(false);
  }
}; 
const callAPI = async () => {
const prompt = `Provide specific, actionable recommendations based on their actual experience, education, and market demand. 
Focus on realistic career progression with courses from Coursera, Udemy, edX, LinkedIn Learning, and certifications from AWS, Azure, Google, Microsoft, etc.`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions',  {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',  // or 'deepseek-coder' for coding tasks
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 4000,
    temperature: 0.7
  })
});

      const data = await response.json();
      const analysisText = data.content.find(block => block.type === 'text')?.text || '';
      
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedAnalysis = JSON.parse(jsonMatch[0]);
        setAnalysis(parsedAnalysis);
        setStep('results');
      } else {
        throw new Error('Could not parse AI response');
      }
    }
     const analyzeDocuments = async () => {
  setLoading(true);

  try {
    // your logic here
    // await fetch(...)
    
  }
    catch (error) {
      console.error('Analysis error:', error);
      alert('Error analyzing your documents. Please try again.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep('upload');
    setAnalysis(null);
    setResumeText('');
    setTranscriptText('');
    setResumeFile(null);
    setTranscriptFile(null);
  };

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">AI Career Roadmap Generator</h1>
            <p className="text-xl text-purple-200">Upload your resume and transcript for personalized career guidance</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Resume Upload */}
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur border-2 border-slate-700 rounded-xl p-8 hover:border-purple-500 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">Resume / CV</h3>
              </div>
              
              {!resumeFile ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-purple-500 transition-all">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-300 mb-2 font-semibold">Click to upload or drag & drop</p>
                    <p className="text-slate-500 text-sm">PDF, DOCX, or TXT</p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.doc"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'resume')}
                      className="hidden"
                    />
                  </div>
                </label>
              ) : (
                <div className="bg-green-900 bg-opacity-30 border-2 border-green-500 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-green-300 font-semibold">{resumeFile.name}</p>
                        <p className="text-green-400 text-sm">{(resumeFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile('resume')}
                      className="text-red-400 hover:text-red-300 transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-slate-400 text-sm mb-2">Or paste your resume text:</p>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 min-h-[150px] focus:border-purple-500 focus:outline-none"
                  placeholder="Paste your resume here..."
                />
              </div>
            </div>

            {/* Transcript Upload */}
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur border-2 border-slate-700 rounded-xl p-8 hover:border-purple-500 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-8 h-8 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">Academic Transcript</h3>
              </div>
              
              {!transcriptFile ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-purple-500 transition-all">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-300 mb-2 font-semibold">Click to upload or drag & drop</p>
                    <p className="text-slate-500 text-sm">PDF, DOCX, or TXT</p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.doc"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'transcript')}
                      className="hidden"
                    />
                  </div>
                </label>
              ) : (
                <div className="bg-green-900 bg-opacity-30 border-2 border-green-500 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-green-300 font-semibold">{transcriptFile.name}</p>
                        <p className="text-green-400 text-sm">{(transcriptFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile('transcript')}
                      className="text-red-400 hover:text-red-300 transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-slate-400 text-sm mb-2">Or paste your transcript:</p>
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 min-h-[150px] focus:border-purple-500 focus:outline-none"
                  placeholder="Paste your transcript here..."
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={analyzeWithAI}
              disabled={!resumeText && !transcriptText}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-xl text-xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Generate My Career Roadmap
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-slate-400 text-sm mt-4">AI analysis powered by deepseek</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Analyzing Your Profile...</h2>
          <div className="space-y-3 text-purple-200 text-lg">
            <p className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Evaluating your experience and skills
            </p>
            <p className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Identifying career opportunities
            </p>
            <p className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Recommending courses and certifications
            </p>
            <p className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Building your personalized roadmap
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results' && analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Your Personalized Career Roadmap</h1>
            <p className="text-xl text-purple-200">AI-Generated Career Strategy Based on Your Profile</p>
            <button
              onClick={resetAll}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Start New Analysis
            </button>
          </div>

          {/* Current Profile */}
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-purple-400" />
              Current Profile Summary
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm">Current Role</p>
                <p className="text-white text-xl font-bold">{analysis.currentProfile.currentRole}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Experience</p>
                <p className="text-white text-xl font-bold">{analysis.currentProfile.yearsExperience} years</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Current Salary Range</p>
                <p className="text-emerald-400 text-xl font-bold">{analysis.currentProfile.salaryRange}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Education</p>
                <p className="text-white text-lg">{analysis.currentProfile.education}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-slate-400 text-sm mb-3">Key Strengths</p>
              <div className="flex flex-wrap gap-2">
                {analysis.currentProfile.keyStrengths.map((strength, idx) => (
                  <span key={idx} className="bg-green-900 bg-opacity-40 border border-green-600 text-green-300 px-3 py-1 rounded-full text-sm">
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-slate-400 text-sm mb-3">Technical Skills</p>
              <div className="flex flex-wrap gap-2">
                {analysis.currentProfile.technicalSkills.map((skill, idx) => (
                  <span key={idx} className="bg-purple-900 bg-opacity-40 border border-purple-600 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Career Timeline */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 bg-opacity-50 backdrop-blur border border-emerald-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              Your Career Growth Timeline
            </h2>
            <div className="space-y-4">
              {analysis.careerTimeline.map((milestone, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="bg-emerald-700 rounded-lg p-3 min-w-[120px] text-center">
                    <p className="text-emerald-200 text-sm font-semibold">{milestone.timeframe}</p>
                  </div>
                  <ArrowRight className="text-emerald-400 w-6 h-6 flex-shrink-0" />
                  <div className="bg-slate-800 bg-opacity-70 rounded-lg p-4 flex-1">
                    <p className="text-white font-bold text-lg">{milestone.role}</p>
                    <p className="text-emerald-400 font-semibold">{milestone.salary}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {milestone.requirements.map((req, i) => (
                        <span key={i} className="text-slate-300 text-xs bg-slate-700 px-2 py-1 rounded">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 bg-opacity-50 backdrop-blur border border-blue-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              Recommended Online Courses
            </h2>

            {/* Immediate Priority */}
            {analysis.recommendedCourses.immediate.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Start Immediately (Next 3 Months)
                </h3>
                <div className="space-y-4">
                  {analysis.recommendedCourses.immediate.map((course, idx) => (
                    <div key={idx} className="bg-slate-800 bg-opacity-70 rounded-lg p-5 border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                        <div>
                          <h4 className="text-xl font-bold text-white">{course.name}</h4>
                          <p className="text-slate-400 text-sm">{course.platform} • {course.duration} • {course.cost}</p>
                        </div>
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
                          {course.priority}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3">{course.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.map((skill, i) => (
                          <span key={i} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short Term */}
            {analysis.recommendedCourses.shortTerm.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-300 mb-4">Short Term (3-9 Months)</h3>
                <div className="space-y-4">
                  {analysis.recommendedCourses.shortTerm.map((course, idx) => (
                    <div key={idx} className="bg-slate-800 bg-opacity-70 rounded-lg p-5 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                        <div>
                          <h4 className="text-xl font-bold text-white">{course.name}</h4>
                          <p className="text-slate-400 text-sm">{course.platform} • {course.duration} • {course.cost}</p>
                        </div>
                        <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-bold">
                          {course.priority}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3">{course.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.map((skill, i) => (
                          <span key={i} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Long Term */}
            {analysis.recommendedCourses.longTerm.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-4">Long Term (9-18 Months)</h3>
                <div className="space-y-4">
                  {analysis.recommendedCourses.longTerm.map((course, idx) => (
                    <div key={idx} className="bg-slate-800 bg-opacity-70 rounded-lg p-5 border-l-4 border-purple-500">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                        <div>
                          <h4 className="text-xl font-bold text-white">{course.name}</h4>
                          <p className="text-slate-400 text-sm">{course.platform} • {course.duration} • {course.cost}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                          {course.priority}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3">{course.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.map((skill, i) => (
                          <span key={i} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Industry Certifications */}
          <div className="bg-gradient-to-r from-orange-900 to-red-900 bg-opacity-50 backdrop-blur border border-orange-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-orange-400" />
              Industry Certifications to Pursue
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.certifications.map((cert, idx) => (
                <div key={idx} className="bg-slate-800 bg-opacity-70 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h3 className="text-xl font-bold text-white">{cert.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      cert.priority === 'Highest' ? 'bg-red-600 text-white' :
                      cert.priority === 'High' ? 'bg-orange-600 text-white' :
                      cert.priority === 'Medium' ? 'bg-blue-600 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {cert.priority}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-slate-400 text-sm">Provider: <span className="text-white">{cert.provider}</span></p>
                    <p className="text-slate-400 text-sm">Cost: <span className="text-emerald-400">{cert.cost}</span></p>
                    <p className="text-slate-400 text-sm">Time: <span className="text-white">{cert.timeToComplete}</span></p>
                    <p className="text-slate-400 text-sm">Level: <span className="text-purple-400">{cert.difficulty}</span></p>
                  </div>
                  <div className="bg-slate-900 bg-opacity-50 rounded-lg p-3 mb-3">
                    <p className="text-slate-300 text-sm">{cert.reason}</p>
                  </div>
                  <p className="text-emerald-400 font-semibold text-sm">💰 Salary Impact: {cert.salaryImpact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Roadmap Phases */}
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 bg-opacity-50 backdrop-blur border border-purple-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              Your 3-Phase Learning Roadmap
            </h2>
            
            {Object.entries(analysis.learningRoadmap).map(([phaseKey, phase], idx) => (
              <div key={phaseKey} className="mb-6 last:mb-0">
                <div className={`rounded-xl p-6 ${
                  idx === 0 ? 'bg-green-900 bg-opacity-40 border-2 border-green-500' :
                  idx === 1 ? 'bg-blue-900 bg-opacity-40 border-2 border-blue-500' :
                  'bg-purple-900 bg-opacity-40 border-2 border-purple-500'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl ${
                      idx === 0 ? 'bg-green-700' :
                      idx === 1 ? 'bg-blue-700' :
                      'bg-purple-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{phase.title}</h3>
                      <p className="text-slate-300">{phase.duration} • Focus: {phase.focus}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 mb-4">
                    <p className="text-emerald-300 font-semibold mb-2">Expected Outcome:</p>
                    <p className="text-slate-200">{phase.expectedOutcome}</p>
                  </div>
                  <div>
                    <p className="text-slate-300 font-semibold mb-2">Action Items:</p>
                    <ul className="space-y-2">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-200">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Career Paths */}
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Potential Career Paths
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.careerPaths.map((path, idx) => (
                <div key={idx} className="bg-slate-700 bg-opacity-50 rounded-xl p-5 hover:bg-opacity-70 transition-all">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h3 className="text-xl font-bold text-white">{path.role}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      path.priority === 'High' ? 'bg-green-600 text-white' :
                      path.priority === 'Medium' ? 'bg-blue-600 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {path.priority}
                    </span>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Timeframe</p>
                      <p className="text-white font-semibold">{path.timeframe} • {path.difficulty}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Junior/Mid Level</p>
                      <p className="text-emerald-400 font-bold text-xl">{path.salaryRange}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Senior Level</p>
                      <p className="text-emerald-300 font-bold text-lg">{path.seniorSalaryRange}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 mb-4">
                    <p className="text-blue-300 font-semibold mb-2">Why This Fits You:</p>
                    <p className="text-slate-300 text-sm">{path.fitReason}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {path.requiredSkills.map((skill, i) => (
                        <span key={i} className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Summary */}
          <div className="bg-gradient-to-r from-green-900 to-emerald-900 bg-opacity-50 backdrop-blur border-2 border-green-500 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              Investment & ROI Summary
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900 bg-opacity-60 rounded-lg p-6 text-center">
                <p className="text-slate-400 mb-2">Total Courses</p>
                <p className="text-4xl font-bold text-green-400">
                  {analysis.recommendedCourses.immediate.length + 
                   analysis.recommendedCourses.shortTerm.length + 
                   analysis.recommendedCourses.longTerm.length}
                </p>
                <p className="text-slate-300 text-sm mt-2">Online Courses</p>
              </div>
              <div className="bg-slate-900 bg-opacity-60 rounded-lg p-6 text-center">
                <p className="text-slate-400 mb-2">Certifications</p>
                <p className="text-4xl font-bold text-green-400">{analysis.certifications.length}</p>
                <p className="text-slate-300 text-sm mt-2">Industry Credentials</p>
              </div>
              <div className="bg-slate-900 bg-opacity-60 rounded-lg p-6 text-center">
                <p className="text-slate-400 mb-2">Potential Salary</p>
                <p className="text-4xl font-bold text-green-400">
                  {analysis.careerTimeline[analysis.careerTimeline.length - 1].salary}
                </p>
                <p className="text-slate-300 text-sm mt-2">Within 2-3 Years</p>
              </div>
            </div>
            <div className="mt-6 bg-green-800 bg-opacity-40 rounded-lg p-4">
              <p className="text-green-200 text-center font-semibold">
                💡 Your roadmap is designed for realistic, achievable career growth based on your current profile
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
};

// REST OF THE FILE CONTINUES WITH DashboardLayout, DashboardHome, CoursesPage, and App components...
// You need to add the rest of the code from the previous response starting from line where DashboardLayout begins
;

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CareerPath AI</h1>
                <p className="text-xs text-slate-400">Your Career Navigator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-white bg-purple-900 bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-all">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/roadmap" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <TrendingUp className="w-5 h-5" />
              <span>My Roadmap</span>
            </Link>
            <Link to="/courses" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <BookOpen className="w-5 h-5" />
              <span>Courses</span>
            </Link>
            <Link to="/certifications" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <Award className="w-5 h-5" />
              <span>Certifications</span>
            </Link>
            <Link to="/progress" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <BarChart3 className="w-5 h-5" />
              <span>Progress</span>
            </Link>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-slate-400">Software Engineer</p>
              </div>
              <button className="text-slate-400 hover:text-white">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-800 bg-opacity-80 backdrop-blur border-b border-slate-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
              >
                <div className="w-6 h-6">
                  <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${sidebarOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                  <div className={`w-6 h-0.5 bg-current transition-all ${sidebarOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-6 h-0.5 bg-current mt-1.5 transition-all ${sidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </div>
              </button>
              <h2 className="text-xl font-bold text-white">Career Roadmap AI</h2>
            </div>

            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, John!</h1>
        <p className="text-slate-400">Your personalized career roadmap is ready</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Courses Completed</p>
              <p className="text-3xl font-bold text-white mt-2">3/12</p>
            </div>
            <BookOpen className="w-12 h-12 text-purple-300 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Certifications</p>
              <p className="text-3xl font-bold text-white mt-2">1/5</p>
            </div>
            <Award className="w-12 h-12 text-blue-300 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Timeline Progress</p>
              <p className="text-3xl font-bold text-white mt-2">25%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-300 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-900 to-pink-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Salary Target</p>
              <p className="text-3xl font-bold text-white mt-2">$120k</p>
            </div>
            <DollarSign className="w-12 h-12 text-pink-300 opacity-50" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all">
              <span className="text-white">Upload New Resume</span>
              <Upload className="w-5 h-5 text-purple-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all">
              <span className="text-white">Update Progress</span>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all">
              <span className="text-white">View Certifications</span>
              <Award className="w-5 h-5 text-yellow-400" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Complete AWS Cloud Practitioner</p>
                <p className="text-slate-400 text-sm">Due in 2 weeks</p>
              </div>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm">
                Start
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Python for Data Science Course</p>
                <p className="text-slate-400 text-sm">40% completed</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Courses Page Component
const CoursesPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Recommended Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Course cards would be dynamically generated from analysis data */}
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">AWS Solutions Architect</h3>
          <p className="text-slate-400 text-sm mb-4">Coursera • 4 months • $49/month</p>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">High Priority</span>
            <button className="text-purple-400 hover:text-purple-300">View →</button>
          </div>
        </div>
        {/* Add more course cards */}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <AnalysisContext.Provider value={{ analysisData, setAnalysisData }}>
      <Router>
        <Routes>
          <Route path="/" element={
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          } />
          <Route path="/roadmap" element={
            <DashboardLayout>
              <CareerRoadmapAI />
            </DashboardLayout>
          } />
          <Route path="/courses" element={
            <DashboardLayout>
              <CoursesPage />
            </DashboardLayout>
          } />
          <Route path="/certifications" element={
            <DashboardLayout>
              <div className="text-white p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Certifications Page</h1>
                <p>Certifications content goes here</p>
              </div>
            </DashboardLayout>
          } />
          <Route path="/progress" element={
            <DashboardLayout>
              <div className="text-white p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Progress Tracking</h1>
                <p>Progress tracking content goes here</p>
              </div>
            </DashboardLayout>
          } />
        </Routes>
      </Router>
    </AnalysisContext.Provider>
  );
};

// Custom hook for using analysis context
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
};

export default App;