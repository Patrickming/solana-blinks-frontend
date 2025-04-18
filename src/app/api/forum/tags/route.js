import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/config/database'; // Corrected path
import logger from '../../../../lib/backend-utils/logger'; // Corrected path

export const dynamic = 'force-dynamic'; // Ensure fresh data

/**
 * @desc    获取所有论坛标签
 * @route   GET /api/forum/tags
 * @access  Public
 */
export async function GET(request) {
  try {
    logger.info('开始获取论坛标签');

    const connection = await pool.getConnection();
    try {
      const [tags] = await connection.query(
        'SELECT id, name, slug, color_classes FROM forum_tags ORDER BY name ASC'
      );
      logger.info(`成功获取 ${tags.length} 个标签`);
      return NextResponse.json(tags, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('获取论坛标签失败', { error: error.message, stack: error.stack });
    return NextResponse.json({ message: '获取标签失败' }, { status: 500 });
  }
} 