// import { Server } from 'ws'

// const wss = new Server({ noServer: true });

// wss.on('connection', (ws) => {
//   ws.on('message', (message) => {
//     console.log('received: %s', message);
//     // Broadcast the message to all connected clients
//     wss.clients.forEach((client) => {
//       if (client.readyState === ws.OPEN) {
//         client.send(message);
//       }
//     });
//   });

//   ws.send('Welcome to the WebSocket server!');
// });

// export const GET = async (req, res) => {
//   wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
//     wss.emit('connection', ws, req);
//   });
//   res.end();
// }