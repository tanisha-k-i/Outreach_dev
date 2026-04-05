import { Router } from 'express';
import prisma from '../db/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, created_at: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

router.get('/uploads', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const uploads = await prisma.resource.findMany({
      where: { uploader_id: userId },
      orderBy: { created_at: 'desc' },
      include: { tags: { include: { tag: true } } }
    });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch uploads.' });
  }
});

router.get('/saved', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const saved = await prisma.savedResource.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        resource: {
          include: { tags: { include: { tag: true } } }
        }
      }
    });
    res.json(saved.map((s: any) => s.resource));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved resources.' });
  }
});

router.post('/saved/:resourceId', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { resourceId } = req.params;

    const existing = await prisma.savedResource.findUnique({
      where: {
        user_id_resource_id: { user_id: userId, resource_id: resourceId }
      }
    });

    if (existing) {
      // Unsave
      await prisma.savedResource.delete({
        where: { user_id_resource_id: { user_id: userId, resource_id: resourceId } }
      });
      return res.json({ saved: false });
    } else {
      // Save
      await prisma.savedResource.create({
        data: { user_id: userId, resource_id: resourceId }
      });
      return res.json({ saved: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle saved status.' });
  }
});

// Check if a specific resource is saved
router.get('/saved/:resourceId', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { resourceId } = req.params;

    const existing = await prisma.savedResource.findUnique({
      where: {
        user_id_resource_id: { user_id: userId, resource_id: resourceId }
      }
    });

    res.json({ saved: !!existing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check saved status.' });
  }
});

export default router;
