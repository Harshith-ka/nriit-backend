import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { owner: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

projectRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, description, openRoles } = req.body;
    const project = await prisma.project.create({
      data: {
        title,
        description,
        openRoles: JSON.stringify(openRoles || []),
        ownerId: req.userId!
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

projectRouter.post('/:id/apply', async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    const application = await prisma.jobApplication.create({
      data: {
        projectId: String(req.params.id),
        userId: req.userId!,
        role
      }
    });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
