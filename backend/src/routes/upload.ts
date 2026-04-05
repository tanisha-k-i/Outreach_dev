import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { addDemoResource } from '../demoStore';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
  }
});

const upload = multer({ storage });

router.post('/', authMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    const { title, subject, description, type, tags, external_url } = req.body;
    const userId = req.user!.userId;
    
    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and Subject are required.' });
    }

    if (type === 'PDF' && !req.file) {
      return res.status(400).json({ error: 'PDF file is required when type is PDF.' });
    }

    if (type === 'LINK' && !external_url) {
      return res.status(400).json({ error: 'External URL is required when type is LINK.' });
    }

    // Parse tags
    let parsedTags: string[] = [];
    try {
      parsedTags = tags ? JSON.parse(tags) : [];
    } catch (e) {
      parsedTags = tags ? tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
    }

    // Try database insert, fall back to demo mode if DB is unavailable
    try {
      const prisma = (await import('../db/prisma')).default;
      
      const resource = await prisma.resource.create({
        data: {
          title,
          subject,
          description,
          type,
          uploader_id: userId,
          file_url: req.file ? req.file.filename : null,
          external_url: type === 'LINK' ? external_url : null,
          tags: {
            create: parsedTags.map(tag => ({
              tag: {
                connectOrCreate: {
                  where: { name: tag.trim().toLowerCase() },
                  create: { name: tag.trim().toLowerCase() }
                }
              }
            }))
          }
        },
        include: {
          tags: { include: { tag: true } }
        }
      });

      return res.status(201).json(resource);
    } catch (dbError) {
      // Demo mode: DB is not connected, return a mock response
      console.warn('Database unavailable, running in demo mode for upload.');
      
      const mockResource = {
        id: `demo-${Date.now()}`,
        title,
        subject,
        description,
        type,
        uploader_id: userId,
        file_url: req.file ? req.file.filename : null,
        external_url: type === 'LINK' ? external_url : null,
        created_at: new Date().toISOString(),
        tags: parsedTags.map(t => ({ tag: { name: t.trim().toLowerCase() } }))
      };

      addDemoResource(mockResource);

      return res.status(201).json(mockResource);
    }
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Internal Server Error during upload.' });
  }
});

export default router;
