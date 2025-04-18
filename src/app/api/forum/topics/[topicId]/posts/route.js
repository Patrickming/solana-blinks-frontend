import { NextResponse } from 'next/server';
import { pool } from '../../../../../../lib/config/database'; // Adjust path
import logger from '../../../../../../lib/backend-utils/logger'; // Adjust path
import { authenticateRequest } from '../../../../../../lib/authUtils'; // Adjust path

export const dynamic = 'force-dynamic';

// Helper to get user ID safely if authenticated
async function getAuthenticatedUserId(request) {
    try {
        const user = await authenticateRequest(request);
        return user.id;
    } catch (error) {
        if (!error.message.startsWith('未授权')) {
             logger.warn('Error during optional authentication for topic posts', { error: error.message });
        }
        return null; 
    }
}

/**
 * @desc    获取指定主题的帖子列表 (回复, 支持分页)
 * @route   GET /api/forum/topics/[topicId]/posts
 * @access  Public (like status depends on authentication)
 * @params  page (int), limit (int)
 */
export async function GET(request, context) {
  // Extract topicId from URL instead of context.params
  const url = new URL(request.url);
  // Pathname might be /api/forum/topics/123/posts, so topicId is second to last
  const pathSegments = url.pathname.split('/'); 
  const topicId = pathSegments[pathSegments.length - 2]; // Get the second to last segment
  // const params = context.params; 
  // const topicId = params.topicId;
  const numericTopicId = parseInt(topicId, 10);
  const { searchParams } = url; // Use searchParams from the already parsed URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;

  const requestingUserId = await getAuthenticatedUserId(request);
  logger.info('开始获取主题帖子列表', { topicId: numericTopicId, page, limit, requestingUserId });

  if (isNaN(numericTopicId)) {
    logger.warn('获取主题帖子失败：无效的主题 ID', { topicId });
    return NextResponse.json({ message: '无效的主题 ID' }, { status: 400 });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Check if topic exists and is visible
    const [topicCheck] = await connection.query(
        'SELECT 1 FROM forum_topics WHERE id = ? AND status != ? LIMIT 1',
        [numericTopicId, 'deleted']
    );
    if (topicCheck.length === 0) {
        logger.warn('获取主题帖子失败：主题未找到或不可见', { topicId: numericTopicId });
        connection.release(); // Release connection before returning
        return NextResponse.json({ message: '主题未找到或不可见' }, { status: 404 });
    }

    // 1. Find the ID of the initial post for this topic
    let initialPostId = null;
    const [initialPostRow] = await connection.query(
        'SELECT id FROM forum_posts WHERE topic_id = ? AND parent_post_id IS NULL ORDER BY created_at ASC LIMIT 1',
        [numericTopicId]
    );
    if (initialPostRow.length > 0) {
        initialPostId = initialPostRow[0].id;
        logger.info('找到初始帖子 ID', { topicId: numericTopicId, initialPostId });
    } else {
        logger.warn('未找到主题的初始帖子', { topicId: numericTopicId });
        // Proceeding anyway, maybe the topic has no initial post?
    }

    // 2. Fetch ALL relevant posts (excluding initial post using WHERE clause)
    const postsQuery = `
        SELECT
            p.id, p.topic_id, p.parent_post_id, p.content, p.status, p.like_count, p.created_at,
            u.id AS authorId, u.username AS authorUsername, u.avatar AS authorAvatar
        FROM forum_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.topic_id = ? 
          AND p.status = ? 
          ${initialPostId ? 'AND p.id != ?' : ''} -- Exclude initial post if found
        ORDER BY p.created_at ASC
        LIMIT ?
        OFFSET ?
    `;
    const queryParams = [numericTopicId, 'visible'];
    if (initialPostId) {
        queryParams.push(initialPostId);
    }
    queryParams.push(limit, offset);
    const [posts] = await connection.query(postsQuery, queryParams);

    // 3. Fetch total count of replies (excluding initial post)
    const countQueryParams = [numericTopicId, 'visible'];
    if (initialPostId) {
        countQueryParams.push(initialPostId);
    }
    const countQuery = `
        SELECT COUNT(*)
        FROM forum_posts
        WHERE topic_id = ? AND status = ? ${initialPostId ? 'AND id != ?' : ''} -- Exclude initial post from count
    `;
    const [[{ 'COUNT(*)': totalCount }]] = await connection.query(countQuery, countQueryParams);

    // 4. Get like status for the current user for the fetched posts
    const postIds = posts.map(p => p.id);
    let userLikes = {};
    if (requestingUserId && postIds.length > 0) {
        const likeQuery = `SELECT post_id FROM forum_post_likes WHERE user_id = ? AND post_id IN (?)`;
        const [likeRows] = await connection.query(likeQuery, [requestingUserId, postIds]);
        likeRows.forEach(row => { userLikes[row.post_id] = true; });
    }

    connection.release();

    const formattedPosts = posts.map(post => ({
      id: post.id,
      topic_id: post.topic_id,
      parent_post_id: post.parent_post_id,
      content: post.content,
      status: post.status,
      like_count: post.like_count,
      created_at: new Date(post.created_at).toISOString(),
      author: {
        id: post.authorId,
        username: post.authorUsername,
        avatar: post.authorAvatar
      },
      userLiked: userLikes[post.id] || false
    }));

    logger.info(`成功获取 ${formattedPosts.length} 个主题帖子 (总回复数: ${totalCount})`);
    return NextResponse.json({ 
        posts: formattedPosts,
        totalCount, // Total number of replies
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) 
    }, { status: 200 });

  } catch (error) {
    logger.error('获取主题帖子列表失败', { topicId: numericTopicId, error: error.message, stack: error.stack });
    return NextResponse.json({ message: '获取帖子列表失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

/**
 * @desc    在指定主题下创建新帖子 (回复)
 * @route   POST /api/forum/topics/[topicId]/posts
 * @access  Private
 */
export async function POST(request, { params }) {
  let userId;
  // Extract topicId from URL instead of params
  const url = new URL(request.url);
  // Pathname might be /api/forum/topics/123/posts, so topicId is second to last
  const pathSegments = url.pathname.split('/'); 
  const topicId = pathSegments[pathSegments.length - 2]; // Get the second to last segment
  // const { topicId } = params; 
  const numericTopicId = parseInt(topicId, 10);

  if (isNaN(numericTopicId)) {
    logger.warn('创建帖子失败：无效的主题 ID', { topicId });
    return NextResponse.json({ message: '无效的主题 ID' }, { status: 400 });
  }

  let connection;
  try {
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('开始创建新论坛帖子 (回复)', { userId, topicId: numericTopicId });

    const body = await request.json();
    const { content, parentPostId } = body; // parentPostId for nested replies

    if (!content) {
      logger.warn('创建帖子失败：缺少内容字段', { userId, topicId: numericTopicId });
      return NextResponse.json({ message: '帖子内容是必需的' }, { status: 400 });
    }

    const numericParentPostId = parentPostId ? parseInt(parentPostId, 10) : null;
    if (parentPostId && isNaN(numericParentPostId)) {
        logger.warn('创建帖子失败：无效的父帖子 ID', { userId, topicId: numericTopicId, parentPostId });
        return NextResponse.json({ message: '无效的父帖子 ID' }, { status: 400 });
    }

    connection = await pool.getConnection();

    // Check if topic exists and is open
    const [topicCheck] = await connection.query(
        'SELECT status FROM forum_topics WHERE id = ? LIMIT 1',
        [numericTopicId]
    );
    if (topicCheck.length === 0 || topicCheck[0].status !== 'open') {
        logger.warn('创建帖子失败：主题不存在或已关闭', { userId, topicId: numericTopicId });
        connection.release();
        return NextResponse.json({ message: '无法在此主题下回复' }, { status: 403 }); // Forbidden
    }

    // Optional: Check if parentPostId exists and belongs to the same topic
    if (numericParentPostId) {
        const [parentCheck] = await connection.query(
            'SELECT topic_id FROM forum_posts WHERE id = ? LIMIT 1',
            [numericParentPostId]
        );
        if (parentCheck.length === 0 || parentCheck[0].topic_id !== numericTopicId) {
            logger.warn('创建帖子失败：父帖子不存在或不属于当前主题', { userId, topicId: numericTopicId, parentPostId });
            connection.release();
            return NextResponse.json({ message: '无效的父帖子 ID' }, { status: 400 });
        }
    }

    const now = new Date(); // Get current time from Node.js server

    // Insert the new post - Added created_at column
    const [postResult] = await connection.execute(
      `INSERT INTO forum_posts (topic_id, user_id, content, parent_post_id, created_at)
       VALUES (?, ?, ?, ?, ?)`, 
      [numericTopicId, userId, content, numericParentPostId, now] // Use 'now' for created_at
    );
    const newPostId = postResult.insertId;

    logger.info('新论坛帖子 (回复) 创建成功', { newPostId, topicId: numericTopicId, userId });

    // Manually update topic's last activity since we are not relying on DB NOW() or trigger for this
    await connection.execute(
        'UPDATE forum_topics SET last_activity_at = ?, last_activity_user_id = ? WHERE id = ?',
        [now, userId, numericTopicId]
    );
    logger.info('论坛主题最后活动时间已手动更新', { topicId: numericTopicId, userId });

    // Fetch the newly created post to return it
    const [newPostRows] = await connection.query(
      `SELECT
            p.id, p.topic_id, p.parent_post_id, p.content, p.status, p.like_count, p.created_at,
            u.id AS authorId, u.username AS authorUsername, u.avatar AS authorAvatar
        FROM forum_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?`, 
        [newPostId]
    );

    connection.release();

    if (newPostRows.length === 0) {
         // Should not happen, but handle defensively
         logger.error('创建帖子后无法立即获取帖子数据', { newPostId });
         return NextResponse.json({ message: '创建帖子时发生错误' }, { status: 500 });
    }

    const newPost = newPostRows[0];
    const formattedPost = {
      id: newPost.id,
      topic_id: newPost.topic_id,
      parent_post_id: newPost.parent_post_id,
      content: newPost.content,
      status: newPost.status,
      like_count: newPost.like_count,
      created_at: new Date(newPost.created_at).toISOString(),
      author: {
        id: newPost.authorId,
        username: newPost.authorUsername,
        avatar: newPost.authorAvatar
      },
      userLiked: false // New post, user hasn't liked it yet
    };

    // Relying on trigger `trg_after_post_insert` to update topic reply_count and last_activity
    return NextResponse.json(formattedPost, { status: 201 });

  } catch (error) {
    logger.error('创建新论坛帖子过程中发生错误', { userId, topicId: numericTopicId, error: error.message, stack: error.stack });
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: '创建帖子失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
} 