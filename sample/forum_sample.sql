-- forum_sample_data.sql
-- 用于根据 forum-content.tsx 中的示例数据填充论坛表
-- (包含具体的回复和点赞记录模拟)

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- --- 1. 确保分类存在 ---
-- (使用 IGNORE 避免因重复执行而出错)
INSERT IGNORE INTO `forum_categories` (`id`, `name`, `slug`, `description`) VALUES
  (1, '讨论区', 'discussion', '关于 Solana Blinks 的一般性讨论'),
  (2, '帮助与支持', 'help', '获取使用 Blinks 或平台的帮助'),
  (3, '案例展示', 'showcase', '展示您用 Blinks 构建的项目'),
  (4, '官方公告', 'announcement', '来自团队的官方公告'),
  (5, '反馈建议', 'feedback', '提供反馈和建议');

-- --- 2. 确保标签存在 ---
-- (使用 IGNORE 避免因重复执行而出错)
INSERT IGNORE INTO `forum_tags` (`id`, `name`, `slug`, `color_classes`) VALUES
  (1, '热门', 'hot', 'bg-red-500/20 text-red-500 border-red-500/30'),
  (2, '官方', 'official', 'bg-primary/20 text-primary border-primary/30'),
  (3, '观察', 'watch', 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'),
  (4, '已解答', 'answered', 'bg-green-500/20 text-green-600 border-green-500/30');

-- --- 3. 插入主题和对应的初始帖子 ---
-- (注意：你需要确保 user_id=1, 2, 3, 4 的用户在 users 表中存在)
-- (这里的 like_count 和 reply_count 仍然插入，作为目标值或初始值)

-- 主题 1: 代币交换Blinks的最佳实践 (user_id=1, category_id=1) - 12 回复, 24 点赞
INSERT INTO `forum_topics` (`id`, `user_id`, `category_id`, `title`, `status`, `reply_count`, `like_count`, `created_at`, `last_activity_at`, `last_activity_user_id`) VALUES
  (1, 1, 1, '代币交换Blinks的最佳实践', 'open', 12, 24, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 1)
ON DUPLICATE KEY UPDATE title=VALUES(title), category_id=VALUES(category_id), user_id=VALUES(user_id); -- 如果ID已存在则更新

INSERT INTO `forum_posts` (`id`, `topic_id`, `user_id`, `parent_post_id`, `content`, `status`, `like_count`, `created_at`) VALUES
  (1, 1, 1, NULL, '我一直在尝试不同的代币交换滑点设置。大家对不同代币对使用什么值？', 'visible', 24, DATE_SUB(NOW(), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE content=VALUES(content), user_id=VALUES(user_id); -- 如果ID已存在则更新

DELETE FROM `forum_topic_tags` WHERE topic_id = 1; -- 清除旧标签关联
INSERT INTO `forum_topic_tags` (`topic_id`, `tag_id`) VALUES (1, 1); -- 关联 "热门" 标签

-- 主题 2: 宣布Blinks SDK v2.0发布 (user_id=2, category_id=4) - 8 回复, 42 点赞
INSERT INTO `forum_topics` (`id`, `user_id`, `category_id`, `title`, `status`, `reply_count`, `like_count`, `created_at`, `last_activity_at`, `last_activity_user_id`) VALUES
  (2, 2, 4, '宣布Blinks SDK v2.0发布', 'open', 8, 42, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 2)
ON DUPLICATE KEY UPDATE title=VALUES(title), category_id=VALUES(category_id), user_id=VALUES(user_id);

INSERT INTO `forum_posts` (`id`, `topic_id`, `user_id`, `parent_post_id`, `content`, `status`, `like_count`, `created_at`) VALUES
  (2, 2, 2, NULL, '我们很高兴宣布Blinks SDK v2.0发布，具有改进的性能和新功能。', 'visible', 42, DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE content=VALUES(content), user_id=VALUES(user_id);

DELETE FROM `forum_topic_tags` WHERE topic_id = 2; -- 清除旧标签关联
INSERT INTO `forum_topic_tags` (`topic_id`, `tag_id`) VALUES (2, 1); -- 关联 "热门" 标签
INSERT INTO `forum_topic_tags` (`topic_id`, `tag_id`) VALUES (2, 2); -- 关联 "官方" 标签

-- 主题 3: React Native 集成问题 (user_id=3, category_id=2) - 5 回复, 7 点赞
INSERT INTO `forum_topics` (`id`, `user_id`, `category_id`, `title`, `status`, `reply_count`, `like_count`, `created_at`, `last_activity_at`, `last_activity_user_id`) VALUES
  (3, 3, 2, '在React Native应用中集成Blinks时遇到问题', 'open', 5, 7, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), 3)
ON DUPLICATE KEY UPDATE title=VALUES(title), category_id=VALUES(category_id), user_id=VALUES(user_id);

INSERT INTO `forum_posts` (`id`, `topic_id`, `user_id`, `parent_post_id`, `content`, `status`, `like_count`, `created_at`) VALUES
  (3, 3, 3, NULL, '尝试在我的React Native项目中使用Blinks SDK，但在签名交易时遇到错误。有人遇到过类似情况吗？', 'visible', 7, DATE_SUB(NOW(), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE content=VALUES(content), user_id=VALUES(user_id);

DELETE FROM `forum_topic_tags` WHERE topic_id = 3; -- 清除旧标签关联 (此主题无标签)

-- 主题 4: 展示我的新NFT收藏Blink (user_id=4, category_id=3) - 3 回复, 15 点赞
INSERT INTO `forum_topics` (`id`, `user_id`, `category_id`, `title`, `status`, `reply_count`, `like_count`, `created_at`, `last_activity_at`, `last_activity_user_id`) VALUES
  (4, 4, 3, '展示我的新NFT收藏Blink', 'open', 3, 15, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 4)
ON DUPLICATE KEY UPDATE title=VALUES(title), category_id=VALUES(category_id), user_id=VALUES(user_id);

INSERT INTO `forum_posts` (`id`, `topic_id`, `user_id`, `parent_post_id`, `content`, `status`, `like_count`, `created_at`) VALUES
  (4, 4, 4, NULL, '刚刚创建了一个Blink，让大家可以轻松购买我的最新NFT收藏！快来看看吧！[链接]', 'visible', 15, DATE_SUB(NOW(), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE content=VALUES(content), user_id=VALUES(user_id);

DELETE FROM `forum_topic_tags` WHERE topic_id = 4; -- 清除旧标签关联 (此主题无标签)


-- --- 4. 模拟具体的回复记录 ---
-- (先删除旧的回复和点赞，避免重复插入导致数量错误)
DELETE FROM `forum_post_likes`; -- 删除所有的模拟点赞
DELETE FROM `forum_posts` WHERE id > 4; -- 删除模拟的回复

-- 更新初始帖子的 like_count 为 0，将由点赞记录和触发器更新
UPDATE `forum_posts` SET like_count = 0 WHERE id IN (1, 2, 3, 4);
-- 更新主题的 like_count 和 reply_count 为 0，将由帖子/点赞记录和触发器更新
UPDATE `forum_topics` SET like_count = 0, reply_count = 0 WHERE id IN (1, 2, 3, 4);

-- 模拟主题 1 的 12 条回复 (Post ID 5-16)
INSERT INTO `forum_posts` (`topic_id`, `user_id`, `parent_post_id`, `content`, `created_at`) VALUES
  (1, 2, 1, '回复主题1: 我通常对稳定币对使用 0.5%', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR), -- id=5
  (1, 3, 1, '回复主题1: 对于波动大的山寨币，我可能会用到 1% 甚至 2%', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 2 HOUR), -- id=6
  (1, 4, 5, '回复主题1: 同意楼上，看具体交易对', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 HOUR), -- id=7 (reply to 5)
  (1, 1, 1, '回复主题1: 感谢大家的建议！', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 4 HOUR), -- id=8
  (1, 2, 1, '回复主题1: 也要看当时的 Gas 费情况', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 5 HOUR), -- id=9
  (1, 3, 1, '回复主题1: 有没有人试过 Jupiter 的 API？', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 6 HOUR), -- id=10
  (1, 4, 10, '回复主题1: 正在研究中', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 7 HOUR), -- id=11 (reply to 10)
  (1, 1, 1, '回复主题1: Blink SDK v2 会更容易设置吗？', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR), -- id=12
  (1, 2, 12, '回复主题1: 理论上是的', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR), -- id=13 (reply to 12)
  (1, 3, 1, '回复主题1: 期待新版文档', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR), -- id=14
  (1, 4, 1, '回复主题1: +1', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR), -- id=15
  (1, 1, 1, '回复主题1: 看来社区很活跃', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 12 HOUR); -- id=16
-- 注意：上面插入帖子后，如果触发器启用，主题1的 reply_count 和 last_activity 会自动更新。
-- 手动更新最后活动时间（如果不用触发器或确保覆盖）
UPDATE `forum_topics` SET `last_activity_at` = DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 12 HOUR, `last_activity_user_id` = 1 WHERE `id` = 1;

-- 模拟主题 2 的 8 条回复 (Post ID 17-24)
INSERT INTO `forum_posts` (`topic_id`, `user_id`, `parent_post_id`, `content`, `created_at`) VALUES
  (2, 1, 2, '回复主题2: 太棒了！新功能有哪些亮点？', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 1 HOUR), -- id=17
  (2, 3, 2, '回复主题2: 性能提升具体体现在哪里？', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 2 HOUR), -- id=18
  (2, 4, 2, '回复主题2: 文档更新了吗？', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 3 HOUR), -- id=19
  (2, 2, 17, '回复主题2: 稍后会发布详细的更新日志和文档链接', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 4 HOUR), -- id=20 (reply to 17)
  (2, 1, 2, '回复主题2: 期待！', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 5 HOUR), -- id=21
  (2, 3, 2, '回复主题2: 辛苦了！', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 6 HOUR), -- id=22
  (2, 4, 2, '回复主题2: 感谢团队！', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 7 HOUR), -- id=23
  (2, 1, 2, '回复主题2: Solana 生态越来越好了', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR); -- id=24
-- 更新主题2的最后活动时间
UPDATE `forum_topics` SET `last_activity_at` = DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR, `last_activity_user_id` = 1 WHERE `id` = 2;

-- 模拟主题 3 的 5 条回复 (Post ID 25-29)
INSERT INTO `forum_posts` (`topic_id`, `user_id`, `parent_post_id`, `content`, `created_at`) VALUES
  (3, 1, 3, '回复主题3: 检查下你的依赖版本是否兼容？', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 1 HOUR), -- id=25
  (3, 2, 3, '回复主题3: 看看 Github 上的 issue，可能有人遇到过', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 2 HOUR), -- id=26
  (3, 4, 3, '回复主题3: 贴一下具体的错误信息？', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 3 HOUR), -- id=27
  (3, 3, 27, '回复主题3: 好的，我检查下版本再贴错误日志', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 4 HOUR), -- id=28 (reply to 27)
  (3, 1, 3, '回复主题3: 等你消息', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 5 HOUR); -- id=29
-- 更新主题3的最后活动时间
UPDATE `forum_topics` SET `last_activity_at` = DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 5 HOUR, `last_activity_user_id` = 1 WHERE `id` = 3;

-- 模拟主题 4 的 3 条回复 (Post ID 30-32)
INSERT INTO `forum_posts` (`topic_id`, `user_id`, `parent_post_id`, `content`, `created_at`) VALUES
  (4, 1, 4, '回复主题4: 看起来很酷！', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 1 HOUR), -- id=30
  (4, 2, 4, '回复主题4: 链接有效，交易很顺畅！', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 HOUR), -- id=31
  (4, 3, 30, '回复主题4: 艺术风格不错', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 3 HOUR); -- id=32 (reply to 30)
-- 更新主题4的最后活动时间
UPDATE `forum_topics` SET `last_activity_at` = DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 3 HOUR, `last_activity_user_id` = 3 WHERE `id` = 4;


-- --- 5. 模拟具体的点赞记录 (唯一性由主键保证) ---
-- (假设 Post IDs 1-4 是初始帖子, 5-16 是主题1的回复, 17-24 主题2回复, etc.)

-- 模拟帖子 1 (主题1初始帖) 的点赞 (例如: 4个独立用户点赞)
INSERT INTO `forum_post_likes` (`user_id`, `post_id`) VALUES
  (1, 1), (2, 1), (3, 1), (4, 1)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id); -- 避免重复插入错误

-- 模拟帖子 2 (主题2初始帖) 的点赞 (例如: 3个用户)
INSERT INTO `forum_post_likes` (`user_id`, `post_id`) VALUES
  (1, 2), (3, 2), (4, 2)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

-- 模拟帖子 3 (主题3初始帖) 的点赞 (例如: 2个用户)
INSERT INTO `forum_post_likes` (`user_id`, `post_id`) VALUES
  (1, 3), (4, 3)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

-- 模拟帖子 4 (主题4初始帖) 的点赞 (例如: 5个用户)
INSERT INTO `forum_post_likes` (`user_id`, `post_id`) VALUES
  (1, 4), (2, 4), (3, 4), (4, 4), (1, 4) -- 注意：最后一个(1,4)会因为主键冲突被忽略或更新 (根据 ON DUPLICATE KEY)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
-- 实际上只有 4 个唯一用户点赞

-- 模拟回复的点赞
-- 帖子 5 (主题1回复) 被 2 人点赞
INSERT INTO `forum_post_likes` (`user_id`, `post_id`) VALUES
  (1, 5), (4, 5)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
-- 帖子 6 (主题1回复) 被 3 人点赞
INSERT INTO `forum_post_likes` (`user_id`, `post_id`) VALUES
  (1, 6), (2, 6), (4, 6)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
-- 帖子 17 (主题2回复) 被 1 人点赞
INSERT INTO `forum_post_likes` (`user_id`, `post_id`) VALUES
  (2, 17)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
-- 帖子 25 (主题3回复) 被 1 人点赞
INSERT INTO `forum_post_likes` (`user_id`, `post_id`) VALUES
  (3, 25)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

-- --- 6. 手动更新统计数据 (如果未使用或信任触发器) ---
-- 注意：如果触发器已正确配置并运行，以下 UPDATE 语句可能不是必需的，
-- 但为了确保数据一致性或在无触发器环境下运行，可以执行它们。

-- 更新所有帖子的 like_count
UPDATE forum_posts fp
SET like_count = (SELECT COUNT(*) FROM forum_post_likes WHERE post_id = fp.id);

-- 更新所有主题的 reply_count (parent_post_id IS NOT NULL)
UPDATE forum_topics ft
SET reply_count = (SELECT COUNT(*) FROM forum_posts WHERE topic_id = ft.id AND parent_post_id IS NOT NULL);

-- 更新所有主题的 like_count (基于其初始帖子的点赞数)
UPDATE forum_topics ft
JOIN forum_posts fp ON ft.id = fp.topic_id AND fp.parent_post_id IS NULL
SET ft.like_count = fp.like_count;


-- --- 结束 示例数据插入 ---
