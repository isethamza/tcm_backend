"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
let UploadsService = class UploadsService {
    constructor() {
        this.uploadRoot = process.env.UPLOADS_DIR ??
            (0, path_1.join)(process.cwd(), 'uploads');
    }
    async saveFile(file, folder) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const ext = this.getExtension(file.mimetype);
        const filename = `${(0, crypto_1.randomUUID)()}.${ext}`;
        const UPLOADS_URL = process.env.UPLOADS_PUBLIC_URL;
        const dir = (0, path_1.join)(this.uploadRoot, folder);
        const filePath = (0, path_1.join)(dir, filename);
        await fs_1.promises.mkdir(dir, { recursive: true });
        await fs_1.promises.writeFile(filePath, file.buffer);
        return `${UPLOADS_URL}/${folder}/${filename}`;
    }
    getExtension(mime) {
        switch (mime) {
            case 'image/jpeg':
                return 'jpg';
            case 'image/png':
                return 'png';
            case 'image/webp':
                return 'webp';
            default:
                throw new common_1.BadRequestException(`Unsupported file type: ${mime}`);
        }
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)()
], UploadsService);
//# sourceMappingURL=uploads.service.js.map