// src/app/DTOs/upload-photo-response.ts
import { Photo } from '../models/Photo';

export interface UploadPhotoResponse {
  message: string;
  photo: Photo;
}
