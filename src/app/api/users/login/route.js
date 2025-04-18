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
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('JWT_SECRET is not defined in environment variables.');
    throw new Error('JWT secret key is missing.');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  });
};

/**
 * @desc    用户登录
 * @route   POST /api/users/login
 * @access  Public
 */
export async function POST(request) {
  try {
    const body = await request.json();
    logger.info('开始处理用户登录请求', { email: body.email });
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      logger.warn('登录失败：缺少必要字段', { email });
      return NextResponse.json({ message: '请提供邮箱和密码' }, { status: 400 });
    }

    // Find user
    const user = await User.findByEmail(email);

    if (!user) {
      logger.warn('登录失败：用户不存在', { email });
      return NextResponse.json({ message: '邮箱或密码不正确' }, { status: 401 });
    }

    // Verify password
    const isMatch = await User.verifyPassword(password, user.password);

    if (isMatch) {
      logger.info('用户登录成功', { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        hasWallet: !!user.wallet_address
      });

      // Prepare response
      const response = {
        id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id)
      };

      // Include wallet address if exists
      if (user.wallet_address) {
        response.walletAddress = user.wallet_address;
        logger.info('用户已关联钱包地址，已包含在响应中', { 
          userId: user.id, 
          walletAddress: user.wallet_address 
        });
      }

      return NextResponse.json(response, { status: 200 });
    } else {
      logger.warn('登录失败：密码不正确', { email });
      return NextResponse.json({ message: '邮箱或密码不正确' }, { status: 401 });
    }
  } catch (error) {
    logger.error('登录过程中发生错误', error);
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
} 