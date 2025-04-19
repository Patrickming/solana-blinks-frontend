-- --------------------------------------------------------
-- 数据库: `blinks`
-- 示例数据: `tutorial_document_categories`
-- --------------------------------------------------------
INSERT INTO `tutorial_document_categories` (`name`, `slug`, `description`) VALUES
('API 参考', 'api-reference', '关于 Solana Blinks API 的详细文档。'),
('SDK 指南', 'sdk-guides', '如何使用各种 SDK 与 Solana Blinks 交互。'),
('技术概念', 'technical-concepts', '深入理解 Solana 和 Blinks 的核心技术。'),
('快速入门', 'quickstarts', '帮助开发者快速开始项目的教程。');

-- --------------------------------------------------------
-- 示例数据: `tutorial_document_tags`
-- --------------------------------------------------------
INSERT INTO `tutorial_document_tags` (`name`, `slug`) VALUES
('API', 'api'),
('SDK', 'sdk'),
('Solana', 'solana'),
('Blinks', 'blinks'),
('教程', 'tutorial'),
('指南', 'guide'),
('开发者', 'developer'),
('核心', 'core'),
('交易', 'transaction');

-- --------------------------------------------------------
-- 示例数据: `tutorial_documents`
-- 假设 users 表中已有 id 为 1 和 2 的用户
-- 假设 categories 表中 id 1=API参考, 2=SDK指南, 3=技术概念, 4=快速入门
-- --------------------------------------------------------
INSERT INTO `tutorial_documents` (`user_id`, `category_id`, `title`, `description`, `file_path`, `file_type`, `file_size`, `version`, `status`, `download_count`, `created_at`, `updated_at`) VALUES
(1, 1, 'Solana Blinks API 完整参考 v1.1', '本文档提供了 Solana Blinks REST API 的所有端点、请求参数、响应格式和错误代码的详细说明。', '/tutotial_documents/solana_blinks_api_ref_v1.1.pdf', 'application/pdf', 2516582, 'v1.1.0', 'published', 135, '2024-04-10 10:00:00', '2024-04-15 11:30:00'),
(1, 2, 'JavaScript SDK 开发实战', '学习如何使用官方 JavaScript SDK 构建与 Solana Blinks 交互的前端和后端应用。', '/tutotial_documents/javascript_sdk_guide.md', 'text/markdown', 838860, 'v2.0.1', 'published', 288, '2024-04-12 14:20:00', '2024-04-18 09:00:00'),
(2, 3, '深入理解 Solana 交易处理', '详细解析 Solana 网络中交易的生命周期、确认机制和优化技巧。', '/tutotial_documents/179同替.pdf', 'application/pdf', 744883, 'v1.0.0', 'published', 95, '2024-04-16 16:45:00', '2024-04-17 17:00:00'),
(1, 4, 'Blink 捐赠按钮快速集成', '一个五分钟教程，教你如何在网站上快速集成一个 Solana Blinks 捐赠按钮。', '/tutotial_documents/blink_donation_quickstart.md', 'text/markdown', 314572, 'v1.0.0', 'published', 512, '2024-04-18 11:00:00', '2024-04-18 11:00:00');

-- --------------------------------------------------------
-- 示例数据: `tutorial_document_document_tags`
-- 假设 documents 表中 id 1=API参考, 2=JS SDK, 3=交易处理, 4=捐赠按钮
-- 假设 tags 表中 id 1=API, 2=SDK, 3=Solana, 4=Blinks, 5=教程, 6=指南, 7=开发者, 8=核心, 9=交易
-- --------------------------------------------------------
INSERT INTO `tutorial_document_document_tags` (`document_id`, `tag_id`) VALUES
-- 文档 1 (API 参考) 关联 API, Solana, Blinks, 开发者
(1, 1),
(1, 3),
(1, 4),
(1, 7),
-- 文档 2 (JS SDK) 关联 SDK, Solana, Blinks, 教程, 开发者
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(2, 7),
-- 文档 3 (交易处理) 关联 Solana, 核心, 交易, 开发者
(3, 3),
(3, 8),
(3, 9),
(3, 7),
-- 文档 4 (捐赠按钮) 关联 Blinks, 教程, 快速入门 (假设快速入门是id=10, 需要先插入tag), 指南
(4, 4),
(4, 5),
-- (4, 10), -- 如果有 快速入门 标签
(4, 6); 