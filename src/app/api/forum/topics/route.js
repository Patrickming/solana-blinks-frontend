import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/config/database'; // Corrected path
import logger from '../../../../lib/backend-utils/logger'; // Corrected path
import { authenticateRequest } from '../../../../lib/authUtils'; // Corrected path

export const dynamic = 'force-dynamic'; // Ensure fresh data

// Helper function to parse GROUP_CONCAT results for tags
function parseConcatenatedTags(row) {
  if (!row.tagIds) {
    return [];
  }
  const ids = row.tagIds.split('||');
  const names = row.tagNames.split('||');
  const slugs = row.tagSlugs.split('||');
  const colors = row.tagColors.split('||');
  return ids.map((id, index) => ({
    id: parseInt(id, 10),
    name: names[index],
    slug: slugs[index],
    color_classes: colors[index] === 'NULL' ? null : colors[index], // Handle potential NULL from LEFT JOIN
  }));
}

/**
 * @desc    获取论坛主题列表 (支持分页, 排序, 过滤)
 * @route   GET /api/forum/topics
 * @access  Public
 * @params  page (int), limit (int), categoryId (int), tagId (int), sortBy (string: 'activity', 'created', 'replies', 'likes')
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const categoryId = searchParams.get('categoryId');
  const tagId = searchParams.get('tagId');
  const sortBy = searchParams.get('sortBy') || 'activity';
  // Get search term
  const searchTerm = searchParams.get('search');
  const offset = (page - 1) * limit;

  logger.info('开始获取论坛主题列表', { page, limit, categoryId, tagId, sortBy, searchTerm });

  let sortClause = 'ORDER BY t.last_activity_at DESC';
  switch (sortBy) {
    case 'created':
      sortClause = 'ORDER BY t.created_at DESC';
      break;
    case 'replies':
      sortClause = 'ORDER BY t.reply_count DESC, t.last_activity_at DESC';
      break;
    case 'likes': // Likes on the initial post
      sortClause = 'ORDER BY t.like_count DESC, t.last_activity_at DESC';
      break;
    // Default is 'activity'
  }

  const queryParams = [];
  const countQueryParams = []; // Separate params for count query
  let whereClauses = ['t.status = ?'];
  queryParams.push('open');
  countQueryParams.push('open');

  if (categoryId) {
    whereClauses.push('t.category_id = ?');
    const categoryIdInt = parseInt(categoryId, 10);
    queryParams.push(categoryIdInt);
    countQueryParams.push(categoryIdInt);
  }

  // Handle search term
  if (searchTerm && searchTerm.trim()) {
    whereClauses.push('t.title LIKE ?');
    const searchPattern = `%${searchTerm.trim()}%`;
    queryParams.push(searchPattern);
    countQueryParams.push(searchPattern);
  }

  // Filtering by tag requires a join. We need to add this join conditionally ONLY IF tagId is present.
  // The join should also be added to the count query.
  let tagJoin = '';
  if (tagId) {
    tagJoin = ' JOIN forum_topic_tags ftt_filter ON t.id = ftt_filter.topic_id ';
    whereClauses.push('ftt_filter.tag_id = ?');
    const tagIdInt = parseInt(tagId, 10);
    queryParams.push(tagIdInt);
    countQueryParams.push(tagIdInt);
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const connection = await pool.getConnection();
  try {
    // Query for topics with joins and GROUP_CONCAT for tags
    const topicsQuery = `
        SELECT
            t.id, t.title, t.status,
            (
                SELECT COUNT(*)
                FROM forum_posts fp
                WHERE fp.topic_id = t.id
                  AND fp.status = 'visible'
                  AND fp.id != (
                      SELECT id
                      FROM forum_posts fp_init
                      WHERE fp_init.topic_id = t.id
                        AND fp_init.parent_post_id IS NULL
                      ORDER BY fp_init.created_at ASC
                      LIMIT 1
                  )
            ) AS calculated_reply_count,
            t.like_count, t.last_activity_at, t.created_at,
            u.id AS authorId, u.username AS authorUsername, u.avatar AS authorAvatar,
            c.id AS categoryId, c.name AS categoryName, c.slug AS categorySlug,
            GROUP_CONCAT(DISTINCT ft.id ORDER BY ft.name SEPARATOR '||') AS tagIds,
            GROUP_CONCAT(DISTINCT ft.name ORDER BY ft.name SEPARATOR '||') AS tagNames,
            GROUP_CONCAT(DISTINCT ft.slug ORDER BY ft.name SEPARATOR '||') AS tagSlugs,
            GROUP_CONCAT(DISTINCT IFNULL(ft.color_classes, 'NULL') ORDER BY ft.name SEPARATOR '||') AS tagColors
        FROM forum_topics t
        JOIN users u ON t.user_id = u.id
        JOIN forum_categories c ON t.category_id = c.id
        LEFT JOIN forum_topic_tags ftt ON t.id = ftt.topic_id
        LEFT JOIN forum_tags ft ON ftt.tag_id = ft.id
        ${tagJoin} -- Conditionally join for tag filtering
        ${whereString} -- Apply WHERE clauses (including search and category)
        GROUP BY t.id
        ${sortClause}
        LIMIT ?
        OFFSET ?
    `;
    // Add limit and offset ONLY to the main query params
    queryParams.push(limit, offset);

    // logger.debug("Executing Topics Query:", topicsQuery);
    // logger.debug("Topics Query Params:", queryParams);
    // Use info instead of debug if debug is not available
    logger.info("Executing Topics Query with Params:", { queryParams }); 

    const [rows] = await connection.query(topicsQuery, queryParams);

    // Query for total count for pagination - Use countQueryParams here
    const countQuery = `
        SELECT COUNT(DISTINCT t.id) as totalCount
        FROM forum_topics t
        ${tagJoin} -- Conditionally join for tag filtering
        ${whereString} -- Apply the same WHERE clauses
    `;

    // logger.debug("Executing Count Query:", countQuery);
    // logger.debug("Count Query Params:", countQueryParams);
    // Use info instead of debug if debug is not available
    logger.info("Executing Count Query with Params:", { countQueryParams });

    const [[{ totalCount }]] = await connection.query(countQuery, countQueryParams);

    // Batch query for initial post content snippets for the fetched topics
    const topicIds = rows.map(row => row.id);
    let initialPostContents = {};
    if (topicIds.length > 0) {
        // Find the ID of the first post for each topic_id (assuming MIN(id) is the first post)
        const firstPostIdQuery = `
            SELECT topic_id, MIN(id) as first_post_id
            FROM forum_posts
            WHERE topic_id IN (?)
            GROUP BY topic_id
        `;
        const [firstPostIdRows] = await connection.query(firstPostIdQuery, [topicIds]);
        const firstPostIdsMap = firstPostIdRows.reduce((acc, row) => {
            acc[row.topic_id] = row.first_post_id;
            return acc;
        }, {});

        const relevantPostIds = Object.values(firstPostIdsMap).filter(id => id != null); // Get unique initial post IDs

        if (relevantPostIds.length > 0) {
            // Now fetch the content for these specific first post IDs
            const contentQuery = `
                SELECT id as post_id, LEFT(content, 150) as content_snippet
                FROM forum_posts
                WHERE id IN (?)
            `;
            const [contentRows] = await connection.query(contentQuery, [relevantPostIds]);

            // Map content snippets back to topic IDs using the firstPostIdsMap
            const contentMap = contentRows.reduce((acc, row) => {
                acc[row.post_id] = row.content_snippet;
                return acc;
            }, {});

            // Populate initialPostContents using the topicId -> firstPostId -> snippet mapping
            for (const topicId in firstPostIdsMap) {
                const postId = firstPostIdsMap[topicId];
                if (postId && contentMap[postId]) {
                    initialPostContents[topicId] = contentMap[postId];
                }
            }
        }
    }

    const topics = rows.map(row => ({
      id: row.id,
      title: row.title,
      status: row.status,
      reply_count: row.calculated_reply_count,
      like_count: row.like_count,
      created_at: new Date(row.created_at).toISOString(),
      last_activity_at: new Date(row.last_activity_at).toISOString(),
      content_snippet: initialPostContents[row.id] || null, // Add content snippet
      author: {
        id: row.authorId,
        username: row.authorUsername,
        avatar: row.authorAvatar
      },
      category: {
        id: row.categoryId,
        name: row.categoryName,
        slug: row.categorySlug
      },
      tags: parseConcatenatedTags(row)
    }));

    logger.info(`成功获取 ${topics.length} 个主题 (总计: ${totalCount}, 搜索: "${searchTerm || ''}")`);
    return NextResponse.json({ 
        topics,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) 
    }, { status: 200 });

  } catch (error) {
    logger.error('获取论坛主题列表失败', { error: error.message, stack: error.stack, queryParams });
    return NextResponse.json({ message: '获取主题列表失败' }, { status: 500 });
  } finally {
    connection.release();
  }
}

/**
 * @desc    创建新的论坛主题
 * @route   POST /api/forum/topics
 * @access  Private
 */
export async function POST(request) {
  let userId;
  let connection;
  try {
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('开始创建新论坛主题', { userId });

    const body = await request.json();
    const { title, content, categoryId, tagIds } = body;

    // --- Validation ---
    if (!title || !content || !categoryId) {
      logger.warn('创建主题失败：缺少必要字段 (title, content, categoryId)', { userId });
      return NextResponse.json({ message: '标题、内容和分类是必需的' }, { status: 400 });
    }
    if (tagIds && !Array.isArray(tagIds)) {
      logger.warn('创建主题失败：tagIds 必须是数组', { userId });
      return NextResponse.json({ message: '标签 ID 必须是数组格式' }, { status: 400 });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const now = new Date(); // Get current time from Node.js server

      // 1. Insert the topic - Added created_at, replaced NOW() for last_activity_at
      const [topicResult] = await connection.execute(
        `INSERT INTO forum_topics (user_id, category_id, title, created_at, last_activity_at, last_activity_user_id)
         VALUES (?, ?, ?, ?, ?, ?)`, 
        [userId, categoryId, title, now, now, userId] // Use 'now' for created_at and last_activity_at
      );
      const newTopicId = topicResult.insertId;
      logger.info('论坛主题记录插入成功', { newTopicId, userId });

      // 2. Insert the initial post - Added created_at
      const [postResult] = await connection.execute(
        `INSERT INTO forum_posts (topic_id, user_id, content, parent_post_id, created_at)
         VALUES (?, ?, ?, NULL, ?)`, 
        [newTopicId, userId, content, now] // Use 'now' for created_at
      );
      const newPostId = postResult.insertId;
      logger.info('论坛初始帖子记录插入成功', { newPostId, newTopicId, userId });

      // 3. Insert tags if provided
      if (tagIds && tagIds.length > 0) {
        const tagValues = tagIds.map(tagId => [newTopicId, tagId]);
        await connection.query(
          'INSERT INTO forum_topic_tags (topic_id, tag_id) VALUES ?', 
          [tagValues]
        );
        logger.info('论坛主题标签关联成功', { newTopicId, tagIds });
      }

      await connection.commit();
      logger.info('新论坛主题创建事务提交成功', { newTopicId });

      // Return the ID of the newly created topic
      // Frontend expects the key to be 'id'
      return NextResponse.json({ id: newTopicId }, { status: 201 });

    } catch (dbError) {
      await connection.rollback();
      logger.error('创建新论坛主题数据库操作失败，事务已回滚', { userId, error: dbError.message, stack: dbError.stack });
      // Check for foreign key constraint errors (e.g., invalid categoryId)
      if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        return NextResponse.json({ message: '无效的分类或标签ID' }, { status: 400 });
      }
      throw dbError; // Re-throw other DB errors
    }

  } catch (error) {
    logger.error('创建新论坛主题过程中发生错误', { userId, error: error.message, stack: error.stack });
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: '创建主题失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
} 