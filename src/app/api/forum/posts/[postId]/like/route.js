import { NextResponse } from 'next/server';
import { pool } from '../../../../../../lib/config/database'; // Corrected path
import logger from '../../../../../../lib/backend-utils/logger'; // Corrected path
import { authenticateRequest } from '../../../../../../lib/authUtils'; // Corrected path

export const dynamic = 'force-dynamic';

/**
 * @desc    点赞一个论坛帖子
 * @route   POST /api/forum/posts/[postId]/like
 * @access  Private
 */
export async function POST(request, { params }) {
  let userId;
  const { postId } = params;
  const numericPostId = parseInt(postId, 10);

  if (isNaN(numericPostId)) {
    logger.warn('点赞帖子失败：无效的帖子 ID', { postId });
    return NextResponse.json({ message: '无效的帖子 ID' }, { status: 400 });
  }

  let connection;
  try {
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('开始点赞帖子', { userId, postId: numericPostId });

    connection = await pool.getConnection();

    // Check if post exists and is visible
    const [postCheck] = await connection.query(
        'SELECT 1 FROM forum_posts WHERE id = ? AND status = ? LIMIT 1',
        [numericPostId, 'visible']
    );
    if (postCheck.length === 0) {
        logger.warn('点赞帖子失败：帖子不存在或不可见', { userId, postId: numericPostId });
        connection.release();
        return NextResponse.json({ message: '帖子不存在或不可见' }, { status: 404 });
    }

    // Use INSERT IGNORE to handle potential duplicate likes gracefully
    // The unique constraint (user_id, post_id) will prevent duplicates
    const [result] = await connection.execute(
      'INSERT IGNORE INTO forum_post_likes (user_id, post_id) VALUES (?, ?)', 
      [userId, numericPostId]
    );

    connection.release();

    if (result.affectedRows > 0) {
        logger.info('帖子点赞成功 (新点赞)', { userId, postId: numericPostId });
        // Relying on trigger `trg_after_like_insert` to update counts
    } else {
        logger.info('帖子点赞操作完成 (用户已点赞过)', { userId, postId: numericPostId });
    }

    // Return 200 OK whether it was a new like or already liked
    return NextResponse.json({ message: '操作成功' }, { status: 200 }); 

  } catch (error) {
    logger.error('点赞帖子过程中发生错误', { userId, postId: numericPostId, error: error.message, stack: error.stack });
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: '点赞失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

/**
 * @desc    取消点赞一个论坛帖子
 * @route   DELETE /api/forum/posts/[postId]/like
 * @access  Private
 */
export async function DELETE(request, { params }) {
  let userId;
  const { postId } = params;
  const numericPostId = parseInt(postId, 10);

  if (isNaN(numericPostId)) {
    logger.warn('取消点赞帖子失败：无效的帖子 ID', { postId });
    return NextResponse.json({ message: '无效的帖子 ID' }, { status: 400 });
  }

  try {
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('开始取消点赞帖子', { userId, postId: numericPostId });

    const [result] = await pool.execute(
      'DELETE FROM forum_post_likes WHERE user_id = ? AND post_id = ?', 
      [userId, numericPostId]
    );

    if (result.affectedRows > 0) {
        logger.info('帖子取消点赞成功', { userId, postId: numericPostId });
        // Relying on trigger `trg_after_like_delete` to update counts
    } else {
        logger.info('帖子取消点赞操作完成 (用户未点赞过)', { userId, postId: numericPostId });
    }

    // Return 200 OK whether a like was removed or not
    return NextResponse.json({ message: '操作成功' }, { status: 200 }); 

  } catch (error) {
    logger.error('取消点赞帖子过程中发生错误', { userId, postId: numericPostId, error: error.message, stack: error.stack });
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: '取消点赞失败' }, { status: 500 });
  }
} 