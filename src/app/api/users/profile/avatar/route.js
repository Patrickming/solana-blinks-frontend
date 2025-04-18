import { NextResponse } from 'next/server';
const User = require('../../../../../lib/models/User'); // Adjusted path
const logger = require('../../../../../lib/backend-utils/logger'); // Adjusted path
const { authenticateRequest } = require('../../../../../lib/authUtils'); // Adjusted path
// Potentially import file deletion logic if needed (e.g., from fs/promises or cloud storage SDK)
// import { unlink } from 'fs/promises'; 
// import path from 'path';

/**
 * @desc    删除用户头像
 * @route   DELETE /api/users/profile/avatar
 * @access  Private
 */
export async function DELETE(request) {
  let userId;
  try {
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('开始处理用户头像删除请求', { userId, username: authenticatedUser.username });

    // --- Optional: Delete old avatar file from storage ---
    // if (authenticatedUser.avatar) {
    //   try {
    //     // Construct the path or key for the old avatar based on its URL
    //     const oldAvatarPathOrKey = path.join(process.cwd(), 'public', authenticatedUser.avatar); 
    //     // OR: Logic to get key/path for cloud storage
    //     
    //     // Call the appropriate deletion function (local or cloud)
    //     // await unlink(oldAvatarPathOrKey); // Example for local file
    //     // OR: await deleteFromCloudStorage(oldAvatarKey);
    //     logger.info('旧头像文件删除成功', { userId, avatar: authenticatedUser.avatar });
    //   } catch (fileDeleteError) {
    //     // Log the error but potentially continue with DB update
    //     logger.error('删除旧头像文件失败', { userId, avatar: authenticatedUser.avatar, error: fileDeleteError.message });
    //   }
    // }
    // --- End Optional File Deletion ---

    // Update the user's avatar URL in the database to null or empty string
    // Assuming User.updateAvatar can handle null/empty string to signify deletion
    const updatedUser = await User.updateAvatar(userId, ''); // Set to empty string or null

    if (updatedUser) {
      logger.info('用户头像数据库记录更新成功（已删除）', { userId });
      // Return updated user profile (without password)
      const { password, ...responseUser } = updatedUser;
      return NextResponse.json(responseUser, { status: 200 });
    } else {
      // Should not happen if updateAvatar doesn't throw, but handle just in case
      logger.error('删除头像时数据库更新失败', { userId });
      return NextResponse.json({ message: '头像删除失败' }, { status: 500 });
    }

  } catch (error) {
    logger.error('删除用户头像过程中发生错误', { userId, error: error.message });
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    // Check if the User model supports .updateAvatar()
    if (error instanceof TypeError && error.message.includes('User.updateAvatar is not a function')) {
        logger.error('User model does not have an updateAvatar method', { userId });
        return NextResponse.json({ message: '服务器配置错误，无法删除头像' }, { status: 500 });
    }
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
} 