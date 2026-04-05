import { Router } from 'express';
import multer from 'multer';
import prisma from '../db/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique name
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

    // Check for duplicates
    const duplicate = await prisma.resource.findFirst({
      where: {
        title,
        AND: [
          { type },
          { OR: [{ file_url: req.file?.filename }, { external_url }] }
        ]
      }
    });

    if (duplicate) {
      return res.status(409).json({ error: 'A resource with this title and file/link already exists.' });
    }

    // Handle tags
    const parsedTags: string[] = tags ? JSON.parse(tags) : [];
    
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
        tags: {
          include: { tag: true }
        }
      }
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Internal Server Error during upload.' });
  }
});

export default router;
