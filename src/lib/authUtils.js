const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Corrected path
const logger = require('./backend-utils/logger'); // Corrected path

/**
 * Authenticates a request by verifying the JWT token in the Authorization header.
 * @param {Request} request - The Next.js Request object.
 * @returns {Promise<object>} The authenticated user object (excluding password).
 * @throws {Error} If authentication fails (e.g., missing token, invalid token, user not found).
 */
const authenticateRequest = async (request) => {
  let token;
  const authHeader = request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    logger.warn('认证失败：缺少 Bearer token');
    throw new Error('未授权，缺少 token');
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not defined in environment variables.');
      throw new Error('JWT secret key is missing.');
    }

    // Verify token
    const decoded = jwt.verify(token, secret);

    // Get user from the token ID
    // Exclude password from the result
    const user = await User.findById(decoded.id);

    if (!user) {
      logger.warn('认证失败：Token 有效但用户未找到', { userId: decoded.id });
      throw new Error('未授权，用户不存在');
    }
    
    logger.info('用户认证成功', { userId: user.id, username: user.username });
    // Return user object (without password) so the handler can use it
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword; 

  } catch (error) {
    logger.error('认证失败：Token 无效或已过期', { error: error.message });
    if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('未授权，无效的 token');
    } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('未授权，token 已过期');
    }
    // Re-throw other errors (like missing secret or user not found)
    throw error;
  }
};

module.exports = { authenticateRequest }; 