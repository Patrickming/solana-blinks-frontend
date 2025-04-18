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
 * @desc    通过钱包地址连接/注册
 * @route   POST /api/users/wallet
 * @access  Public
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress } = body;
    logger.info('开始处理钱包连接/注册请求', { walletAddress });

    if (!walletAddress) {
      logger.warn('钱包连接失败：缺少钱包地址');
      return NextResponse.json({ message: '钱包地址是必需的' }, { status: 400 });
    }

    // 查找用户
    let user = await User.findByWalletAddress(walletAddress);

    if (user) {
      // 用户已存在，直接登录
      logger.info('钱包地址对应的用户已存在，直接登录', { userId: user.id, walletAddress });
      return NextResponse.json({
        id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id),
        walletAddress: user.wallet_address
      }, { status: 200 });
    } else {
      // 用户不存在，创建新用户
      logger.info('钱包地址对应的用户不存在，创建新用户', { walletAddress });
      
      // 使用钱包地址作为临时用户名和邮箱的一部分
      // 实际应用中可能需要更完善的处理逻辑，例如引导用户完善信息
      const tempUsername = `user_${walletAddress.substring(0, 8)}`;
      const tempEmail = `${walletAddress.substring(0, 8)}@example.com`; // Placeholder email
      // 需要一个安全的默认密码或不同的注册流程
      const tempPassword = `defaultPassword_${Date.now()}`; // Insecure, example only!

      // 检查临时用户名/邮箱是否已被占用 (虽然概率低，但严谨起见)
      const existingTempUser = await User.findByUsername(tempUsername) || await User.findByEmail(tempEmail);
      if(existingTempUser) {
        logger.error('钱包注册失败：临时用户名或邮箱冲突', { walletAddress, tempUsername, tempEmail });
        return NextResponse.json({ message: '注册时发生冲突，请稍后再试' }, { status: 500 });
      }

      const userData = {
        username: tempUsername,
        email: tempEmail,
        password: tempPassword, // User model will hash this
        walletAddress: walletAddress,
        phone: '',
        qq: '',
        region: '',
        techStack: '',
        bio: '',
        github: '',
        twitter: '',
        website: ''
      };

      user = await User.create(userData);

      if (user) {
        logger.info('通过钱包地址创建并注册新用户成功', { 
          userId: user.id, 
          username: user.username,
          walletAddress: user.wallet_address 
        });
        return NextResponse.json({
          id: user.id,
          username: user.username,
          email: user.email, // Returning the temporary email
          token: generateToken(user.id),
          walletAddress: user.wallet_address
        }, { status: 201 });
      } else {
        logger.error('通过钱包地址创建用户失败', { walletAddress });
        return NextResponse.json({ message: '创建用户失败' }, { status: 500 });
      }
    }
  } catch (error) {
    logger.error('钱包连接/注册过程中发生错误', error);
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
} 