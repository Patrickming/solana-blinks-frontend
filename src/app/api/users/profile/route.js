import { NextResponse } from 'next/server';
const User = require('../../../../lib/models/User'); // Updated path
const logger = require('../../../../lib/backend-utils/logger'); // Updated path
const { authenticateRequest } = require('../../../../lib/authUtils'); // Updated path
const jwt = require('jsonwebtoken'); // Needed for generateToken on profile update

// Re-define or import generateToken if needed for profile updates
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
 * @desc    获取用户个人资料
 * @route   GET /api/users/profile
 * @access  Private
 */
export async function GET(request) {
  try {
    const user = await authenticateRequest(request);
    // User is authenticated, user object (without password) is returned by authenticateRequest
    logger.info('成功获取用户个人资料', { userId: user.id, username: user.username });
    
    // We already have the user object from authentication, just return it
    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    logger.error('获取用户个人资料失败', { error: error.message });
    // Return appropriate status code based on the error
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    } 
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * @desc    更新用户个人资料
 * @route   PUT /api/users/profile
 * @access  Private
 */
export async function PUT(request) {
  let userId; // Define userId here to use in catch block if authentication fails early
  try {
    const authenticatedUser = await authenticateRequest(request); // Authenticate and get user
    userId = authenticatedUser.id; // Assign userId after successful authentication
    const body = await request.json();

    logger.info('开始处理用户资料更新请求', { 
      userId,
      username: authenticatedUser.username, 
      requestBody: body 
    });

    // Extract fields to update from body
    const {
      username,
      email,
      phone,
      qq,
      region,
      techStack,
      bio,
      github,
      twitter,
      website,
      // Note: avatar is handled by a separate endpoint
    } = body;

    // Prepare update data, using existing values if not provided in the request
    const updateData = {
      username: username !== undefined ? username : authenticatedUser.username,
      email: email !== undefined ? email : authenticatedUser.email,
      phone: phone !== undefined ? phone : authenticatedUser.phone,
      qq: qq !== undefined ? qq : authenticatedUser.qq,
      region: region !== undefined ? region : authenticatedUser.region,
      techStack: techStack !== undefined ? techStack : authenticatedUser.tech_stack, // Ensure correct field name
      bio: bio !== undefined ? bio : authenticatedUser.bio,
      github: github !== undefined ? github : authenticatedUser.github,
      twitter: twitter !== undefined ? twitter : authenticatedUser.twitter,
      website: website !== undefined ? website : authenticatedUser.website,
      // Avatar is NOT updated here
    };

    // Perform the update using User model
    // Wrap the model call in try-catch to handle specific model errors like unique constraints
    let updatedUser;
    try {
         updatedUser = await User.update(userId, updateData);
    } catch (modelError) {
        if (modelError.message === '该用户名已被使用' || modelError.message === '该邮箱已被使用') {
            logger.warn('更新个人资料失败：' + modelError.message, { userId, username: body.username, email: body.email });
            return NextResponse.json({ message: modelError.message }, { status: 400 });
        }
        // Re-throw other model errors
        throw modelError;
    }
   

    logger.info('用户资料更新成功', { 
      userId: updatedUser.id, 
      username: updatedUser.username,
      email: updatedUser.email,
      updatedFields: Object.keys(body) // Log fields present in the request body
    });

    // Check if username or email was updated to potentially issue a new token
    let newToken = null;
    if ((updateData.username && updateData.username !== authenticatedUser.username) || 
        (updateData.email && updateData.email !== authenticatedUser.email)) {
      newToken = generateToken(userId);
      logger.info('用户名或邮箱更新，生成新令牌');
    }

    // Prepare the response object (excluding password)
    const { password, ...responseUser } = updatedUser;
    const response = { ...responseUser };

    // If a new token was generated, add it to the response
    if (newToken) {
      response.token = newToken;
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    logger.error('更新用户个人资料失败', { userId, error: error.message });
    // Handle authentication errors
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    // Handle other errors (e.g., JSON parsing, unexpected model errors)
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * @desc    删除用户账户
 * @route   DELETE /api/users/profile
 * @access  Private
 */
export async function DELETE(request) {
  let userId;
  try {
    const authenticatedUser = await authenticateRequest(request);
    userId = authenticatedUser.id;

    logger.info('开始处理用户账户删除请求', { userId, username: authenticatedUser.username });

    // Perform the deletion using User model
    const deleted = await User.delete(userId); // Assuming User model has a static delete method

    if (deleted) {
      logger.info('用户账户删除成功', { userId });
      // Typically, you don't send a body back for a DELETE request, just a status code.
      return NextResponse.json({ message: '账户删除成功' }, { status: 200 }); // Or status 204 (No Content)
    } else {
      // This might happen if the user was deleted between authentication and deletion, though unlikely.
      logger.warn('删除用户账户失败：用户在删除操作前已不存在', { userId });
      return NextResponse.json({ message: '删除失败，用户不存在' }, { status: 404 });
    }

  } catch (error) {
    logger.error('删除用户账户失败', { userId, error: error.message });
    if (error.message.startsWith('未授权')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    // Check if the User model supports .delete() or if we need to call a different method
    if (error instanceof TypeError && error.message.includes('User.delete is not a function')) {
        logger.error('User model does not have a delete method', { userId });
        return NextResponse.json({ message: '服务器配置错误，无法删除用户' }, { status: 500 });
    }
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}

// Note: DELETE /api/users/profile should be in a separate handler or file if preferred,
// but can also be added here as export async function DELETE(request) { ... } 