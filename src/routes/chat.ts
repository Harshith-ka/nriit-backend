import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const chatRouter = Router();

chatRouter.use(requireAuth);

chatRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId },
          { receiverId: req.userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

chatRouter.post('/message', async (req: AuthRequest, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = await prisma.message.create({
      data: { senderId: req.userId!, receiverId, content }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
