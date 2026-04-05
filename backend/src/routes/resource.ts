import { Router } from 'express';
import prisma from '../db/prisma';

const router = Router();

// Tags Endpoint
router.get('/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(tags);
  } catch (error) {
    res.json([]);
  }
});

// Single Resource Endpoint
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'tags') return; // Handled above

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true }
        }
      }
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource.' });
  }
});

export default router;
