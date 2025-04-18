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
  let walletAddress;
  try {
    const body = await request.json();
    walletAddress = body.walletAddress; // Assign here for use in catch block
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
      // Fallthrough to generate response
    } else {
      // 用户不存在，尝试创建新用户
      logger.info('钱包地址对应的用户不存在，尝试创建新用户', { walletAddress });
      
      const tempUsername = `user_${walletAddress.substring(0, 8)}`;
      const tempEmail = `${walletAddress.substring(0, 8)}@example.com`;
      const tempPassword = `defaultPassword_${Date.now()}`;

      // 检查临时用户名/邮箱是否已被占用 (初步检查)
      const existingTempUser = await User.findByUsername(tempUsername) || await User.findByEmail(tempEmail);
      if(existingTempUser) {
        logger.error('钱包注册失败：临时用户名或邮箱冲突 (初步检查)', { walletAddress, tempUsername, tempEmail });
        return NextResponse.json({ message: '注册时发生冲突，请稍后再试' }, { status: 500 });
      }

      const userData = {
        username: tempUsername,
        email: tempEmail,
        password: tempPassword,
        walletAddress: walletAddress,
        phone: '', qq: '', region: '', techStack: '', bio: '', github: '', twitter: '', website: ''
      };

      try {
        user = await User.create(userData);
        logger.info('通过钱包地址创建并注册新用户成功', { userId: user.id, username: user.username, walletAddress });
        // Set status to 201 for creation, then fallthrough to generate response
        return NextResponse.json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id),
            walletAddress: user.wallet_address
        }, { status: 201 });

      } catch (creationError) {
        // Handle potential race condition: check if it's a duplicate entry error
        // MySQL error code for duplicate entry is 1062
        if (creationError.code === 'ER_DUP_ENTRY' || (creationError.message && creationError.message.includes('Duplicate entry'))) {
          logger.warn('创建用户时捕获到重复条目错误，可能由并发请求引起。重新尝试查找用户。', { walletAddress, errorCode: creationError.code });
          // Attempt to find the user again, assuming another request created it.
          user = await User.findByWalletAddress(walletAddress);
          if (user) {
            logger.info('重新查找用户成功，按登录处理', { userId: user.id, walletAddress });
            // Fallthrough to generate response (user variable is now populated)
          } else {
            // If it was a duplicate error but we still can't find the user, something else is wrong.
            logger.error('创建用户时发生重复错误，但重新查找用户失败', { walletAddress, error: creationError });
            throw creationError; // Re-throw the original error
          }
        } else {
          // It wasn't a duplicate entry error, re-throw it.
          logger.error('通过钱包地址创建用户时发生非重复性错误', { walletAddress, error: creationError });
          throw creationError;
        }
      }
    }

    // --- Common Response Generation --- 
    // This block executes if:
    // 1. User was found initially
    // 2. User creation failed with duplicate error, but user was found on re-check
    if (user) {
       return NextResponse.json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id),
            walletAddress: user.wallet_address
        }, { status: 200 }); // Use 200 OK for login/successful find
    } else {
        // Should ideally not be reached if logic above is correct, but as a fallback
        logger.error('无法找到或创建用户，流程结束', { walletAddress });
        return NextResponse.json({ message: '无法处理请求' }, { status: 500 });
    }

  } catch (error) {
    // Log the error with walletAddress if available
    logger.error('钱包连接/注册过程中发生未捕获的错误', { walletAddress: walletAddress || 'N/A', error: error.message, stack: error.stack });
    // Avoid sending detailed internal errors to the client
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
} 