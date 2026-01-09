/**
 * 分页工具
 */

import { PaginationParams, PaginationMeta, PaginatedResult } from '../types';

// 默认分页配置
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * 解析分页参数
 */
export function parsePagination(params: PaginationParams): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  let page = Number(params.page) || DEFAULT_PAGE;
  let pageSize = Number(params.pageSize) || DEFAULT_PAGE_SIZE;

  // 确保页码至少为1
  page = Math.max(1, page);

  // 限制每页大小
  pageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return { page, pageSize, skip, take };
}

/**
 * 创建分页元数据
 */
export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);

  return {
    page,
    pageSize,
    total,
    totalPages
  };
}

/**
 * 创建分页结果
 */
export function createPaginatedResult<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResult<T> {
  return {
    items,
    pagination: createPaginationMeta(page, pageSize, total)
  };
}

/**
 * Prisma 分页查询参数
 */
export function getPrismaPageParams(params: PaginationParams): {
  skip: number;
  take: number;
} {
  const { skip, take } = parsePagination(params);
  return { skip, take };
}

/**
 * 分页工具对象（统一导出）
 */
export const PaginationUtil = {
  parse: parsePagination,
  createMeta: createPaginationMeta,
  createResult: createPaginatedResult,
  getPrismaParams: getPrismaPageParams,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
};
