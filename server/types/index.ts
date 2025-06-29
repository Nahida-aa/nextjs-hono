import { Server as NetServer, Socket } from 'net';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io'; // pnpm i socket.io 

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: SocketIOServer & {
      io: SocketIOServer;
    }
  }
};