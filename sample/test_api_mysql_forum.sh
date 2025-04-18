#!/bin/bash

# 测试论坛功能API
# 此脚本测试论坛话题和帖子的创建、获取、回复、点赞和标签管理功能

# 设置基础URL (请根据实际情况修改)
BASE_URL="https://dkynujeaxjjr.sealoshzh.site" 

# 设置超时时间（秒）
CURL_TIMEOUT=15

# 颜色定义
GREEN="\\033[0;32m"
RED="\\033[0;31m"
YELLOW="\\033[0;33m"
BLUE="\\033[0;34m"
NC="\\033[0m" # 无颜色

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  论坛功能API测试                             ${NC}"
echo -e "${BLUE}===============================================${NC}"

# --- 1. 准备测试环境 ---
echo -e "${BLUE}▶ 1. 准备测试环境${NC}"
echo -e "  注册测试用户..."

# 生成唯一用户名和邮箱
TIMESTAMP=$(date +%s)
TEST_USERNAME="testuser_forum_${TIMESTAMP}"
TEST_EMAIL="test_forum_${TIMESTAMP}@example.com"

# (复用注册逻辑，与头像测试脚本类似)
REGISTER_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X POST "$BASE_URL/api/users/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "'$TEST_USERNAME'",
    "email": "'$TEST_EMAIL'",
    "password": "password123",
    "confirmPassword": "password123"
  }')

echo "  注册响应: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d '"' -f 4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":[0-9]*' | cut -d ':' -f 2)

if [ -z "$TOKEN" ] || [ -z "$USER_ID" ]; then
  echo -e "${RED}✗ 无法获取令牌或用户ID，测试中止${NC}"
  exit 1
fi
echo -e "${GREEN}✓ 注册成功 (用户ID: $USER_ID)${NC}"
echo -e "${BLUE}===============================================${NC}"

# --- 2. 测试创建新话题 ---
echo -e "${BLUE}▶ 2. 测试创建新话题${NC}"
TEST_TOPIC_TITLE="测试话题标题 ${TIMESTAMP}"
TEST_TOPIC_CONTENT="这是测试话题的详细内容，支持Markdown。 *强调* `代码`"
TEST_CATEGORY_ID=1 # 假设分类ID 1 (讨论区) 存在

echo "  发送创建话题请求..."
echo -e "  发送请求: POST $BASE_URL/api/forum/topics"
# 预期响应：
# 状态码：201
# {
#   "id": 新话题ID,
#   "title": "测试话题标题 xxx",
#   "userId": 用户ID,
#   "categoryId": 1,
#   "initialPost": { "id": 初始帖子ID, "content": "...", "likeCount": 0 },
#   "replyCount": 0,
#   "likeCount": 0, // 主题的初始帖子点赞数
#   "tags": [],
#   ...
# }
CREATE_TOPIC_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X POST "$BASE_URL/api/forum/topics" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "'"$TEST_TOPIC_TITLE"'",
    "content": "'"$TEST_TOPIC_CONTENT"'",
    "categoryId": '$TEST_CATEGORY_ID'
  }')

echo "  创建话题响应: $CREATE_TOPIC_RESPONSE"

TOPIC_ID=$(echo $CREATE_TOPIC_RESPONSE | grep -o '"id":[0-9]*' | head -n 1 | cut -d ':' -f 2) # 获取话题ID
INITIAL_POST_ID=$(echo $CREATE_TOPIC_RESPONSE | grep -o '"initialPost":{"id":[0-9]*' | grep -o '[0-9]*$') # 获取初始帖子ID

if [ -z "$TOPIC_ID" ] || [ -z "$INITIAL_POST_ID" ]; then
  echo -e "${RED}✗ 测试失败: 未能从响应中提取新话题ID或初始帖子ID${NC}"
  echo -e "${YELLOW}  预期: 响应包含 'id' 和 'initialPost.id'${NC}"
  echo -e "${YELLOW}  实际: $CREATE_TOPIC_RESPONSE${NC}"
else
  echo -e "${GREEN}✓ 测试通过: 成功创建新话题 (话题ID: $TOPIC_ID, 初始帖子ID: $INITIAL_POST_ID)${NC}"
fi
echo -e "${BLUE}===============================================${NC}"

# --- 3. 测试获取话题列表 ---
echo -e "${BLUE}▶ 3. 测试获取话题列表${NC}"
echo "  发送获取话题列表请求 (应包含刚创建的话题)..."
echo -e "  发送请求: GET $BASE_URL/api/forum/topics"
# 预期响应：
# 状态码：200
# [
#   { "id": xxx, "title": "...", "author": {"username": "..."}, "category": {"name": "..."}, "replyCount": y, "likeCount": z, "tags": [...] },
#   ...
# ]
LIST_TOPICS_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X GET "$BASE_URL/api/forum/topics" \\
  -H "Authorization: Bearer $TOKEN") # 假设列表也需要认证，如果不需要可移除

# 检查列表响应中是否包含新创建的话题ID
LIST_CHECK=$(echo $LIST_TOPICS_RESPONSE | grep -o "\"id\":$TOPIC_ID")

if [ ! -z "$LIST_CHECK" ]; then
  echo -e "${GREEN}✓ 测试通过: 话题列表响应中包含新创建的话题 (ID: $TOPIC_ID)${NC}"
  # 可以添加更多检查，例如标题、分类等是否匹配
else
  echo -e "${RED}✗ 测试失败: 话题列表响应中未找到新创建的话题${NC}"
  echo -e "${YELLOW}  预期: 列表包含 '\"id\":$TOPIC_ID'${NC}"
  # echo -e "${YELLOW}  实际: $LIST_TOPICS_RESPONSE${NC}" # 响应可能很长，选择性输出
fi
echo -e "${BLUE}===============================================${NC}"

# --- 4. 测试获取话题详情 ---
echo -e "${BLUE}▶ 4. 测试获取话题详情${NC}"
if [ -z "$TOPIC_ID" ]; then echo -e "${YELLOW}  跳过: 缺少话题ID${NC}"; exit 1; fi

echo "  发送获取话题详情请求 (ID: $TOPIC_ID)..."
echo -e "  发送请求: GET $BASE_URL/api/forum/topics/$TOPIC_ID"
# 预期响应：
# 状态码：200
# {
#   "id": 话题ID,
#   "title": "测试话题标题 xxx",
#   "author": { "id": 用户ID, "username": "testuser_forum_xxx", ... },
#   "category": { "id": 1, "name": "讨论区", ... },
#   "initialPost": { "id": 初始帖子ID, "content": "...", "likeCount": 0, "author": {...} },
#   "replies": [], // 目前应为空
#   "tags": [],
#   ...
# }
GET_TOPIC_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X GET "$BASE_URL/api/forum/topics/$TOPIC_ID" \\
  -H "Authorization: Bearer $TOKEN") # 假设详情页需要认证

echo "  获取话题详情响应: $GET_TOPIC_RESPONSE"

# 检查标题和初始帖子内容
TITLE_CHECK=$(echo $GET_TOPIC_RESPONSE | grep -o "\"title\":\"$TEST_TOPIC_TITLE\"")
CONTENT_CHECK=$(echo $GET_TOPIC_RESPONSE | grep -o "\"content\":\"$TEST_TOPIC_CONTENT\"") # 注意: 特殊字符可能导致匹配失败，简单检查存在性
REPLIES_CHECK=$(echo $GET_TOPIC_RESPONSE | grep -o '"replies":\[\]') # 检查回复是否为空数组

if [ ! -z "$TITLE_CHECK" ] && [ ! -z "$CONTENT_CHECK" ] && [ ! -z "$REPLIES_CHECK" ]; then
  echo -e "${GREEN}✓ 测试通过: 话题详情获取成功，内容基本匹配${NC}"
else
  echo -e "${RED}✗ 测试失败: 获取的话题详情不匹配${NC}"
  echo -e "${YELLOW}  预期: 包含正确标题、内容片段、空回复数组${NC}"
  echo -e "${YELLOW}  实际: $GET_TOPIC_RESPONSE${NC}"
fi
echo -e "${BLUE}===============================================${NC}"

# --- 5. 测试发表回复 ---
echo -e "${BLUE}▶ 5. 测试发表回复${NC}"
if [ -z "$TOPIC_ID" ]; then echo -e "${YELLOW}  跳过: 缺少话题ID${NC}"; exit 1; fi

TEST_REPLY_CONTENT="这是对测试话题的第一条回复。"
echo "  发送发表回复请求 (话题ID: $TOPIC_ID)..."
echo -e "  发送请求: POST $BASE_URL/api/forum/topics/$TOPIC_ID/posts"
# 预期响应：
# 状态码：201
# {
#   "id": 新回复帖子ID,
#   "topicId": 话题ID,
#   "userId": 用户ID,
#   "content": "这是对测试话题的第一条回复。",
#   "likeCount": 0,
#   ...
# }
CREATE_REPLY_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X POST "$BASE_URL/api/forum/topics/$TOPIC_ID/posts" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "'"$TEST_REPLY_CONTENT"'"
  }')

echo "  发表回复响应: $CREATE_REPLY_RESPONSE"
REPLY_POST_ID=$(echo $CREATE_REPLY_RESPONSE | grep -o '"id":[0-9]*' | cut -d ':' -f 2)

if [ -z "$REPLY_POST_ID" ]; then
  echo -e "${RED}✗ 测试失败: 未能从响应中提取新回复帖子ID${NC}"
  echo -e "${YELLOW}  预期: 响应包含 'id'${NC}"
  echo -e "${YELLOW}  实际: $CREATE_REPLY_RESPONSE${NC}"
else
  echo -e "${GREEN}✓ 测试通过: 成功发表回复 (回复帖子ID: $REPLY_POST_ID)${NC}"
fi

echo "  验证话题详情中的回复..."
# 再次获取话题详情
GET_TOPIC_AFTER_REPLY_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X GET "$BASE_URL/api/forum/topics/$TOPIC_ID" \\
  -H "Authorization: Bearer $TOKEN")

# 检查回复数组是否包含新回复的ID
REPLY_LIST_CHECK=$(echo $GET_TOPIC_AFTER_REPLY_RESPONSE | grep -o "\"replies\":\[.*\"id\":$REPLY_POST_ID")
TOPIC_REPLY_COUNT_CHECK=$(echo $GET_TOPIC_AFTER_REPLY_RESPONSE | grep -o '"replyCount":1') # 假设现在回复数为1

if [ ! -z "$REPLY_LIST_CHECK" ] && [ ! -z "$TOPIC_REPLY_COUNT_CHECK" ]; then
  echo -e "${GREEN}✓ 测试通过: 话题详情中已包含新回复，且replyCount更新为1${NC}"
else
  echo -e "${RED}✗ 测试失败: 话题详情未正确更新回复信息${NC}"
  echo -e "${YELLOW}  预期: 回复列表包含 ID $REPLY_POST_ID 且 replyCount 为 1${NC}"
  # echo -e "${YELLOW}  实际: $GET_TOPIC_AFTER_REPLY_RESPONSE${NC}"
fi
echo -e "${BLUE}===============================================${NC}"

# --- 6. 测试点赞帖子 ---
echo -e "${BLUE}▶ 6. 测试点赞帖子${NC}"
if [ -z "$REPLY_POST_ID" ]; then echo -e "${YELLOW}  跳过: 缺少回复帖子ID${NC}"; exit 1; fi

echo "  发送点赞请求 (帖子ID: $REPLY_POST_ID)..."
echo -e "  发送请求: POST $BASE_URL/api/posts/$REPLY_POST_ID/like" # 假设点赞接口
# 预期响应：
# 状态码：200 或 201
# { "message": "点赞成功", "likeCount": 1 } 或类似结构
LIKE_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X POST "$BASE_URL/api/posts/$REPLY_POST_ID/like" \\
  -H "Authorization: Bearer $TOKEN")

echo "  点赞响应: $LIKE_RESPONSE"
LIKE_COUNT_CHECK=$(echo $LIKE_RESPONSE | grep -o '"likeCount":1') # 检查点赞数是否为1

if [ ! -z "$LIKE_COUNT_CHECK" ]; then
   echo -e "${GREEN}✓ 测试通过: 帖子点赞成功，点赞数更新为1${NC}"
else
   echo -e "${RED}✗ 测试失败: 点赞帖子失败或点赞数未更新${NC}"
   echo -e "${YELLOW}  预期: 响应表明成功且 likeCount 为 1 ${NC}"
   echo -e "${YELLOW}  实际: $LIKE_RESPONSE${NC}"
fi

echo "  验证话题详情中的点赞数..."
# 再次获取话题详情
GET_TOPIC_AFTER_LIKE_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X GET "$BASE_URL/api/forum/topics/$TOPIC_ID" \\
  -H "Authorization: Bearer $TOKEN")

# 检查回复的点赞数
REPLY_LIKE_CHECK=$(echo $GET_TOPIC_AFTER_LIKE_RESPONSE | grep -o "\"id\":$REPLY_POST_ID.*\"likeCount\":1")

if [ ! -z "$REPLY_LIKE_CHECK" ]; then
  echo -e "${GREEN}✓ 测试通过: 话题详情中回复的点赞数已更新为1${NC}"
else
  echo -e "${RED}✗ 测试失败: 话题详情中回复的点赞数未更新${NC}"
  echo -e "${YELLOW}  预期: 帖子 ID $REPLY_POST_ID 的 likeCount 为 1${NC}"
  # echo -e "${YELLOW}  实际: $GET_TOPIC_AFTER_LIKE_RESPONSE${NC}"
fi

# --- 7. 测试取消点赞帖子 (可选但推荐) ---
echo "  发送取消点赞请求 (帖子ID: $REPLY_POST_ID)..."
echo -e "  发送请求: DELETE $BASE_URL/api/posts/$REPLY_POST_ID/like" # 假设取消点赞接口
# 预期响应：
# 状态码：200
# { "message": "取消点赞成功", "likeCount": 0 } 或类似结构
UNLIKE_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X DELETE "$BASE_URL/api/posts/$REPLY_POST_ID/like" \\
  -H "Authorization: Bearer $TOKEN")

echo "  取消点赞响应: $UNLIKE_RESPONSE"
UNLIKE_COUNT_CHECK=$(echo $UNLIKE_RESPONSE | grep -o '"likeCount":0')

if [ ! -z "$UNLIKE_COUNT_CHECK" ]; then
   echo -e "${GREEN}✓ 测试通过: 帖子取消点赞成功，点赞数更新为0${NC}"
else
   echo -e "${RED}✗ 测试失败: 取消点赞帖子失败或点赞数未更新${NC}"
   echo -e "${YELLOW}  预期: 响应表明成功且 likeCount 为 0 ${NC}"
   echo -e "${YELLOW}  实际: $UNLIKE_RESPONSE${NC}"
fi
echo -e "${BLUE}===============================================${NC}"


# --- 8. 测试添加话题标签 ---
echo -e "${BLUE}▶ 8. 测试添加话题标签${NC}"
if [ -z "$TOPIC_ID" ]; then echo -e "${YELLOW}  跳过: 缺少话题ID${NC}"; exit 1; fi

TEST_TAG_ID=1 # 假设标签ID 1 ("hot") 存在
echo "  发送添加标签请求 (话题ID: $TOPIC_ID, 标签ID: $TEST_TAG_ID)..."
echo -e "  发送请求: POST $BASE_URL/api/forum/topics/$TOPIC_ID/tags" # 假设添加标签接口
# 预期响应：
# 状态码：200 或 201
# { "message": "标签添加成功", "tags": [ { "id": 1, "name": "热门", ...} ] } 或仅返回成功消息
ADD_TAG_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X POST "$BASE_URL/api/forum/topics/$TOPIC_ID/tags" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "tagId": '$TEST_TAG_ID' }')

echo "  添加标签响应: $ADD_TAG_RESPONSE"
# 简单检查成功，因为具体响应格式可能不同
if [[ "$ADD_TAG_RESPONSE" == *"热门"* ]] || [[ "$ADD_TAG_RESPONSE" == *"添加成功"* ]] || [[ "$ADD_TAG_RESPONSE" == *"id\":$TEST_TAG_ID"* ]]; then
  echo -e "${GREEN}✓ 测试通过: 添加标签请求已发送，响应基本符合预期${NC}"
else
  echo -e "${RED}✗ 测试失败: 添加标签响应不符合预期${NC}"
  echo -e "${YELLOW}  预期: 响应表明成功或包含标签信息${NC}"
  echo -e "${YELLOW}  实际: $ADD_TAG_RESPONSE${NC}"
fi

echo "  验证话题详情中的标签..."
# 再次获取话题详情
GET_TOPIC_AFTER_TAG_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X GET "$BASE_URL/api/forum/topics/$TOPIC_ID" \\
  -H "Authorization: Bearer $TOKEN")

# 检查标签数组是否包含标签ID 1
TAG_LIST_CHECK=$(echo $GET_TOPIC_AFTER_TAG_RESPONSE | grep -o "\"tags\":\[.*\"id\":$TEST_TAG_ID")

if [ ! -z "$TAG_LIST_CHECK" ]; then
  echo -e "${GREEN}✓ 测试通过: 话题详情中已包含添加的标签 (ID: $TEST_TAG_ID)${NC}"
else
  echo -e "${RED}✗ 测试失败: 话题详情中未找到添加的标签${NC}"
  echo -e "${YELLOW}  预期: tags 数组包含 ID $TEST_TAG_ID 的对象${NC}"
  # echo -e "${YELLOW}  实际: $GET_TOPIC_AFTER_TAG_RESPONSE${NC}"
fi

# --- 9. 测试移除话题标签 (可选但推荐) ---
echo "  发送移除标签请求 (话题ID: $TOPIC_ID, 标签ID: $TEST_TAG_ID)..."
echo -e "  发送请求: DELETE $BASE_URL/api/forum/topics/$TOPIC_ID/tags/$TEST_TAG_ID" # 假设移除标签接口
# 预期响应：
# 状态码：200 或 204
# { "message": "标签移除成功" } 或无内容
REMOVE_TAG_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X DELETE "$BASE_URL/api/forum/topics/$TOPIC_ID/tags/$TEST_TAG_ID" \\
  -H "Authorization: Bearer $TOKEN")

echo "  移除标签响应: $REMOVE_TAG_RESPONSE"
# 简单检查成功
if [[ "$REMOVE_TAG_RESPONSE" == *"移除成功"* ]] || [ -z "$REMOVE_TAG_RESPONSE" ]; then # 204 No Content
  echo -e "${GREEN}✓ 测试通过: 移除标签请求已发送，响应基本符合预期${NC}"
else
  echo -e "${RED}✗ 测试失败: 移除标签响应不符合预期${NC}"
  echo -e "${YELLOW}  预期: 响应表明成功或为空${NC}"
  echo -e "${YELLOW}  实际: $REMOVE_TAG_RESPONSE${NC}"
fi
echo -e "${BLUE}===============================================${NC}"


# --- 10. 清理测试环境 ---
echo -e "${BLUE}▶ 10. 清理测试环境${NC}"
echo "  删除测试用户 (应级联删除其话题和帖子)..."
echo -e "  发送请求: DELETE $BASE_URL/api/users/profile"
DELETE_USER_RESPONSE=$(curl -s -m $CURL_TIMEOUT -X DELETE "$BASE_URL/api/users/profile" \\
  -H "Authorization: Bearer $TOKEN")

echo "  删除用户响应: $DELETE_USER_RESPONSE"
USER_DELETE_CHECK=$(echo $DELETE_USER_RESPONSE | grep -o '"message":"用户账户已成功删除"')

if [ ! -z "$USER_DELETE_CHECK" ]; then
  echo -e "${GREEN}✓ 测试通过: 成功删除测试用户${NC}"
else
  echo -e "${RED}✗ 测试失败: 删除测试用户${NC}"
  echo -e "${YELLOW}  预期: 响应应包含成功删除用户的消息${NC}"
  echo -e "${YELLOW}  实际: $DELETE_USER_RESPONSE${NC}"
fi

echo -e "\n${GREEN}✓ 论坛功能API测试完成!${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${YELLOW}给后端开发者的提示:${NC}"
echo -e "${YELLOW}- 请根据此脚本实现对应的API端点。${NC}"
echo -e "${YELLOW}- 端点路径 (如 /api/forum/topics, /api/posts/{id}/like) 仅为示例，可自行定义。${NC}"
echo -e "${YELLOW}- 确保实现了认证和授权逻辑 (使用JWT Bearer Token)。${NC}"
echo -e "${YELLOW}- 数据库操作需考虑事务性。${NC}"
echo -e "${YELLOW}- 列表接口应支持分页、过滤和排序参数。${NC}"
echo -e "${YELLOW}- 错误处理应返回合适的HTTP状态码和明确的错误信息。${NC}"
echo -e "${BLUE}===============================================${NC}" 