import { NextResponse } from 'next/server';
import { pool } from '../../../../../lib/config/database'; // 更正后的相对路径
import logger from '../../../../../lib/backend-utils/logger'; // 更正后的相对路径
import { authenticateRequest } from '../../../../../lib/authUtils'; // 更正后的相对路径
import { unlink } from 'fs/promises'; // 用于删除文件
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * @desc    删除指定教程文档
 * @route   DELETE /api/tutorials/documents/[documentId]
 * @access  Private (文档作者)
 */
export async function DELETE(request, { params }) {
  const { documentId } = params;
  const numericDocumentId = parseInt(documentId, 10);
  let userId;
  let connection;
  let filePathToDelete = null;

  logger.info('开始删除教程文档', { documentId: numericDocumentId });

  if (isNaN(numericDocumentId)) {
    logger.warn('删除文档失败：无效的文档 ID', { documentId });
    return NextResponse.json({ message: '无效的文档 ID' }, { status: 400 });
  }

  try {
    // 1. 用户认证
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('用户已认证', { userId, documentId: numericDocumentId });

    connection = await pool.getConnection();

    // 2. 获取文档信息（特别是作者 ID 和文件路径）
    const [docRows] = await connection.query(
      'SELECT user_id, file_path FROM tutorial_documents WHERE id = ?',
      [numericDocumentId]
    );

    if (docRows.length === 0) {
      logger.warn('删除文档失败：未找到文档', { userId, documentId: numericDocumentId });
      return NextResponse.json({ message: '未找到指定的文档' }, { status: 404 });
    }

    const docData = docRows[0];
    filePathToDelete = docData.file_path;

    // --- 添加更详细的调试日志 ---
    logger.info('权限检查前的值', {
        authenticatedUserId: userId, 
        authenticatedUserIdType: typeof userId, 
        documentAuthorId: docData.user_id,
        documentAuthorIdType: typeof docData.user_id,
        comparisonResult: Number(docData.user_id) !== Number(userId)
    });
    // --- 结束调试日志 ---

    // 3. 权限检查：确认当前用户是文档作者 (修正比较逻辑)
    if (Number(docData.user_id) !== Number(userId)) { // 将两者都转为 number 再比较
      logger.warn('删除文档失败：无权限', { userId, documentId: numericDocumentId, authorId: docData.user_id });
      return NextResponse.json({ message: '您无权删除此文档' }, { status: 403 });
    }
    // logger.info('权限检查通过', { userId, documentId: numericDocumentId }); // 这行可以暂时注释掉，上面的日志更详细

    // 4. 删除数据库记录 (使用事务)
    await connection.beginTransaction();
    logger.info('数据库事务开始', { documentId: numericDocumentId });

    // 删除标签关联 (虽然有 ON DELETE CASCADE, 但显式删除更清晰或用于日志)
    // await connection.query('DELETE FROM tutorial_document_document_tags WHERE document_id = ?', [numericDocumentId]);
    // logger.info('标签关联已删除', { documentId: numericDocumentId });

    // 删除文档记录
    const [deleteResult] = await connection.query('DELETE FROM tutorial_documents WHERE id = ?', [numericDocumentId]);

    if (deleteResult.affectedRows === 0) {
        // 理论上不应该发生，因为前面已经检查过文档存在
        throw new Error('删除数据库记录失败，影响行数为 0');
    }
    logger.info('文档数据库记录已删除', { documentId: numericDocumentId });

    await connection.commit();
    logger.info('数据库事务提交成功', { documentId: numericDocumentId });

    // 5. 删除物理文件 (数据库操作成功后)
    if (filePathToDelete) {
      try {
        const fullPath = path.join(process.cwd(), 'public', filePathToDelete); // 构造绝对路径
        await unlink(fullPath);
        logger.info('物理文件已删除', { documentId: numericDocumentId, filePath: fullPath });
      } catch (fileError) {
        // 文件删除失败通常不应阻止成功的响应，但需要记录错误
        if (fileError.code === 'ENOENT') { 
             logger.warn('尝试删除物理文件时未找到文件（可能已被删除）', { documentId: numericDocumentId, filePath: filePathToDelete });
        } else {
            logger.error('删除物理文件失败', { documentId: numericDocumentId, filePath: filePathToDelete, error: fileError.message });
        }
        // 不在这里抛出错误或回滚事务
      }
    }

    return NextResponse.json({ message: '文档删除成功' }, { status: 200 }); // 或者 204 No Content

  } catch (error) {
    logger.error('删除教程文档失败', { userId, documentId, error: error.message, stack: error.stack });
    if (connection) {
      logger.info('数据库事务回滚');
      await connection.rollback();
    }
    if (error.message.startsWith('未授权')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: '删除文档失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
} 