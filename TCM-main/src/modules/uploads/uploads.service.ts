// src/modules/uploads/uploads.service.ts
import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private readonly uploadRoot =
    process.env.UPLOADS_DIR ??
    join(process.cwd(), 'uploads');

  /**
   * Save uploaded file and return RELATIVE public path
   * (frontend will prefix API URL)
   */
  async saveFile(
    file: Express.Multer.File,
    folder: 'identity' | 'parcel' | 'signature',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const ext = this.getExtension(file.mimetype);
    const filename = `${randomUUID()}.${ext}`;
    const UPLOADS_URL = process.env.UPLOADS_PUBLIC_URL!;
    const dir = join(this.uploadRoot, folder);
    const filePath = join(dir, filename);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    // ✅ RELATIVE PATH ONLY
    return `${UPLOADS_URL}/${folder}/${filename}`;
  }

  private getExtension(mime: string): string {
    switch (mime) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        throw new BadRequestException(
          `Unsupported file type: ${mime}`,
        );
    }
  }
}
