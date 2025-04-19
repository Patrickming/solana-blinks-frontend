import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/config/database'; // 更正后的相对路径
import logger from '../../../../lib/backend-utils/logger'; // 更正后的相对路径
import { authenticateRequest } from '../../../../lib/authUtils'; // 导入认证
import slugify from 'slugify'; // 用于生成英文 slug
import pinyin from 'pinyin'; // 用于生成中文拼音 slug

export const dynamic = 'force-dynamic'; // Ensure fresh data

/**
 * @desc    获取所有教程文档标签
 * @route   GET /api/tutorials/tags
 * @access  Public
 */
export async function GET(request) {
  logger.info('开始获取教程文档标签列表');
  let connection;
  try {
    connection = await pool.getConnection();
    const query = "SELECT id, name, slug FROM tutorial_document_tags ORDER BY name ASC";
    const [tags] = await connection.query(query);

    logger.info(`成功获取 ${tags.length} 个标签`);
    return NextResponse.json(tags, { status: 200 });

  } catch (error) {
    logger.error('获取教程文档标签列表失败', { error: error.message, stack: error.stack });
    return NextResponse.json({ message: '获取标签列表失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

/**
 * @desc    创建新的教程文档标签
 * @route   POST /api/tutorials/tags
 * @access  Private (需要登录)
 * @body    { name: string }
 */
export async function POST(request) {
  let userId;
  let connection;
  let trimmedName = ''; // 在 try 外部定义以便 catch 中使用
  try {
    // 1. 用户认证
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    // logger.info('用户已认证，准备创建新标签', { userId });

    // 2. 解析请求体
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      logger.warn('创建标签失败：标签名称无效', { userId, name });
      return NextResponse.json({ message: '标签名称不能为空' }, { status: 400 });
    }
    trimmedName = name.trim();

    // 3. 生成 slug (区分中英文)
    let slug = '';
    // 检查是否包含中文字符 (使用 Unicode 范围)
    if (/[\u4E00-\u9FFF]/.test(trimmedName)) {
        // 包含中文：使用 pinyin 生成 slug
        slug = pinyin(trimmedName, {
            style: pinyin.STYLE_NORMAL, // 普通风格，无声调
            heteronym: false // 不使用多音字
        }).map(item => item[0]) // 获取每个字的拼音数组的第一个拼音
          .join('-') // 用连字符连接
          .toLowerCase(); // 转为小写
        logger.info('生成中文拼音 slug', { name: trimmedName, slug });
    } else {
        // 不含中文：使用 slugify 生成 slug
        slug = slugify(trimmedName, { lower: true, strict: true, replacement: '-' });
        logger.info('生成英文 slug', { name: trimmedName, slug });
    }
    
    // 确保 slug 不为空 (例如纯符号可能导致空 slug)
    if (!slug) {
        logger.warn('创建标签失败：无法为名称生成有效的 slug', { userId, name: trimmedName });
        // 可以选择生成一个基于 UUID 的 slug 或返回错误
        slug = `tag-${Date.now()}`; // 备用 slug
        // return NextResponse.json({ message: '无法为该名称生成有效的 slug' }, { status: 400 });
    }

    // 4. 插入数据库
    connection = await pool.getConnection();
    const insertQuery = "INSERT INTO tutorial_document_tags (name, slug) VALUES (?, ?)";
    const params = [trimmedName, slug];

    logger.info('准备插入新标签', { userId, name: trimmedName, slug });
    const [result] = await connection.query(insertQuery, params);
    const newTagId = result.insertId;

    if (!newTagId) {
        throw new Error('无法获取新插入标签的 ID');
    }
    logger.info('新标签创建成功', { userId, tagId: newTagId, name: trimmedName, slug });

    // 返回新创建的标签信息
    return NextResponse.json({ id: newTagId, name: trimmedName, slug: slug }, { status: 201 });

  } catch (error) {
     // 处理可能的数据库错误，例如唯一键冲突 (slug 或 name 可能已存在)
    if (error.code === 'ER_DUP_ENTRY') {
        logger.warn('创建标签失败：标签名称或 slug 已存在', { userId, name: trimmedName, code: error.code });
        return NextResponse.json({ message: '该标签名称或生成的 slug 已存在' }, { status: 409 }); // 409 Conflict
    }
    logger.error('创建新标签失败', { userId, error: error.message, stack: error.stack });
    if (error.message.startsWith('未授权')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: '创建标签失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
} 