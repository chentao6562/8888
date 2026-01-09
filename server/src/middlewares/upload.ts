/**
 * 文件上传中间件
 */

import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../types';

// 内存存储（用于Excel导入等场景）
const memoryStorage = multer.memoryStorage();

// 磁盘存储（用于素材上传等场景）
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/materials'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件类型过滤
const excelFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  const allowedExtensions = ['.xls', '.xlsx', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 Excel 文件 (.xls, .xlsx) 或 CSV 文件'));
  }
};

const materialFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = [
    '.mp4', '.mov', '.avi',           // 视频
    '.jpg', '.jpeg', '.png', '.gif', '.webp',  // 图片
    '.mp3', '.wav',                   // 音频
    '.pdf', '.doc', '.docx', '.xls', '.xlsx'   // 文档
  ];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

// Excel 上传（用于导入）
export const uploadExcel = multer({
  storage: memoryStorage,
  fileFilter: excelFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('file');

// CSV 文件过滤
const csvFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || ext === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('只支持 CSV 文件'));
  }
};

// CSV 上传（支持更大文件）
export const uploadCSV = multer({
  storage: memoryStorage,
  fileFilter: csvFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}).single('file');

// 素材上传
export const uploadMaterial = multer({
  storage: diskStorage,
  fileFilter: materialFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
}).single('file');

// 多文件上传
export const uploadMultiple = multer({
  storage: diskStorage,
  fileFilter: materialFilter,
  limits: { fileSize: 100 * 1024 * 1024 }
}).array('files', 10);
