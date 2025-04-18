import { NextResponse } from 'next/server';
import { pool } from '../../../../../../lib/config/database'; // Adjust path as needed
import logger from '../../../../../../lib/backend-utils/logger'; // Adjust path
import { authenticateRequest } from '../../../../../../lib/authUtils'; // Adjust path

export const dynamic = 'force-dynamic';

/**
 * @desc    更新指定主题的标签
 * @route   PUT /api/forum/topics/[topicId]/tags
 * @access  Private
 */
export async function PUT(request, context) {
  let userId;
  let connection;

  // 1. Extract topicId from URL
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/'); 
  const topicId = pathSegments[pathSegments.length - 2]; // topicId is second to last
  const numericTopicId = parseInt(topicId, 10);

  logger.info('开始更新论坛主题标签', { topicId: numericTopicId });

  if (isNaN(numericTopicId)) {
    logger.warn('更新标签失败：无效的主题 ID', { topicId });
    return NextResponse.json({ message: '无效的主题 ID' }, { status: 400 });
  }

  try {
    // 2. Authenticate user
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('用户已认证', { userId, topicId: numericTopicId });

    // 3. Parse request body for tagIds
    const body = await request.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds)) {
        logger.warn('更新标签失败：tagIds 必须是数组', { userId, topicId: numericTopicId, receivedBody: body });
        return NextResponse.json({ message: '标签 ID 必须是数组格式' }, { status: 400 });
    }
    // Ensure all tag IDs are numbers
    const numericTagIds = tagIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (numericTagIds.length !== tagIds.length) {
         logger.warn('更新标签失败：tagIds 包含无效的数字', { userId, topicId: numericTopicId, originalTagIds: tagIds });
         return NextResponse.json({ message: '标签 ID 数组包含无效值' }, { status: 400 });
    }
    logger.info('解析到的标签 ID', { userId, topicId: numericTopicId, tagIds: numericTagIds });


    // 4. Database transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if topic exists and user has permission (optional - implement if needed)
      // For now, we just check if topic exists
      const [topicCheck] = await connection.query('SELECT 1 FROM forum_topics WHERE id = ?', [numericTopicId]);
      if (topicCheck.length === 0) {
          logger.warn('更新标签失败：主题不存在', { userId, topicId: numericTopicId });
          await connection.rollback(); // Rollback before returning
          connection.release();
          return NextResponse.json({ message: '主题不存在' }, { status: 404 });
      }

      // Delete existing tags for the topic
      const [deleteResult] = await connection.execute(
        'DELETE FROM forum_topic_tags WHERE topic_id = ?',
        [numericTopicId]
      );
      logger.info('旧标签关联已删除', { userId, topicId: numericTopicId, affectedRows: deleteResult.affectedRows });

      // Insert new tags if any are provided
      if (numericTagIds.length > 0) {
        const tagValues = numericTagIds.map(tagId => [numericTopicId, tagId]);
        const [insertResult] = await connection.query(
          'INSERT INTO forum_topic_tags (topic_id, tag_id) VALUES ?',
          [tagValues]
        );
        logger.info('新标签关联已插入', { userId, topicId: numericTopicId, insertedRows: insertResult.affectedRows });
      }

      // Commit the transaction
      await connection.commit();
      logger.info('主题标签更新事务提交成功', { userId, topicId: numericTopicId });

      connection.release();
      return NextResponse.json({ message: '标签更新成功' }, { status: 200 });

    } catch (dbError) {
      await connection.rollback();
      logger.error('更新主题标签数据库操作失败，事务已回滚', { userId, topicId: numericTopicId, error: dbError.message, stack: dbError.stack });
      connection.release();
      // Check for specific errors like foreign key violation if a tagId doesn't exist
       if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
           return NextResponse.json({ message: '提供的某个标签 ID 无效' }, { status: 400 });
       }
      return NextResponse.json({ message: '更新标签数据库操作失败' }, { status: 500 });
    }

  } catch (error) {
    // Handle authentication errors or other unexpected errors
    logger.error('更新主题标签过程中发生错误', { topicId: numericTopicId, error: error.message, stack: error.stack });
    if (connection) connection.release(); // Ensure connection is released on outer errors too

    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: '更新标签时发生服务器错误' }, { status: 500 });
  }
} 