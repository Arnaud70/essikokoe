import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  getStorage() {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'profile_pictures',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
      } as any,
    });
  }
}
