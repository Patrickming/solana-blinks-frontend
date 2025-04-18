import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises'; // Import mkdir
import path from 'path'; // Example: Using Node.js path
const User = require('../../../../lib/models/User'); // Updated path
const logger = require('../../../../lib/backend-utils/logger'); // Updated path
const { authenticateRequest } = require('../../../../lib/authUtils'); // Updated path

// --- Placeholder for actual file upload logic ---
// Replace this with your actual upload logic (e.g., to S3, Cloudinary, etc.)
async function uploadFileAndGetURL(file) {
  // Example: Saving locally (requires write access in deployment)
  // **WARNING:** This is a basic example and might not be suitable for production.
  // Consider security, scaling, and persistence needs.
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename (e.g., using timestamp or UUID)
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    // Define the path. Ensure the directory exists and is writable.
    // IMPORTANT: In serverless environments (like Vercel), the filesystem is often ephemeral.
    // Saving to `/tmp` might work short-term, but external storage is recommended.
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    const filePath = path.join(uploadDir, filename);

    // Ensure the upload directory exists
    try {
        await mkdir(uploadDir, { recursive: true });
        logger.info('Upload directory ensured:', { uploadDir });
    } catch (mkdirError) {
        // Log the specific mkdir error but throw the general upload error
        logger.error('Failed to create upload directory', { uploadDir, error: mkdirError.message });
        throw new Error('文件上传目录创建失败'); 
    }

    await writeFile(filePath, buffer);
    logger.info('头像文件已保存到本地', { filePath });

    // Return the public URL to access the file
    // This assumes your 'public/uploads/avatars' is served statically.
    const publicUrl = `/uploads/avatars/${filename}`;
    return publicUrl;

  } catch (error) {
    // Log specific error before throwing generic one
    if (error.message !== '文件上传目录创建失败') {
         logger.error('本地文件上传/写入失败', { error: error.message, stack: error.stack });
    }
    throw new Error('文件上传处理失败'); // Keep this general error for the client
  }
}
// --- End Placeholder ---

/**
 * @desc    上传用户头像
 * @route   POST /api/users/avatar
 * @access  Private
 */
export async function POST(request) {
  let userId;
  try {
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;
    logger.info('开始处理用户头像上传请求', { userId, username: authenticatedUser.username });

    const formData = await request.formData();
    const file = formData.get('avatar'); // Assuming the file input name is 'avatar'

    if (!file || typeof file === 'string') {
      logger.warn('头像上传失败：未找到文件或无效的文件字段', { userId });
      return NextResponse.json({ message: '缺少头像文件' }, { status: 400 });
    }
    
    // Check file type and size if necessary
    if (!file.type.startsWith('image/')) {
         logger.warn('头像上传失败：文件类型不是图片', { userId, fileType: file.type });
         return NextResponse.json({ message: '仅支持上传图片文件' }, { status: 400 });
    }
    // Add size check example: limit to 5MB
    if (file.size > 5 * 1024 * 1024) { 
         logger.warn('头像上传失败：文件过大', { userId, fileSize: file.size });
         return NextResponse.json({ message: '文件大小不能超过 5MB' }, { status: 400 });
    }

    // --- Process the file upload ---
    // Replace the placeholder function call with your actual upload logic
    const avatarUrl = await uploadFileAndGetURL(file);
    // --- End file processing ---

    if (!avatarUrl) {
      // Should be caught by the uploadFileAndGetURL function, but double-check
      logger.error('头像上传失败：未能获取头像 URL', { userId });
      return NextResponse.json({ message: '文件上传失败，无法获取 URL' }, { status: 500 });
    }

    // Update user profile with the new avatar URL
    // Assuming User model has a static updateAvatar method
    const updatedUser = await User.updateAvatar(userId, avatarUrl);

    if (updatedUser) {
      logger.info('用户头像更新成功', { userId, avatarUrl });
      // Return the updated user profile (or just the avatar URL)
      const { password, ...responseUser } = updatedUser;
      return NextResponse.json(responseUser, { status: 200 });
    } else {
      logger.error('头像上传后数据库更新失败', { userId, avatarUrl });
      return NextResponse.json({ message: '头像 URL 更新失败' }, { status: 500 });
    }

  } catch (error) {
    logger.error('上传用户头像过程中发生错误', { userId, error: error.message, stack: error.stack });
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
     // Check if the User model supports .updateAvatar()
    if (error instanceof TypeError && error.message.includes('User.updateAvatar is not a function')) {
        logger.error('User model does not have an updateAvatar method', { userId });
        return NextResponse.json({ message: '服务器配置错误，无法更新头像' }, { status: 500 });
    }
    // Catch potential file processing errors from uploadFileAndGetURL
     if (error.message === '文件上传处理失败' || error.message === '文件上传目录创建失败') {
       return NextResponse.json({ message: error.message }, { status: 500 });
     }
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
} 