/**
 * 素材库服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';

export interface MaterialListItem {
  id: number;
  name: string;
  type: string;
  category: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileSize: number | null;
  duration: number | null;
  tags: any;
  description: string | null;
  usageCount: number;
  uploadedBy: number | null;
  uploaderName?: string;
  createdAt: Date;
}

export class MaterialService {
  async findAll(params: {
    page?: number;
    pageSize?: number;
    type?: string;
    category?: string;
    keyword?: string;
  }): Promise<PaginatedResult<MaterialListItem>> {
    const { page = 1, pageSize = 20, type, category, keyword } = params;

    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    const total = await prisma.material.count({ where });
    const materials = await prisma.material.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { name: true } }
      }
    });

    const items: MaterialListItem[] = materials.map(m => ({
      id: m.id,
      name: m.name,
      type: m.type,
      category: m.category,
      fileUrl: m.fileUrl,
      thumbnailUrl: m.thumbnailUrl,
      fileSize: m.fileSize,
      duration: m.duration,
      tags: m.tags,
      description: m.description,
      usageCount: m.usageCount,
      uploadedBy: m.uploadedBy,
      uploaderName: m.uploader?.name,
      createdAt: m.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<MaterialListItem> {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        uploader: { select: { name: true } }
      }
    });

    if (!material) throw new NotFoundError('素材不存在');

    return {
      id: material.id,
      name: material.name,
      type: material.type,
      category: material.category,
      fileUrl: material.fileUrl,
      thumbnailUrl: material.thumbnailUrl,
      fileSize: material.fileSize,
      duration: material.duration,
      tags: material.tags,
      description: material.description,
      usageCount: material.usageCount,
      uploadedBy: material.uploadedBy,
      uploaderName: material.uploader?.name,
      createdAt: material.createdAt
    };
  }

  async create(data: {
    name: string;
    type: string;
    category?: string;
    fileUrl: string;
    thumbnailUrl?: string;
    fileSize?: number;
    duration?: number;
    tags?: any;
    description?: string;
    uploadedBy: number;
  }): Promise<MaterialListItem> {
    const material = await prisma.material.create({
      data: {
        name: data.name,
        type: data.type as any,
        category: data.category,
        fileUrl: data.fileUrl,
        thumbnailUrl: data.thumbnailUrl,
        fileSize: data.fileSize,
        duration: data.duration,
        tags: data.tags,
        description: data.description,
        uploadedBy: data.uploadedBy
      },
      include: {
        uploader: { select: { name: true } }
      }
    });

    return {
      id: material.id,
      name: material.name,
      type: material.type,
      category: material.category,
      fileUrl: material.fileUrl,
      thumbnailUrl: material.thumbnailUrl,
      fileSize: material.fileSize,
      duration: material.duration,
      tags: material.tags,
      description: material.description,
      usageCount: material.usageCount,
      uploadedBy: material.uploadedBy,
      uploaderName: material.uploader?.name,
      createdAt: material.createdAt
    };
  }

  async update(id: number, data: {
    name?: string;
    category?: string;
    tags?: any;
    description?: string;
  }): Promise<MaterialListItem> {
    const existing = await prisma.material.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('素材不存在');

    const material = await prisma.material.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        tags: data.tags,
        description: data.description
      },
      include: {
        uploader: { select: { name: true } }
      }
    });

    return {
      id: material.id,
      name: material.name,
      type: material.type,
      category: material.category,
      fileUrl: material.fileUrl,
      thumbnailUrl: material.thumbnailUrl,
      fileSize: material.fileSize,
      duration: material.duration,
      tags: material.tags,
      description: material.description,
      usageCount: material.usageCount,
      uploadedBy: material.uploadedBy,
      uploaderName: material.uploader?.name,
      createdAt: material.createdAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.material.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('素材不存在');
    await prisma.material.delete({ where: { id } });
  }

  async incrementUsage(id: number): Promise<void> {
    await prisma.material.update({
      where: { id },
      data: { usageCount: { increment: 1 } }
    });
  }

  async getCategories(): Promise<string[]> {
    const materials = await prisma.material.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category']
    });
    return materials.map(m => m.category!).filter(Boolean);
  }
}

export const materialService = new MaterialService();
