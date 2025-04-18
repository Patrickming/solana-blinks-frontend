import { NextResponse } from 'next/server';
const User = require('../../../../../lib/models/User'); // Adjusted path
const logger = require('../../../../../lib/backend-utils/logger'); // Adjusted path
const { authenticateRequest } = require('../../../../../lib/authUtils'); // Adjusted path

/**
 * @desc    为现有用户关联钱包地址
 * @route   POST /api/users/profile/wallet
 * @access  Private
 */
export async function POST(request) {
  let userId;
  try {
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    const body = await request.json();
    const { walletAddress } = body;

    logger.info('开始处理用户关联钱包地址请求', { userId, username: authenticatedUser.username, walletAddress });

    // Input validation
    if (!walletAddress) {
      logger.warn('关联钱包失败：缺少钱包地址', { userId });
      return NextResponse.json({ message: '钱包地址是必需的' }, { status: 400 });
    }

    // Connect wallet address using User model
    // Assuming User model has a static connectWalletAddress method that handles checks
    let updatedUser;
    try {
        updatedUser = await User.connectWalletAddress(userId, walletAddress);
    } catch (modelError) {
        // Handle specific error for wallet already connected to another account
        if (modelError.message === '该钱包地址已被其他账户绑定') {
            logger.warn('关联钱包失败：' + modelError.message, { userId, walletAddress });
            return NextResponse.json({ message: modelError.message }, { status: 400 });
        }
        // Re-throw other model errors
        throw modelError;
    }

    logger.info('用户钱包地址关联成功', { userId, walletAddress });
    // Return updated user profile (without password)
    const { password, ...responseUser } = updatedUser;
    return NextResponse.json(responseUser, { status: 200 });

  } catch (error) {
    logger.error('关联用户钱包地址过程中发生错误', { userId, error: error.message });
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    // Check if the User model supports .connectWalletAddress()
    if (error instanceof TypeError && error.message.includes('User.connectWalletAddress is not a function')) {
        logger.error('User model does not have a connectWalletAddress method', { userId });
        return NextResponse.json({ message: '服务器配置错误，无法关联钱包' }, { status: 500 });
    }
    // Handle specific model errors re-thrown from the inner catch
    if (error.message === '该钱包地址已被其他账户绑定') {
        // This case should technically be caught by the inner try-catch, but as a fallback:
         return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
} 