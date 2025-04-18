import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/config/database'; // Corrected path
import logger from '../../../../lib/backend-utils/logger'; // Corrected path

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

/**
 * @desc    获取所有论坛分类
 * @route   GET /api/forum/categories
 * @access  Public
 */
export async function GET(request) {
  try {
    logger.info('开始获取论坛分类');

    const connection = await pool.getConnection();
    try {
      const [categories] = await connection.query(
        'SELECT id, name, slug, description FROM forum_categories ORDER BY name ASC'
      );
      logger.info(`成功获取 ${categories.length} 个分类`);
      return NextResponse.json(categories, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('获取论坛分类失败', { error: error.message, stack: error.stack });
    return NextResponse.json({ message: '获取分类失败' }, { status: 500 });
  }
} 