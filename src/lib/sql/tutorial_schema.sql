-- --------------------------------------------------------
-- 数据库: `blinks`
-- 表结构: `tutorial_document_categories` (教程文档分类表)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tutorial_document_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类唯一ID',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `slug` VARCHAR(100) NOT NULL UNIQUE COMMENT '分类的 URL 友好标识符',
  `description` TEXT NULL COMMENT '分类描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教程文档分类表';

-- --------------------------------------------------------
-- 表结构: `tutorial_document_tags` (教程文档标签表)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tutorial_document_tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '标签唯一ID',
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
  `slug` VARCHAR(50) NOT NULL UNIQUE COMMENT '标签的 URL 友好标识符',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教程文档标签表';

-- --------------------------------------------------------
-- 表结构: `tutorial_documents` (教程文档主表)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tutorial_documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '文档唯一ID',
  `user_id` INT NOT NULL COMMENT '发布者用户ID (外键关联 users 表)',
  `category_id` INT NOT NULL COMMENT '所属分类ID (外键关联 tutorial_document_categories 表)',
  `title` VARCHAR(255) NOT NULL COMMENT '文档标题',
  `description` TEXT NULL COMMENT '文档描述',
  `file_path` VARCHAR(255) NULL COMMENT '文件存储在 public 目录下的相对路径 (例如: /tutotial_documents/xxxx.pdf)',
  `file_type` VARCHAR(50) NULL COMMENT '文件 MIME 类型 (例如: application/pdf, text/markdown)',
  `file_size` BIGINT NULL COMMENT '文件大小 (字节)',
  `version` VARCHAR(50) NULL COMMENT '文档版本号 (例如: v1.2.0)',
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' COMMENT '文档状态',
  `download_count` INT DEFAULT 0 COMMENT '下载次数统计',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `tutorial_document_categories`(`id`) ON DELETE RESTRICT,
  INDEX `idx_doc_status` (`status`),
  INDEX `idx_doc_category` (`category_id`),
  INDEX `idx_doc_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教程文档主表';

-- --------------------------------------------------------
-- 表结构: `tutorial_document_document_tags` (文档与标签关联表 - 多对多)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tutorial_document_document_tags` (
  `document_id` INT NOT NULL COMMENT '文档ID (外键关联 tutorial_documents 表)',
  `tag_id` INT NOT NULL COMMENT '标签ID (外键关联 tutorial_document_tags 表)',
  PRIMARY KEY (`document_id`, `tag_id`),
  FOREIGN KEY (`document_id`) REFERENCES `tutorial_documents`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `tutorial_document_tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教程文档与标签的关联表'; 