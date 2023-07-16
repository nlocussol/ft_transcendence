import { diskStorage } from 'multer';
import { extname } from 'path';

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']; 

export const multerOptions = {
  storage: diskStorage({
    destination: '/usr/src/app/upload',
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Save the file with its original name
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type.'));
    }
  },
};