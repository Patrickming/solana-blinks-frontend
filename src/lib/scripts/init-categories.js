/**
 * 初始化论坛分类数据
 * 运行方式: node src/lib/scripts/init-categories.js (路径已更新)
 */
require('dotenv').config({ path: '../../.env.local' }); // 指向根目录的 .env.local
const { pool } = require('../config/database'); // 更新路径

async function initializeCategories() {
  try {
    console.log('开始初始化论坛分类数据...');
    
    // 假设分类表名为 forum_categories (根据 forum.sql)
    const [existing] = await pool.execute('SELECT COUNT(*) as count FROM forum_categories');
    
    if (existing[0].count > 0) {
      console.log(`数据库中已有 ${existing[0].count} 个分类，跳过初始化。`);
      return;
    }
    
    // 默认分类数据 (匹配 forum.sql 和 forum_sample.sql)
    const categories = [
      { name: '讨论区', slug: 'discussion', description: '关于 Solana Blinks 的一般性讨论' },
      { name: '帮助与支持', slug: 'help', description: '获取使用 Blinks 或平台的帮助' },
      { name: '案例展示', slug: 'showcase', description: '展示您用 Blinks 构建的项目' },
      { name: '官方公告', slug: 'announcement', description: '来自团队的官方公告' },
      { name: '反馈建议', slug: 'feedback', description: '提供反馈和建议' },
    ];
    
    // 插入分类数据
    const insertPromises = categories.map(category => {
      return pool.execute(
        'INSERT INTO forum_categories (name, slug, description) VALUES (?, ?, ?)',
        [category.name, category.slug, category.description]
      );
    });
    
    await Promise.all(insertPromises);
    
    console.log(`成功初始化 ${categories.length} 个论坛分类。`);
    
    // 检查是否成功插入
    const [result] = await pool.execute('SELECT * FROM forum_categories ORDER BY id');
    
    console.log('已创建的分类:');
    result.forEach(category => {
      console.log(`ID: ${category.id}, 名称: ${category.name}, Slug: ${category.slug}`);
    });
    
  } catch (error) {
    console.error('初始化分类数据失败:', error);
  } finally {
    // 关闭连接池
    if (pool) {
        await pool.end();
        console.log('数据库连接池已关闭。');
    }
  }
}

// 执行初始化
initializeCategories(); 