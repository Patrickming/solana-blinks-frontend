/**
 * 用户模型
 * 定义用户数据结构和相关方法
 */
const { pool } = require('../config/database'); // Corrected path
const bcrypt = require('bcryptjs');
const logger = require('../backend-utils/logger'); // Corrected path

// 设置查询超时时间（毫秒）- 增加到15秒
const QUERY_TIMEOUT = 15000;

class User {
  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 新创建的用户
   */
  static async create(userData) {
    try {
      const { username, email, password, phone, qq, region, techStack, bio, github, twitter, website, avatar, walletAddress } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      logger.info('尝试创建新用户', { username, email, walletAddress });
      
      const [result] = await Promise.race([
        pool.execute(
          `INSERT INTO users 
           (username, email, password, phone, qq, region, tech_stack, bio, github, twitter, website, avatar, wallet_address, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [username, email, hashedPassword, phone, qq, region, techStack, bio, github, twitter, website, avatar || '', walletAddress || '']
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      logger.info('用户创建成功', { userId: result.insertId });
      return this.findById(result.insertId);
    } catch (error) {
      logger.error('创建用户失败', error);
      throw error;
    }
  }

  /**
   * 通过ID查找用户
   * @param {Number} id - 用户ID
   * @returns {Promise<Object|null>} 用户对象或null
   */
  static async findById(id) {
    try {
      logger.info('尝试通过ID查找用户', { userId: id });
      
      const [rows] = await Promise.race([
        pool.execute(
          'SELECT id, username, email, phone, qq, region, tech_stack, bio, github, twitter, website, avatar, wallet_address, created_at FROM users WHERE id = ?',
          [id]
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      if (rows.length === 0) {
        logger.info('未找到用户', { userId: id });
      } else {
        logger.info('成功找到用户', { userId: id });
      }
      
      return rows[0] || null;
    } catch (error) {
      logger.error('通过ID查找用户失败', { userId: id, error });
      throw error;
    }
  }

  /**
   * 通过邮箱查找用户
   * @param {String} email - 用户邮箱
   * @returns {Promise<Object|null>} 用户对象或null
   */
  static async findByEmail(email) {
    try {
      logger.info('尝试通过邮箱查找用户', { email });
      
      const [rows] = await Promise.race([
        pool.execute(
          'SELECT * FROM users WHERE email = ?',
          [email]
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      if (rows.length === 0) {
        logger.info('未找到邮箱对应的用户', { email });
      } else {
        logger.info('成功找到邮箱对应的用户', { email, userId: rows[0].id });
      }
      
      return rows[0] || null;
    } catch (error) {
      logger.error('通过邮箱查找用户失败', { email, error });
      throw error;
    }
  }

  /**
   * 通过用户名查找用户
   * @param {String} username - 用户名
   * @returns {Promise<Object|null>} 用户对象或null
   */
  static async findByUsername(username) {
    try {
      logger.info('尝试通过用户名查找用户', { username });
      
      const [rows] = await Promise.race([
        pool.execute(
          'SELECT id, username, email, phone, qq, region, tech_stack, bio, github, twitter, website, avatar, created_at FROM users WHERE username = ?',
          [username]
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      if (rows.length === 0) {
        logger.info('未找到用户名对应的用户', { username });
      } else {
        logger.info('成功找到用户名对应的用户', { username, userId: rows[0].id });
      }
      
      return rows[0] || null;
    } catch (error) {
      logger.error('通过用户名查找用户失败', { username, error });
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param {Number} id - 用户ID
   * @param {Object} updateData - 要更新的数据
   * @returns {Promise<Object>} 更新后的用户
   */
  static async update(id, updateData) {
    try {
      const { username, email, phone, qq, region, techStack, bio, github, twitter, website, avatar } = updateData;
      
      logger.info('尝试更新用户信息', { userId: id, updateFields: Object.keys(updateData) });
      
      // 如果更新用户名或邮箱，先检查是否已存在
      if (username || email) {
        // 检查用户名是否已被其他用户使用
        if (username) {
          const [usernameRows] = await Promise.race([
            pool.execute(
              'SELECT id FROM users WHERE username = ? AND id != ?',
              [username, id]
            ),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
            )
          ]);
          
          if (usernameRows.length > 0) {
            logger.warn('用户名已被使用', { username, userId: id });
            throw new Error('该用户名已被使用');
          }
        }
        
        // 检查邮箱是否已被其他用户使用
        if (email) {
          const [emailRows] = await Promise.race([
            pool.execute(
              'SELECT id FROM users WHERE email = ? AND id != ?',
              [email, id]
            ),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
            )
          ]);
          
          if (emailRows.length > 0) {
            logger.warn('邮箱已被使用', { email, userId: id });
            throw new Error('该邮箱已被使用');
          }
        }
      }
      
      await Promise.race([
        pool.execute(
          `UPDATE users 
           SET phone = ?, qq = ?, region = ?, tech_stack = ?, bio = ?, github = ?, 
               twitter = ?, website = ?
               ${avatar ? ', avatar = ?' : ''}
               ${username ? ', username = ?' : ''}
               ${email ? ', email = ?' : ''}
           WHERE id = ?`,
          [
            phone, qq, region, techStack, bio, github, twitter, website, 
            ...(avatar ? [avatar] : []),
            ...(username ? [username] : []),
            ...(email ? [email] : []),
            id
          ]
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      logger.info('用户信息更新成功', { userId: id });
      return this.findById(id);
    } catch (error) {
      logger.error('更新用户信息失败', { userId: id, error });
      throw error;
    }
  }

  /**
   * 更新用户头像
   * @param {Number} id - 用户ID
   * @param {String} avatarUrl - 头像URL
   * @returns {Promise<Object>} 更新后的用户
   */
  static async updateAvatar(id, avatarUrl) {
    try {
      logger.info('尝试更新用户头像', { userId: id, avatarUrl });
      
      await Promise.race([
        pool.execute(
          'UPDATE users SET avatar = ? WHERE id = ?',
          [avatarUrl, id]
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      logger.info('用户头像更新成功', { userId: id });
      return this.findById(id);
    } catch (error) {
      logger.error('更新用户头像失败', { userId: id, error });
      throw error;
    }
  }

  /**
   * 验证密码
   * @param {String} password - 用户输入的密码
   * @param {String} hashedPassword - 数据库中存储的哈希密码
   * @returns {Promise<Boolean>} 密码是否匹配
   */
  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('验证密码时出错', error);
      throw error; // 重新抛出错误，以便上层调用知道发生了问题
    }
  }
  
  /**
   * 通过钱包地址查找用户
   * @param {String} walletAddress - 钱包地址
   * @returns {Promise<Object|null>} 用户对象或null
   */
  static async findByWalletAddress(walletAddress) {
    if (!walletAddress) {
        logger.warn('尝试通过空的钱包地址查找用户');
        return null;
    }
    try {
      logger.info('尝试通过钱包地址查找用户', { walletAddress });
      
      const [rows] = await Promise.race([
        pool.execute(
          'SELECT * FROM users WHERE wallet_address = ?',
          [walletAddress]
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      if (rows.length === 0) {
        logger.info('未找到钱包地址对应的用户', { walletAddress });
      } else {
        logger.info('成功找到钱包地址对应的用户', { walletAddress, userId: rows[0].id });
      }
      
      return rows[0] || null;
    } catch (error) {
      logger.error('通过钱包地址查找用户失败', { walletAddress, error });
      throw error;
    }
  }

  /**
   * 将钱包地址连接到用户账户
   * @param {Number} id - 用户ID
   * @param {String} walletAddress - 钱包地址
   * @returns {Promise<Object>} 更新后的用户
   */
  static async connectWalletAddress(id, walletAddress) {
    if (!walletAddress) {
      throw new Error('钱包地址不能为空');
    }
    try {
      logger.info('尝试将钱包地址连接到用户账户', { userId: id, walletAddress });
      
      // 检查钱包地址是否已被其他用户使用
      const existingUser = await this.findByWalletAddress(walletAddress);
      if (existingUser && existingUser.id !== id) {
          logger.warn('尝试连接的钱包地址已被其他用户使用', { userId: id, walletAddress, existingUserId: existingUser.id });
          throw new Error('该钱包地址已被其他账户绑定');
      }

      await Promise.race([
        pool.execute(
          'UPDATE users SET wallet_address = ? WHERE id = ?',
          [walletAddress, id]
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      logger.info('钱包地址连接成功', { userId: id, walletAddress });
      return this.findById(id);
    } catch (error) {
      logger.error('连接钱包地址失败', { userId: id, walletAddress, error });
      throw error;
    }
  }

  /**
   * 更新用户密码
   * @param {Number} id - 用户ID
   * @param {String} hashedNewPassword - 已哈希的新密码
   * @returns {Promise<Boolean>} 是否更新成功
   */
  static async updatePassword(id, hashedNewPassword) {
    try {
      logger.info('尝试更新用户密码', { userId: id });
      
      const [result] = await Promise.race([
        pool.execute(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedNewPassword, id]
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      // Check if any row was actually updated
      if (result.affectedRows > 0) {
        logger.info('用户密码数据库更新成功', { userId: id });
        return true;
      } else {
        // This might happen if the ID doesn't exist, though unlikely if called after authentication
        logger.warn('更新用户密码时未找到匹配的用户ID', { userId: id });
        return false;
      }
    } catch (error) {
      logger.error('更新用户密码失败', { userId: id, error });
      throw error;
    }
  }

  /**
   * 删除用户账户
   * @param {Number} id - 用户ID
   * @returns {Promise<Boolean>} 是否删除成功
   */
  static async delete(id) {
    try {
      logger.info('尝试删除用户账户', { userId: id });
      
      const [result] = await Promise.race([
        pool.execute(
          'DELETE FROM users WHERE id = ?',
          [id]
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('数据库操作超时')), QUERY_TIMEOUT)
        )
      ]);
      
      // Check if any row was actually deleted
      if (result.affectedRows > 0) {
        logger.info('用户账户数据库删除成功', { userId: id });
        return true;
      } else {
        // User ID did not exist
        logger.warn('删除用户账户时未找到匹配的用户ID', { userId: id });
        return false;
      }
    } catch (error) {
      logger.error('删除用户账户失败', { userId: id, error });
      // Consider specific error handling, e.g., foreign key constraints
      throw error;
    }
  }
}

module.exports = User; 