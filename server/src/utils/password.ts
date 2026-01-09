/**
 * 密码加密工具
 * 使用 bcryptjs 进行密码哈希
 */

import bcrypt from 'bcryptjs';

// 加密强度（cost factor）
const SALT_ROUNDS = 10;

/**
 * 密码加密
 * @param password 原始密码
 * @returns 加密后的密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * 密码验证
 * @param password 原始密码
 * @param hashedPassword 加密后的密码
 * @returns 密码是否匹配
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 同步版本 - 密码加密
 * @param password 原始密码
 * @returns 加密后的密码哈希
 */
export function hashPasswordSync(password: string): string {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
}

/**
 * 同步版本 - 密码验证
 * @param password 原始密码
 * @param hashedPassword 加密后的密码
 * @returns 密码是否匹配
 */
export function comparePasswordSync(
  password: string,
  hashedPassword: string
): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

/**
 * 密码工具对象（统一导出）
 */
export const PasswordUtil = {
  hash: hashPassword,
  compare: comparePassword,
  hashSync: hashPasswordSync,
  compareSync: comparePasswordSync,
  SALT_ROUNDS
};
