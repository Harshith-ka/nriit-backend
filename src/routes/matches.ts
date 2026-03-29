import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const matchRouter = Router();

matchRouter.use(requireAuth);

matchRouter.post('/swipe', async (req: AuthRequest, res) => {
  try {
    const { targetUserId, action } = req.body; // action: 'LIKE' or 'PASS'
    const userId = req.userId!;

    const existingMatch = await prisma.match.findFirst({
      where: { user1Id: targetUserId, user2Id: userId, status: 'PENDING' }
    });

    if (existingMatch && action === 'LIKE') {
      const match = await prisma.match.update({
        where: { id: existingMatch.id },
        data: { status: 'ACCEPTED' }
      });
      res.json({ match, isMatch: true });
      return;
    } else if (action === 'LIKE') {
      const match = await prisma.match.create({
        data: { user1Id: userId, user2Id: targetUserId, status: 'PENDING' }
      });
      res.json({ match, isMatch: false });
      return;
    }

    res.json({ success: true, isMatch: false });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

matchRouter.get('/requests', async (req: AuthRequest, res) => {
  try {
    const requests = await prisma.match.findMany({
      where: { user2Id: req.userId, status: 'PENDING' },
      include: { user1: true }
    });
    res.json(requests.map((r: any) => r.user1));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

matchRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: req.userId, status: 'ACCEPTED' },
          { user2Id: req.userId, status: 'ACCEPTED' }
        ]
      },
      include: { user1: true, user2: true }
    });
    
    const formattedMatches = matches.map((m: any) => 
      m.user1Id === req.userId ? m.user2 : m.user1
    );

    res.json(formattedMatches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
