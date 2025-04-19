import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/config/database'; // 更正后的相对路径
import logger from '../../../../lib/backend-utils/logger'; // 更正后的相对路径

export const dynamic = 'force-dynamic'; // Ensure fresh data

/**
 * @desc    获取所有教程文档分类
 * @route   GET /api/tutorials/categories
 * @access  Public
 */
export async function GET(request) {
  logger.info('开始获取教程文档分类列表');
  let connection;
  try {
    connection = await pool.getConnection();
    const query = "SELECT id, name, slug, description FROM tutorial_document_categories ORDER BY name ASC";
    const [categories] = await connection.query(query);

    logger.info(`成功获取 ${categories.length} 个分类`);
    return NextResponse.json(categories, { status: 200 });

  } catch (error) {
    logger.error('获取教程文档分类列表失败', { error: error.message, stack: error.stack });
    return NextResponse.json({ message: '获取分类列表失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
} 