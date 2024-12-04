import { Photo } from '../models/Photo';

export interface UploadPhotoResponse {
  message: string;
  photo: Photo;
}
