/**
 * 官网管理服务
 */

import { prisma } from '../utils/prisma';
import { NotFoundError } from '../types';

// ==================== Banner 管理 ====================

export interface BannerItem {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export class WebsiteService {
  // ==================== Banner ====================

  async getBanners(onlyActive: boolean = false): Promise<BannerItem[]> {
    const where: any = {};
    if (onlyActive) where.isActive = true;

    const banners = await prisma.websiteBanner.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return banners.map(b => ({
      id: b.id,
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl,
      sortOrder: b.sortOrder,
      isActive: b.isActive,
      createdAt: b.createdAt
    }));
  }

  async createBanner(data: {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    sortOrder?: number;
  }): Promise<BannerItem> {
    const maxSort = await prisma.websiteBanner.aggregate({
      _max: { sortOrder: true }
    });

    const banner = await prisma.websiteBanner.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        sortOrder: data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1
      }
    });

    return {
      id: banner.id,
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      createdAt: banner.createdAt
    };
  }

  async updateBanner(id: number, data: {
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<BannerItem> {
    const existing = await prisma.websiteBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Banner不存在');

    const banner = await prisma.websiteBanner.update({
      where: { id },
      data
    });

    return {
      id: banner.id,
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      createdAt: banner.createdAt
    };
  }

  async deleteBanner(id: number): Promise<void> {
    const existing = await prisma.websiteBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Banner不存在');
    await prisma.websiteBanner.delete({ where: { id } });
  }

  async sortBanners(ids: number[]): Promise<void> {
    const updates = ids.map((id, index) =>
      prisma.websiteBanner.update({
        where: { id },
        data: { sortOrder: index + 1 }
      })
    );
    await prisma.$transaction(updates);
  }

  // ==================== 案例 ====================

  async getCases(onlyActive: boolean = false): Promise<any[]> {
    const where: any = {};
    if (onlyActive) where.isActive = true;

    const cases = await prisma.websiteCase.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return cases.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      imageUrl: c.imageUrl,
      content: c.content,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      createdAt: c.createdAt
    }));
  }

  async createCase(data: {
    title: string;
    description?: string;
    imageUrl?: string;
    content?: string;
    sortOrder?: number;
  }): Promise<any> {
    const maxSort = await prisma.websiteCase.aggregate({
      _max: { sortOrder: true }
    });

    const caseItem = await prisma.websiteCase.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        content: data.content,
        sortOrder: data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1
      }
    });

    return {
      id: caseItem.id,
      title: caseItem.title,
      description: caseItem.description,
      imageUrl: caseItem.imageUrl,
      content: caseItem.content,
      sortOrder: caseItem.sortOrder,
      isActive: caseItem.isActive,
      createdAt: caseItem.createdAt
    };
  }

  async updateCase(id: number, data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    content?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<any> {
    const existing = await prisma.websiteCase.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('案例不存在');

    const caseItem = await prisma.websiteCase.update({
      where: { id },
      data
    });

    return {
      id: caseItem.id,
      title: caseItem.title,
      description: caseItem.description,
      imageUrl: caseItem.imageUrl,
      content: caseItem.content,
      sortOrder: caseItem.sortOrder,
      isActive: caseItem.isActive,
      createdAt: caseItem.createdAt
    };
  }

  async deleteCase(id: number): Promise<void> {
    const existing = await prisma.websiteCase.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('案例不存在');
    await prisma.websiteCase.delete({ where: { id } });
  }

  // ==================== 公司信息 ====================

  async getInfo(): Promise<{ [key: string]: string }> {
    const items = await prisma.websiteInfo.findMany();
    const result: { [key: string]: string } = {};
    items.forEach(item => {
      result[item.key] = item.value;
    });
    return result;
  }

  async updateInfo(key: string, value: string): Promise<void> {
    await prisma.websiteInfo.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
}

export const websiteService = new WebsiteService();
