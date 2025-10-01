import { FastifyRequest, FastifyReply } from "fastify";
import path from "path";
import { promises as fs } from "fs";
import { z } from "zod";

// Image upload schema
const uploadImageSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string().regex(/^image\/(jpeg|png|gif|webp)$/),
});

// Allowed image types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Get multipart data
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
      return reply.status(400).send({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      });
    }

    // Check file size
    const buffer = await data.toBuffer();
    if (buffer.length > MAX_FILE_SIZE) {
      return reply.status(400).send({ 
        error: 'File too large. Maximum size is 5MB.' 
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(data.filename);
    const uniqueFilename = `safari-${timestamp}-${randomString}${ext}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Save file
    const filePath = path.join(uploadsDir, uniqueFilename);
    await fs.writeFile(filePath, buffer);

    // Return file URL with full backend URL
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || 'localhost';
    const fileUrl = `http://${host}:${port}/uploads/images/${uniqueFilename}`;
    
    console.log(`📸 Image uploaded: ${uniqueFilename} (${(buffer.length / 1024).toFixed(2)}KB)`);

    return reply.send({
      success: true,
      filename: uniqueFilename,
      url: fileUrl,
      size: buffer.length,
      mimetype: data.mimetype
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return reply.status(500).send({ error: 'Failed to upload image' });
  }
}

export async function deleteImage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { filename } = request.params as { filename: string };
    
    // Validate filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return reply.status(400).send({ error: 'Invalid filename' });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'images', filename);
    
    try {
      await fs.unlink(filePath);
      console.log(`🗑️  Image deleted: ${filename}`);
      
      return reply.send({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return reply.status(404).send({ error: 'Image not found' });
      }
      throw error;
    }

  } catch (error) {
    console.error('Image deletion error:', error);
    return reply.status(500).send({ error: 'Failed to delete image' });
  }
}

export async function getImages(request: FastifyRequest, reply: FastifyReply) {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
    
    try {
      const files = await fs.readdir(uploadsDir);
      const imageFiles: string[] = files.filter((file: string): boolean => {
        const ext: string = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      });

      const images = imageFiles.map(filename => ({
        filename,
        url: `/uploads/images/${filename}`
      }));

      return reply.send({
        success: true,
        images
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return reply.send({
          success: true,
          images: []
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Get images error:', error);
    return reply.status(500).send({ error: 'Failed to get images' });
  }
}