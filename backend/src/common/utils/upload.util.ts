import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

export const IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const IMAGE_MAX_SIZE = 2 * 1024 * 1024;

export function uploadsDir(): string {
  return process.env.UPLOADS_DIR ?? 'uploads';
}

export function imageFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (!IMAGE_MIMETYPES.includes(file.mimetype)) {
    cb(
      new BadRequestException(
        'Only image/jpeg, image/png or image/webp are allowed',
      ),
      false,
    );
    return;
  }
  cb(null, true);
}

export function imageDiskStorage(prefix: string) {
  return diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir()),
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase() || '.png';
      cb(null, `${prefix}-${randomUUID()}${ext}`);
    },
  });
}
