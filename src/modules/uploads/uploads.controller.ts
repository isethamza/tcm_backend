import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadsService } from './uploads.service';

type UploadFolder = 'identity' | 'parcel' | 'signature';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          enum: ['identity', 'parcel', 'signature'],
        },
      },
      required: ['file', 'folder'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: UploadFolder,
  ) {
    // =========================
    // VALIDATION
    // =========================
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!folder) {
      throw new BadRequestException('Missing folder');
    }

    if (!['identity', 'parcel', 'signature'].includes(folder)) {
      throw new BadRequestException('Invalid upload folder');
    }

    // =========================
    // MIME TYPE VALIDATION (IMPORTANT)
    // =========================
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    // =========================
    // SAVE FILE
    // =========================
    const url = await this.uploads.saveFile(file, folder);

    return { url };
  }
}