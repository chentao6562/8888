/**
 * 中间件统一导出
 */

// 认证中间件
export { authenticate, optionalAuthenticate } from './auth';

// 角色权限中间件
export {
  authorize,
  isAdmin,
  isAdminOrManager,
  isOwnerOrAdmin,
  requireRoleLevel
} from './rbac';

// 错误处理中间件
export {
  globalErrorHandler,
  notFoundHandler,
  catchAsync
} from './errorHandler';

// 文件上传中间件
export { uploadExcel, uploadMaterial, uploadMultiple } from './upload';
