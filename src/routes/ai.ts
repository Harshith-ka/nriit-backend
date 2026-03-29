import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';

export const aiRouter = Router();

aiRouter.use(requireAuth);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder' });

aiRouter.get('/matches', async (req: AuthRequest, res) => {
  try {
    const db = admin.firestore();
    const userSnap = await db.collection('users').doc(req.userId!).get();
    
    if (!userSnap.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    const user = userSnap.data();
    
    const usersSnap = await db.collection('users').get();
    const allUsers = usersSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.id !== req.userId);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder') {
      res.json(allUsers.slice(0, 5));
      return;
    }

    const sysPrompt = `You are a matchmaker for student co-founders. Analyze the current user and suggest the top 3 best fits from the candidates based on complementary skills and goals.
    Return ONLY a JSON array of strings containing the candidate IDs. Example: ["id1", "id2", "id3"]`;
    
    const userPrompt = `
      Current User: ${JSON.stringify({ skills: user?.skills, goals: user?.goals, bio: user?.bio })}
      Candidates: ${JSON.stringify(allUsers)}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    try {
      const matchIds = JSON.parse(completion.choices[0].message.content || '[]');
      const topMatches = allUsers.filter(u => matchIds.includes(u.id));
      res.json(topMatches.length > 0 ? topMatches : allUsers.slice(0, 3));
    } catch (e) {
      res.json(allUsers.slice(0, 3));
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
