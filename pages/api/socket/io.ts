import { Server as HttpServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as SocketIOServer } from 'socket.io'; // pnpm i socket.io pnpm i socket.io-client

import { NextApiResponseServerIO} from '~/lib/types/index';

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('First use, starting socket.io');
    const path = '/api/socket/io';
    const httpServer: HttpServer = res.socket.server as any
    const io = new SocketIOServer(httpServer, {
      // cors: {
      //   origin: '*',
      //   methods: ['GET', 'POST'],
      // },
      path,
      // @ts-ignore 某个版本可能的bug
      addTrailingSlash: false
    });
    io.on('connection', (socket) => {
      console.log('New client connected', socket.id);

      // 加入 chat:${chatId} 房间
      socket.on('joinChatRoom', (chatId) => {
        socket.join(`chat:${chatId}`);
        console.log(`User joined room chat:${chatId}`);
      });

      // 离开 chat:${chatId} 房间
      socket.on('leaveChatRoom', (chatId) => {
        socket.leave(`chat:${chatId}`);
        console.log(`User left room chat:${chatId}`);
      });

      // 监听客户端断开连接
      socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
      });

      // 示例：发送新消息事件 // 一般的 服务端不依赖 通过 ws 监听消息 (可以通过 http 监听 然后调用 ws 发送消息)
      socket.on('sendMessage', (message) => {
        io.emit('message', message);
      });
    });
    res.socket.server.io = io;
  } else {
    console.log('socket.io already running');
  }
  // res.socket
  res.end();
}

export default ioHandler;