import { Router } from 'express';
import { prisma } from '../prisma';

export const userRouter = Router();

userRouter.get('/', async (req, res) => {
  try {
    // Return users for MVP swiping (excluding passwords)
    const users = await prisma.user.findMany({
      select: { id: true, name: true, skills: true, goals: true, interests: true, bio: true, portfolio_links: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

userRouter.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, skills: true, goals: true, interests: true, bio: true, portfolio_links: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
userRouter.get('/:id/stats', async (req, res) => {
  try {
    const likeCount = await prisma.match.count({
      where: { user2Id: req.params.id, status: { in: ['PENDING', 'ACCEPTED'] } }
    });
    const projectCount = await prisma.project.count({
      where: { ownerId: req.params.id }
    });
    res.json({ likeCount, projectCount });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
