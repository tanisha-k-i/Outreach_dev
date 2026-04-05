import { Router } from 'express';
import prisma from '../db/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const q = req.query.q as string;

    if (!q || q.trim() === '') {
      // Return trnending/recently uploaded if no query
      const recent = await prisma.resource.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          tags: {
            include: { tag: true }
          }
        }
      });
      return res.json(recent);
    }

    // Log the search query asynchronously
    prisma.searchLog.create({
      data: { query: q }
    }).catch(console.error);

    // Using PostgreSQL raw query for Full-Text Search
    // We search the title, subject, and description.
    // title has highest weight (A), subject (B), description (C)
    const results = await prisma.$queryRaw`
      SELECT r.id, r.title, r.type, r.subject, r.description, r.file_url, r.external_url, r.created_at,
        ts_rank(
          setweight(to_tsvector('english', coalesce(r.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(r.subject, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(r.description, '')), 'C'),
          websearch_to_tsquery('english', ${q})
        ) as rank
      FROM "Resource" r
      WHERE 
        (setweight(to_tsvector('english', coalesce(r.title, '')), 'A') ||
         setweight(to_tsvector('english', coalesce(r.subject, '')), 'B') ||
         setweight(to_tsvector('english', coalesce(r.description, '')), 'C'))
        @@ websearch_to_tsquery('english', ${q})
      ORDER BY rank DESC
      LIMIT 20;
    `;

    // Fetch tags for these results
    const resourceIds = (results as any[]).map(r => r.id);
    
    if (resourceIds.length === 0) {
      return res.json([]);
    }

    const resourcesWithTags = await prisma.resource.findMany({
      where: { id: { in: resourceIds } },
      include: {
        tags: {
          include: { tag: true }
        }
      }
    });

    // Merge tags back into ranked results to preserve order
    const formattedResults = (results as any[]).map(r => {
      const match = resourcesWithTags.find((rt: any) => rt.id === r.id);
      return {
        ...r,
        tags: match?.tags || []
      };
    });

    res.json(formattedResults);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to execute search.' });
  }
});

export default router;
