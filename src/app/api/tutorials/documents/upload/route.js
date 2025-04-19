import { NextResponse } from 'next/server';
import { pool } from '../../../../../lib/config/database'; // 注意相对路径层级
import logger from '../../../../../lib/backend-utils/logger'; // 注意相对路径层级
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // 用于生成唯一文件名
// 导入认证函数 (假设路径)
import { authenticateRequest } from '../../../../../lib/authUtils';

export const dynamic = 'force-dynamic';

// 定义文件存储的目标目录 (相对于项目根目录)
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'tutotial_documents');

/**
 * @desc    上传教程文档文件及元数据
 * @route   POST /api/tutorials/documents/upload
 * @access  Private (需要实现认证逻辑)
 * @body    FormData: file, title, description, categoryId, tagIds (逗号分隔)
 */
export async function POST(request) {
  let connection;
  let userId; // 在 try 外部定义，以便 finally 中可用
  try {
    // 1. 用户认证
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('用户已认证，准备上传文档', { userId });

    // 2. 解析 FormData
    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const description = formData.get('description');
    const categoryId = formData.get('categoryId');
    const tagIdsString = formData.get('tagIds'); // 假设前端传来的是逗号分隔的ID字符串
    const version = formData.get('version'); // 可选的版本号

    // --- 输入验证 ---
    if (!file || !(file instanceof Blob)) {
      logger.warn('上传失败: 缺少文件');
      return NextResponse.json({ message: '必须上传文件' }, { status: 400 });
    }
    if (!title || !categoryId || !tagIdsString) {
      logger.warn('上传失败: 缺少必要元数据', { title, categoryId, tagIdsString });
      return NextResponse.json({ message: '缺少标题、分类或标签信息' }, { status: 400 });
    }

    const tagIds = tagIdsString.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id) && id > 0);
    if (tagIds.length === 0) {
        logger.warn('上传失败: 无效的标签ID', { tagIdsString });
        return NextResponse.json({ message: '至少需要一个有效的标签' }, { status: 400 });
    }

    // --- 文件处理 ---
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const originalFilename = file.name || 'untitled';
    const fileExtension = path.extname(originalFilename);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const destinationPath = path.join(UPLOAD_DIR, uniqueFilename);
    const relativeFilePath = `/tutotial_documents/${uniqueFilename}`; // 存储在数据库中的相对路径

    logger.info(`准备保存文件: ${originalFilename} 到 ${destinationPath}`);

    // 确保上传目录存在 (如果需要，但通常 public 目录是存在的)
    // await mkdir(UPLOAD_DIR, { recursive: true });

    await writeFile(destinationPath, fileBuffer);
    logger.info(`文件成功保存: ${destinationPath}`);

    // --- 数据库操作 ---
    connection = await pool.getConnection();
    await connection.beginTransaction();
    logger.info('数据库事务开始');

    // 1. 插入文档记录
    const insertDocQuery = `
      INSERT INTO tutorial_documents 
      (user_id, category_id, title, description, file_path, file_type, file_size, version, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const docParams = [
      userId, // 使用 authenticateRequest 获取的 userId
      parseInt(categoryId, 10),
      title,
      description || null,
      relativeFilePath,
      file.type || null, // 文件 MIME 类型
      file.size,        // 文件大小 (字节)
      version || null,
      'published'       // 默认直接发布
    ];
    logger.info('准备插入文档记录', { docParams });
    const [insertResult] = await connection.query(insertDocQuery, docParams);
    const newDocumentId = insertResult.insertId;

    if (!newDocumentId) {
        throw new Error('无法获取新插入文档的 ID');
    }
    logger.info(`文档记录插入成功, ID: ${newDocumentId}`);

    // 2. 插入标签关联记录
    if (tagIds.length > 0) {
      const insertTagsQuery = `
        INSERT INTO tutorial_document_document_tags (document_id, tag_id)
        VALUES ?
      `;
      const tagValues = tagIds.map(tagId => [newDocumentId, tagId]);
      logger.info('准备插入标签关联记录', { tagValues });
      await connection.query(insertTagsQuery, [tagValues]);
      logger.info(`标签关联记录插入成功`);
    }

    await connection.commit();
    logger.info('数据库事务提交成功');

    return NextResponse.json({ message: '文档上传成功!', documentId: newDocumentId, filePath: relativeFilePath }, { status: 201 });

  } catch (error) {
    logger.error('文档上传处理失败', { userId, error: error.message, stack: error.stack }); // Log userId if available
    if (connection) {
      logger.info('数据库事务回滚');
      await connection.rollback();
    }
    // 处理认证错误
    if (error.message.startsWith('未授权')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
    // TODO: 可以考虑在这里删除已上传但数据库操作失败的文件
    return NextResponse.json({ message: `上传失败: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) {
      logger.info('释放数据库连接');
      connection.release();
    }
  }
} 