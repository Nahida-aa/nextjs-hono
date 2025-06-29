# websocket

- 当用户的应用 在运行时 就让 用户加入 user:${userId} room
  - user:${userId} room 主要负责 监听 对应用户需要在 chat list ui 需要看的消息和应用的通知消息
- 当用户 进入 chat room ui 时 就让 用户加入 chat:${chatId} room
  - chat:${chatId} room 主要负责 监听 对应 chat room ui 需要看的消息

- 用户发送消息
  1. 更新 ui (客户端状态)
    1.1 先不通过
  2. 将消息存储到数据库
  3. 发送消息到 chat:${chatId} room
    3.1 ws 在 chat:${chatId} room 广播消息
  4. 更新 ui (客户端状态)
