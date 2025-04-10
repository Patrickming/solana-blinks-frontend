-- forum.sql
-- 社区论坛功能的数据库 Schema

-- 确保使用 utf8mb4 以支持完整的 Unicode
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 论坛分类表 (例如: 讨论, 帮助, 展示, 公告)
CREATE TABLE IF NOT EXISTS forum_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '分类的显示名称 (例如: "讨论")',
    slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL友好的标识符 (例如: "discussion")',
    description TEXT DEFAULT NULL COMMENT '分类的可选描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论坛分类';

-- 论坛标签表 (例如: 热门, 官方, 观察, 已解答)
CREATE TABLE IF NOT EXISTS forum_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签的显示名称 (例如: "热门")',
    slug VARCHAR(50) NOT NULL UNIQUE COMMENT '内部标识符 (例如: "hot")',
    color_classes VARCHAR(255) DEFAULT NULL COMMENT '用于标签样式的CSS类 (例如: "bg-red-500/20 text-red-500")',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论坛标签';

-- 论坛主题表 (主帖子)
CREATE TABLE IF NOT EXISTS forum_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '外键, 引用 users 表 (主题创建者)',
    category_id INT NOT NULL COMMENT '外键, 引用 forum_categories 表',
    title VARCHAR(255) NOT NULL COMMENT '主题的标题',
    -- 初始内容存储在关联此主题的 forum_posts 表中的第一条帖子
    status ENUM('open', 'closed', 'hidden', 'deleted') DEFAULT 'open' COMMENT '主题的审核状态 (开放, 关闭, 隐藏, 删除)',
    reply_count INT UNSIGNED DEFAULT 0 COMMENT '冗余存储的回复数量 (不包括初始帖子)',
    like_count INT UNSIGNED DEFAULT 0 COMMENT '冗余存储的初始帖子的点赞数量',
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后活动时间戳 (新帖子或编辑) - 用于排序',
    last_activity_user_id INT DEFAULT NULL COMMENT '执行最后活动的用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (last_activity_user_id) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_topic_user (user_id),
    INDEX idx_topic_category (category_id),
    INDEX idx_topic_status (status),
    INDEX idx_topic_last_activity (last_activity_at),
    FULLTEXT KEY idx_topic_title (title) COMMENT '用于标题的全文搜索'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论坛主题';

-- 论坛帖子表 (初始帖子和回复)
CREATE TABLE IF NOT EXISTS forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT NOT NULL COMMENT '外键, 引用 forum_topics 表',
    user_id INT NOT NULL COMMENT '外键, 引用 users 表 (帖子作者)',
    parent_post_id INT DEFAULT NULL COMMENT '外键, 引用自身以实现嵌套回复 (初始帖子或顶级回复为 NULL)',
    content TEXT NOT NULL COMMENT '帖子的内容',
    status ENUM('visible', 'hidden', 'deleted') DEFAULT 'visible' COMMENT '帖子的审核状态 (可见, 隐藏, 删除)',
    like_count INT UNSIGNED DEFAULT 0 COMMENT '冗余存储的此帖子的点赞数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,

    INDEX idx_post_topic (topic_id),
    INDEX idx_post_user (user_id),
    INDEX idx_post_parent (parent_post_id),
    INDEX idx_post_status (status),
    INDEX idx_post_created (created_at),
    FULLTEXT KEY idx_post_content (content) COMMENT '用于内容的全文本搜索'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论坛帖子 (包括回复)';

-- 连接表: 用于主题和标签之间的多对多关系
CREATE TABLE IF NOT EXISTS forum_topic_tags (
    topic_id INT NOT NULL COMMENT '主题ID',
    tag_id INT NOT NULL COMMENT '标签ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关联创建时间',

    PRIMARY KEY (topic_id, tag_id) COMMENT '确保每个主题只能应用一个标签一次',

    FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES forum_tags(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主题与标签的关联';

-- 帖子点赞/反应表 (允许同一用户多次点赞同一帖子)
CREATE TABLE IF NOT EXISTS forum_post_likes (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞记录的唯一ID', -- 添加自增主键
    user_id INT NOT NULL COMMENT '点赞帖子的用户ID',
    post_id INT NOT NULL COMMENT '被点赞的帖子ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',

    -- 移除了之前的 PRIMARY KEY (user_id, post_id)

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,

    INDEX idx_like_user (user_id), -- 保留索引方便查询
    INDEX idx_like_post (post_id)  -- 保留索引方便查询
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子点赞记录 (允许多次)';

-- --- 可选: 用于冗余计数和活动时间戳的触发器 ---
-- 这些可以提高性能，但会增加复杂性。如果需要，请实施它们。

-- 示例触发器: 新帖子插入后更新主题的回复数和最后活动时间
DELIMITER //
CREATE TRIGGER trg_after_post_insert
AFTER INSERT ON forum_posts
FOR EACH ROW
BEGIN
    -- 仅当不是初始帖子时才增加回复计数(假设初始帖子 parent_post_id 为 NULL 或有特定逻辑)
    -- 简化逻辑: 为任何新帖子增加计数。如果初始帖子不应计数，请调整。
    UPDATE forum_topics
    SET reply_count = reply_count + 1,
        last_activity_at = NEW.created_at,
        last_activity_user_id = NEW.user_id
    WHERE id = NEW.topic_id;
END; //
DELIMITER ;

-- 示例触发器: 点赞添加后更新帖子的点赞数
DELIMITER //
CREATE TRIGGER trg_after_like_insert
AFTER INSERT ON forum_post_likes
FOR EACH ROW
BEGIN
    UPDATE forum_posts
    SET like_count = like_count + 1
    WHERE id = NEW.post_id;

    -- 如果被点赞的帖子是初始帖子，也更新主题的点赞数
    -- 需要识别初始帖子 (例如，检查它是否是该主题创建时间最早的帖子)
    -- 这部分更复杂，可能更适合在应用逻辑或更复杂的触发器中处理。
END; //
DELIMITER ;

-- 示例触发器: 点赞移除后更新帖子的点赞数
DELIMITER //
CREATE TRIGGER trg_after_like_delete
AFTER DELETE ON forum_post_likes
FOR EACH ROW
BEGIN
    UPDATE forum_posts
    SET like_count = GREATEST(0, like_count - 1) -- 确保计数不会低于 0
    WHERE id = OLD.post_id;

    -- 如果必要，也更新主题的点赞数 (复杂度同上)
END; //
DELIMITER ;

-- --- 结束 可选触发器 ---