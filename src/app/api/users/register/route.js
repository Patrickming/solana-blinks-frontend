import { NextResponse } from 'next/server';
const User = require('../../../../lib/models/User'); // Updated path
const logger = require('../../../../lib/backend-utils/logger'); // Updated path
const jwt = require('jsonwebtoken');

/**
 * 生成JWT令牌
 * @param {string} id - 用户ID
 * @returns {string} 生成的JWT令牌
 */
const generateToken = (id) => {
  // Ensure JWT_SECRET is loaded from environment variables
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('JWT_SECRET is not defined in environment variables.');
    throw new Error('JWT secret key is missing.');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d' // Consider making this configurable
  });
};

/**
 * @desc    注册新用户
 * @route   POST /api/users/register
 * @access  Public
 */
export async function POST(request) {
  try {
    const body = await request.json();
    logger.info('开始处理用户注册请求', { requestBody: body });
    const { username, email, password, confirmPassword } = body;

    // Input validation
    if (!username || !email || !password || !confirmPassword) {
      logger.warn('注册失败：缺少必要字段', { username, email });
      return NextResponse.json({ message: '所有字段都是必需的' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      logger.warn('注册失败：密码不匹配', { username, email });
      return NextResponse.json({ message: '密码和确认密码不匹配' }, { status: 400 });
    }

    // Check if user exists
    const existingEmailUser = await User.findByEmail(email);
    const existingUsernameUser = await User.findByUsername(username);

    if (existingEmailUser || existingUsernameUser) {
      logger.warn('注册失败：用户已存在', { username, email });
      return NextResponse.json({ message: '用户已存在' }, { status: 400 });
    }

    // Create new user
    const userData = {
      username,
      email,
      password, // User model handles hashing
      phone: '',
      qq: '',
      region: '',
      techStack: '',
      bio: '',
      github: '',
      twitter: '',
      website: ''
      // walletAddress will be added later if needed
    };

    const user = await User.create(userData);

    if (user) {
      logger.info('用户注册成功', { 
        userId: user.id, 
        username: user.username,
        email: user.email
      });
      // Return user info and token
      return NextResponse.json({
        id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id)
      }, { status: 201 });
    } else {
      // This case might be less likely if User.create throws on failure
      logger.warn('注册失败：无效的用户数据');
      return NextResponse.json({ message: '无效的用户数据' }, { status: 400 });
    }
  } catch (error) {
    logger.error('注册过程中发生错误', error);
    // Provide a generic error message to the client
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
} 