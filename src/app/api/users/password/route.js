import { NextResponse } from 'next/server';
const User = require('../../../../lib/models/User'); // Updated path
const logger = require('../../../../lib/backend-utils/logger'); // Updated path
const { authenticateRequest } = require('../../../../lib/authUtils'); // Updated path
const bcrypt = require('bcryptjs');

/**
 * @desc    更新用户密码 (无需当前密码)
 * @route   PUT /api/users/password
 * @access  Private
 */
export async function PUT(request) {
  let userId;
  try {
    const authenticatedUser = await authenticateRequest(request); // Authenticate first
    userId = authenticatedUser.id;
    const body = await request.json();
    // Only expect newPassword and confirmPassword
    const { newPassword, confirmPassword } = body; 

    logger.info('开始处理用户密码更新请求 (无需当前密码)', { userId, username: authenticatedUser.username });

    // Input validation for new password fields
    if (!newPassword || !confirmPassword) {
      logger.warn('密码更新失败：缺少新密码或确认密码字段', { userId });
      // Changed message slightly for clarity
      return NextResponse.json({ message: '新密码和确认密码字段都是必需的' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      logger.warn('密码更新失败：新密码不匹配', { userId });
      return NextResponse.json({ message: '新密码和确认密码不匹配' }, { status: 400 });
    }

    // --- Removed current password verification ---
    // No need to fetch user by email or compare current password

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Salt rounds = 10

    // Update password in the database
    // Assuming User model has a static updatePassword method
    const updated = await User.updatePassword(userId, hashedNewPassword);

    if (updated) {
      logger.info('用户密码更新成功', { userId });
      return NextResponse.json({ message: '密码更新成功' }, { status: 200 });
    } else {
      // This might indicate an issue with the update method or concurrency
      logger.error('密码更新失败：数据库更新未成功', { userId });
      return NextResponse.json({ message: '密码更新失败，请稍后再试' }, { status: 500 });
    }

  } catch (error) {
    // Keep existing error handling
    logger.error('更新用户密码过程中发生错误', { userId, error: error.message, stack: error.stack });
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
     // Check if the User model supports .updatePassword()
    if (error instanceof TypeError && error.message.includes('User.updatePassword is not a function')) {
        logger.error('User model does not have an updatePassword method', { userId });
        return NextResponse.json({ message: '服务器配置错误，无法更新密码' }, { status: 500 });
    }
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
} 