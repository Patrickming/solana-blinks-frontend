const mysql = require('mysql2/promise');
// require('dotenv').config(); // Removed: Next.js handles .env loading automatically
const logger = require('../backend-utils/logger'); // Corrected path

// 远程数据库配置
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  connectTimeout: 10000  // 增加连接超时时间
};

// 创建连接池
let pool;
try {
  pool = mysql.createPool(dbConfig);

  // 测试数据库连接
  (async () => {
    let connection;
    try {
      connection = await pool.getConnection();
      logger.info('MySQL连接成功');
    } catch (error) {
      logger.error('MySQL连接失败', error);
      logger.error('请检查数据库连接配置是否正确');
    } finally {
      if (connection) connection.release();
    }
  })();

  // 添加错误处理
  pool.on('error', (err) => {
    logger.error('MySQL连接池错误', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
      logger.info('MySQL连接中断，请检查网络状态和数据库服务');
    }
  });
} catch (error) {
    logger.error('创建MySQL连接池失败', error);
    pool = null; // Ensure pool is null if creation fails
}


// 提供获取数据库状态的方法
const getDatabaseStatus = () => {
  return {
    // Check pool existence and its config property before accessing nested properties
    connected: pool && pool.pool && pool.pool.config && pool.pool.config.connectionConfig ? true : false,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database
  };
};

module.exports = { 
  pool: pool, // Export the potentially null pool
  getDatabaseStatus 
}; 