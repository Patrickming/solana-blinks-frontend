import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/config/database'; // 更正后的相对路径
import logger from '../../../../lib/backend-utils/logger'; // 更正后的相对路径

export const dynamic = 'force-dynamic';

/**
 * @desc    获取教程文档列表 (支持分页, 搜索, 分类/标签过滤)
 * @route   GET /api/tutorials/documents
 * @access  Public
 * @params  page, limit, search, categoryId, tagId
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const searchTerm = searchParams.get('search');
  const categoryId = searchParams.get('categoryId');
  const tagId = searchParams.get('tagId');
  const offset = (page - 1) * limit;

  logger.info('开始获取教程文档列表', { page, limit, searchTerm, categoryId, tagId });

  let connection;
  try {
    connection = await pool.getConnection();

    // Base query
    let selectClause = `
      SELECT 
        d.id, d.title, d.description, d.file_type, d.file_size, d.version, 
        d.download_count, d.created_at, d.updated_at, d.file_path,
        u.id as authorId, u.username as authorUsername, u.avatar as authorAvatar,
        c.id as categoryId, c.name as categoryName, c.slug as categorySlug,
        GROUP_CONCAT(DISTINCT dt.id ORDER BY dt.name SEPARATOR '||') AS tagIds,
        GROUP_CONCAT(DISTINCT dt.name ORDER BY dt.name SEPARATOR '||') AS tagNames,
        GROUP_CONCAT(DISTINCT dt.slug ORDER BY dt.name SEPARATOR '||') AS tagSlugs
    `;
    let fromClause = `
      FROM tutorial_documents d
      JOIN users u ON d.user_id = u.id
      JOIN tutorial_document_categories c ON d.category_id = c.id
      LEFT JOIN tutorial_document_document_tags dtt ON d.id = dtt.document_id
      LEFT JOIN tutorial_document_tags dt ON dtt.tag_id = dt.id
    `;
    let whereClauses = ['d.status = ?'];
    let queryParams = ['published'];
    let countWhereClauses = ['d.status = ?'];
    let countQueryParams = ['published'];
    let tagJoin = ''; // For tag filtering join

    // Add search filter (title or description)
    if (searchTerm && searchTerm.trim()) {
      const searchPattern = `%${searchTerm.trim()}%`;
      whereClauses.push('(d.title LIKE ? OR d.description LIKE ?)');
      queryParams.push(searchPattern, searchPattern);
      countWhereClauses.push('(d.title LIKE ? OR d.description LIKE ?)');
      countQueryParams.push(searchPattern, searchPattern);
    }

    // Add category filter
    if (categoryId) {
      whereClauses.push('d.category_id = ?');
      queryParams.push(parseInt(categoryId, 10));
      countWhereClauses.push('d.category_id = ?');
      countQueryParams.push(parseInt(categoryId, 10));
    }

    // Add tag filter (requires joining the junction table specifically for filtering)
    if (tagId) {
        // We use a subquery or a separate join for filtering to avoid issues with GROUP BY
        whereClauses.push('EXISTS (SELECT 1 FROM tutorial_document_document_tags filter_dtt WHERE filter_dtt.document_id = d.id AND filter_dtt.tag_id = ?)');
        queryParams.push(parseInt(tagId, 10));
        countWhereClauses.push('EXISTS (SELECT 1 FROM tutorial_document_document_tags filter_dtt WHERE filter_dtt.document_id = d.id AND filter_dtt.tag_id = ?)');
        countQueryParams.push(parseInt(tagId, 10));
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const countWhereString = countWhereClauses.length > 0 ? `WHERE ${countWhereClauses.join(' AND ')}` : '';

    // Main query for documents
    const documentsQuery = `
      ${selectClause}
      ${fromClause}
      ${whereString}
      GROUP BY d.id
      ORDER BY d.updated_at DESC
      LIMIT ? OFFSET ?
    `;
    queryParams.push(limit, offset);

    logger.info('Executing Documents Query with Params:', { queryParams });
    const [rows] = await connection.query(documentsQuery, queryParams);

    // Count query
    const countQuery = `SELECT COUNT(DISTINCT d.id) as totalCount FROM tutorial_documents d ${countWhereString}`;
    logger.info('Executing Count Query with Params:', { countQueryParams });
    const [[{ totalCount }]] = await connection.query(countQuery, countQueryParams);

    // Parse tags for each document
    const documents = rows.map(row => {
        const tagIds = row.tagIds ? row.tagIds.split('||') : [];
        const tagNames = row.tagNames ? row.tagNames.split('||') : [];
        const tagSlugs = row.tagSlugs ? row.tagSlugs.split('||') : [];
        const tags = tagIds.map((id, index) => ({
            id: parseInt(id, 10),
            name: tagNames[index],
            slug: tagSlugs[index]
        }));

        return {
            id: row.id,
            title: row.title,
            description: row.description,
            file_type: row.file_type,
            file_size: row.file_size,
            version: row.version,
            download_count: row.download_count,
            created_at: new Date(row.created_at).toISOString(),
            updated_at: new Date(row.updated_at).toISOString(),
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
            tags: tags,
            file_path: row.file_path
        };
    });

    logger.info(`成功获取 ${documents.length} 个文档 (总计: ${totalCount})`);
    return NextResponse.json({
      documents,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }, { status: 200 });

  } catch (error) {
    logger.error('获取教程文档列表失败', { error: error.message, stack: error.stack });
    return NextResponse.json({ message: '获取文档列表失败' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
} 