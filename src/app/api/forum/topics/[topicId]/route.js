import { NextResponse } from 'next/server';
import { pool } from '../../../../../lib/config/database'; // Corrected path
import logger from '../../../../../lib/backend-utils/logger'; // Corrected path
import { authenticateRequest } from '../../../../../lib/authUtils'; // Corrected path

export const dynamic = 'force-dynamic';

// Helper to get user ID safely if authenticated
async function getAuthenticatedUserId(request) {
    try {
        const user = await authenticateRequest(request);
        return user.id;
    } catch (error) {
        // Not authenticated or error during authentication
        if (!error.message.startsWith('未授权')) {
             logger.warn('Error during optional authentication for topic detail', { error: error.message });
        }
        return null; 
    }
}

/**
 * @desc    获取单个论坛主题的详细信息 (包括初始帖子和标签)
 * @route   GET /api/forum/topics/[topicId]
 * @access  Public (like status depends on authentication)
 */
export async function GET(request, context) {
  // Extract topicId from URL instead of context.params
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/'); // e.g., ['', 'api', 'forum', 'topics', '123']
  const topicId = pathSegments[pathSegments.length - 1]; // Get the last segment
  // const params = context.params;
  // const topicId = params.topicId;
  const numericTopicId = parseInt(topicId, 10);
  let connection;

  // Attempt to get user ID for like status, but proceed even if not authenticated
  const requestingUserId = await getAuthenticatedUserId(request);

  logger.info('开始获取论坛主题详细信息', { topicId: numericTopicId, requestingUserId });

  if (isNaN(numericTopicId)) {
    logger.warn('获取主题详情失败：无效的主题 ID', { topicId });
    return NextResponse.json({ message: '无效的主题 ID' }, { status: 400 });
  }

  try {
    connection = await pool.getConnection();

    // 1. Fetch Topic Details (similar to list but for one topic)
    const topicQuery = `
        SELECT
            t.id, t.title, t.status, t.reply_count, t.like_count, t.last_activity_at, t.created_at,
            u.id AS authorId, u.username AS authorUsername, u.avatar AS authorAvatar,
            c.id AS categoryId, c.name AS categoryName, c.slug AS categorySlug
        FROM forum_topics t
        JOIN users u ON t.user_id = u.id
        JOIN forum_categories c ON t.category_id = c.id
        WHERE t.id = ? AND t.status != 'deleted' -- Ensure topic is not deleted
    `;
    const [topicRows] = await connection.query(topicQuery, [numericTopicId]);

    if (topicRows.length === 0) {
      logger.warn('主题未找到或已被删除', { topicId: numericTopicId });
      return NextResponse.json({ message: '主题未找到' }, { status: 404 });
    }
    const topic = topicRows[0];

    // 2. Fetch Initial Post
    const postQuery = `
        SELECT
            p.id, p.content, p.status, p.like_count, p.created_at,
            u.id AS authorId, u.username AS authorUsername, u.avatar AS authorAvatar
        FROM forum_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.topic_id = ? AND p.parent_post_id IS NULL AND p.status != 'deleted'
    `;
    const [postRows] = await connection.query(postQuery, [numericTopicId]);
    const initialPost = postRows.length > 0 ? postRows[0] : null;

    // 3. Fetch Tags
    const tagsQuery = `
        SELECT ft.id, ft.name, ft.slug, ft.color_classes
        FROM forum_tags ft
        JOIN forum_topic_tags ftt ON ft.id = ftt.tag_id
        WHERE ftt.topic_id = ?
        ORDER BY ft.name ASC
    `;
    const [tags] = await connection.query(tagsQuery, [numericTopicId]);

    // 4. Check if the requesting user liked the initial post (if applicable)
    let userLikedInitialPost = false;
    if (requestingUserId && initialPost) {
        const likeQuery = 'SELECT 1 FROM forum_post_likes WHERE user_id = ? AND post_id = ? LIMIT 1';
        const [likeRows] = await connection.query(likeQuery, [requestingUserId, initialPost.id]);
        userLikedInitialPost = likeRows.length > 0;
    }

    // 5. Calculate the actual reply count (excluding initial post)
    const countQueryParams = [numericTopicId, 'visible'];
    if (initialPost) {
        countQueryParams.push(initialPost.id);
    }
    const countQuery = `
        SELECT COUNT(*)
        FROM forum_posts
        WHERE topic_id = ? AND status = ? ${initialPost ? 'AND id != ?' : ''} -- Exclude initial post from count
    `;
    const [[{ 'COUNT(*)': calculatedReplyCount }]] = await connection.query(countQuery, countQueryParams);
    logger.info('计算得到的回复数', { topicId: numericTopicId, calculatedReplyCount });

    connection.release();

    // Construct the response
    const responseData = {
      id: topic.id,
      title: topic.title,
      status: topic.status,
      reply_count: calculatedReplyCount,
      like_count: topic.like_count,
      created_at: new Date(topic.created_at).toISOString(),
      last_activity_at: new Date(topic.last_activity_at).toISOString(),
      author: {
        id: topic.authorId,
        username: topic.authorUsername,
        avatar: topic.authorAvatar,
      },
      category: {
        id: topic.categoryId,
        name: topic.categoryName,
        slug: topic.categorySlug,
      },
      tags: tags,
      initialPost: initialPost ? {
        id: initialPost.id,
        content: initialPost.content,
        status: initialPost.status,
        like_count: initialPost.like_count,
        created_at: new Date(initialPost.created_at).toISOString(),
        author: {
          id: initialPost.authorId,
          username: initialPost.authorUsername,
          avatar: initialPost.authorAvatar,
        },
        userLiked: userLikedInitialPost,
      } : null,
    };

    logger.info('成功获取主题详细信息', { topicId: numericTopicId });
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    logger.error('获取主题详细信息失败', { topicId: numericTopicId, error: error.message, stack: error.stack });
    return NextResponse.json({ message: '获取主题详情失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

/**
 * @desc    删除指定论坛主题及其所有相关数据
 * @route   DELETE /api/forum/topics/[topicId]
 * @access  Private (Topic Author only)
 */
export async function DELETE(request, context) {
  let userId;
  let connection;

  // 1. Extract topicId from URL
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/'); 
  const topicId = pathSegments[pathSegments.length - 1]; 
  const numericTopicId = parseInt(topicId, 10);

  logger.info('开始删除论坛主题', { topicId: numericTopicId });

  if (isNaN(numericTopicId)) {
    logger.warn('删除主题失败：无效的主题 ID', { topicId });
    return NextResponse.json({ message: '无效的主题 ID' }, { status: 400 });
  }

  try {
    // 2. Authenticate user
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('用户已认证', { userId, topicId: numericTopicId });

    // 3. Database transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 3.1 Verify ownership and topic existence
      const [topicCheck] = await connection.query(
        'SELECT user_id FROM forum_topics WHERE id = ?',
         [numericTopicId]
      );

      if (topicCheck.length === 0) {
        logger.warn('删除主题失败：主题不存在', { userId, topicId: numericTopicId });
        await connection.rollback();
        connection.release();
        return NextResponse.json({ message: '主题不存在' }, { status: 404 });
      }

      const topicAuthorId = topicCheck[0].user_id;
      if (topicAuthorId !== userId) {
        logger.warn('删除主题失败：用户无权限', { userId, topicId: numericTopicId, authorId: topicAuthorId });
        await connection.rollback();
        connection.release();
        return NextResponse.json({ message: '您无权删除此主题' }, { status: 403 }); // Forbidden
      }

      logger.info('权限校验通过，用户是主题作者', { userId, topicId: numericTopicId });

      // 3.2 Delete related post likes
      const [likeDeleteResult] = await connection.execute(
          'DELETE FROM forum_post_likes WHERE post_id IN (SELECT id FROM forum_posts WHERE topic_id = ?)',
          [numericTopicId]
      );
      logger.info('相关帖子点赞已删除', { topicId: numericTopicId, affectedRows: likeDeleteResult.affectedRows });

      // 3.3 Delete related posts
      const [postDeleteResult] = await connection.execute(
          'DELETE FROM forum_posts WHERE topic_id = ?',
          [numericTopicId]
      );
      logger.info('相关帖子已删除', { topicId: numericTopicId, affectedRows: postDeleteResult.affectedRows });

      // 3.4 Delete related topic tags
       const [tagDeleteResult] = await connection.execute(
           'DELETE FROM forum_topic_tags WHERE topic_id = ?',
           [numericTopicId]
       );
       logger.info('相关主题标签关联已删除', { topicId: numericTopicId, affectedRows: tagDeleteResult.affectedRows });

      // 3.5 Delete the topic itself
      const [topicDeleteResult] = await connection.execute(
          'DELETE FROM forum_topics WHERE id = ?',
          [numericTopicId] // Already verified ownership
      );
      logger.info('主题本身已删除', { topicId: numericTopicId, affectedRows: topicDeleteResult.affectedRows });

      // 3.6 Commit the transaction
      await connection.commit();
      logger.info('主题删除事务提交成功', { userId, topicId: numericTopicId });

      connection.release();
      // Return 204 No Content for successful DELETE is also common
      return NextResponse.json({ message: '主题删除成功' }, { status: 200 }); 

    } catch (dbError) {
      await connection.rollback();
      logger.error('删除主题数据库操作失败，事务已回滚', { userId, topicId: numericTopicId, error: dbError.message, stack: dbError.stack });
      connection.release();
      return NextResponse.json({ message: '删除主题数据库操作失败' }, { status: 500 });
    }

  } catch (error) {
    // Handle authentication errors or other unexpected errors
    logger.error('删除主题过程中发生错误', { topicId: numericTopicId, error: error.message, stack: error.stack });
    if (connection) connection.release();

    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: '删除主题时发生服务器错误' }, { status: 500 });
  }
} 