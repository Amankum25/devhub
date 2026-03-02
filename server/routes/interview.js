const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { randomUUID } = require('crypto');
const interviewQuestions = require('../data/interviewQuestions.json');
const { getSession, setSession } = require('../config/redis');

// Helper: get Groq client
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');
  return new Groq({ apiKey });
}

// Helper: pick two questions randomly for a company
function selectQuestions(company) {
  const companyData = interviewQuestions.find(
    (c) => c.company.toLowerCase() === company.toLowerCase()
  );
  if (!companyData) throw new Error(`Unknown company: ${company}`);

  const { medium, hard } = companyData;

  // Randomly choose difficulty combo: mm / hh / mh
  const rand = Math.random();
  let q1, q2;

  if (rand < 0.33) {
    // medium + medium
    const shuffled = [...medium].sort(() => Math.random() - 0.5);
    q1 = shuffled[0];
    q2 = shuffled[1] || shuffled[0];
  } else if (rand < 0.66) {
    // hard + hard
    const shuffled = [...hard].sort(() => Math.random() - 0.5);
    q1 = shuffled[0];
    q2 = shuffled[1] || shuffled[0];
  } else {
    // medium + hard
    q1 = medium[Math.floor(Math.random() * medium.length)];
    q2 = hard[Math.floor(Math.random() * hard.length)];
  }

  return [q1, q2];
}

// Build system prompt
function buildSystemPrompt(company, q1, q2) {
  return `You are a strict but fair technical interviewer at ${company}. You are conducting a real coding interview.

You have exactly TWO questions to ask:
QUESTION 1:
Title: ${q1.title}
Description: ${q1.description}

QUESTION 2:
Title: ${q2.title}
Description: ${q2.description}

== INTERVIEW RULES ==

1. INTRODUCTION: Start by briefly introducing yourself and telling the candidate you will be asking them 2 coding questions today. Then present Question 1 immediately.

2. ONE QUESTION AT A TIME: Never reveal Question 2 until Question 1 is fully done.

3. AFTER EACH ANSWER:
   - Evaluate the candidate's approach (is it correct? is there a better approach?)
   - Discuss time complexity (Big O notation)
   - Discuss space complexity
   - Suggest improvements if needed
   - Ask a relevant follow-up if the answer needs clarification or improvement

4. MOVING TO QUESTION 2: Once you are satisfied with Question 1 discussion, say "Great, let's move to Question 2." and present it.

5. COMPLETION: After evaluating Question 2, end the interview with a final evaluation. Use EXACTLY this JSON block at the very end of your message (after the plain text summary):

\`\`\`json
{
  "type": "INTERVIEW_COMPLETE",
  "score": <number 1-10>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "topics": ["topic1", "topic2"],
  "decision": "Strong Hire / Hire / No Hire"
}
\`\`\`

== HELP MODE ==
- If candidate says "hint", "help", or "I am stuck": Give ONE small hint only, do NOT reveal the solution.
- If candidate says "full solution": Provide the optimal solution with time/space complexity explanation.
- If candidate says "skip": Move to the next question immediately.

== TONE ==
- Professional, realistic, slightly challenging
- Use "Interesting approach", "Let's think about edge cases", "What's the time complexity of that?"
- Do NOT be overly encouraging; be honest

Remember: You are simulating a real ${company} technical interview. Keep responses concise and focused.`;
}

// POST /api/interview/start
router.post('/start', async (req, res) => {
  try {
    const { company } = req.body;
    if (!company) {
      return res.status(400).json({ error: 'Company is required' });
    }

    const questions = selectQuestions(company);
    const sessionId = randomUUID();
    const systemPrompt = buildSystemPrompt(company, questions[0], questions[1]);

    // Initialize session
    const session = {
      sessionId,
      company,
      questions,
      history: [],
      currentQuestion: 1,
      isComplete: false,
      createdAt: new Date().toISOString(),
    };
    await setSession(sessionId, session);

    // Get first AI message
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Start the interview.' },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const aiMessage = completion.choices[0]?.message?.content || '';

    // Save to history and persist
    session.history.push({ role: 'user', content: 'Start the interview.' });
    session.history.push({ role: 'assistant', content: aiMessage });
    await setSession(sessionId, session);

    res.json({
      success: true,
      sessionId,
      message: aiMessage,
      questionNumber: 1,
      totalQuestions: 2,
      isComplete: false,
    });
  } catch (err) {
    console.error('Interview start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start interview' });
  }
});

// POST /api/interview/chat
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    if (!sessionId || !userMessage) {
      return res.status(400).json({ error: 'sessionId and userMessage are required' });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }
    if (session.isComplete) {
      return res.status(400).json({ error: 'Interview already completed' });
    }

    // Add user message to history
    session.history.push({ role: 'user', content: userMessage });

    // Re-build system prompt (in case of restart)
    const systemPrompt = buildSystemPrompt(
      session.company,
      session.questions[0],
      session.questions[1]
    );

    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...session.history,
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const aiMessage = completion.choices[0]?.message?.content || '';
    session.history.push({ role: 'assistant', content: aiMessage });

    // Detect completion via JSON block
    let isComplete = false;
    let evaluation = null;
    const jsonMatch = aiMessage.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.type === 'INTERVIEW_COMPLETE') {
          isComplete = true;
          session.isComplete = true;
          evaluation = {  
            score: parsed.score,
            strengths: parsed.strengths,
            weaknesses: parsed.weaknesses,
            topics: parsed.topics,
            decision: parsed.decision,
          };
        }
      } catch (_) {}
    }

    // Detect question progression (rough heuristic)
    const lowerMsg = aiMessage.toLowerCase();
    if (
      session.currentQuestion === 1 &&
      (lowerMsg.includes("question 2") || lowerMsg.includes("second question") || lowerMsg.includes("move to question 2"))
    ) {
      session.currentQuestion = 2;
    }

    // Persist updated session to Redis
    await setSession(sessionId, session);

    res.json({
      success: true,
      message: aiMessage,
      questionNumber: session.currentQuestion,
      totalQuestions: 2,
      isComplete,
      evaluation,
    });
  } catch (err) {
    console.error('Interview chat error:', err);
    res.status(500).json({ error: err.message || 'Failed to process message' });
  }
});

// GET /api/interview/companies  — list available companies
router.get('/companies', (req, res) => {
  const companies = interviewQuestions.map((c) => c.company);
  res.json({ success: true, companies });
});

// Redis handles TTL-based expiry automatically (SESSION_TTL = 2h set in config/redis.js)

module.exports = router;
