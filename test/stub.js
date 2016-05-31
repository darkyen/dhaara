
import SocketIO from 'socket.io';
import ClientIO from 'socket.io-client';
import http from 'http';

export default function setup(){
    return new Promise((resolve, reject) => {
      function handler(req, res){
        console.log("Had a request");
        res.writeHead(200);
        res.end('Ok');
      }

      const app = http.createServer(handler);
      const PORT = 2674;
      const HOST = 'localhost';
      let serverSocket = null;
      let clientSocket = null;

      const server = SocketIO(app);
      server.on('connection', function(socket){
        serverSocket = socket;
      });


      app.listen(PORT, HOST, () => {
        const socket = ClientIO(`http://${HOST}:${PORT}`);
        socket.on('connect', function(){
          resolve({
            serverSocket: serverSocket,
            clientSocket: socket
          });
        });
      });
    });
}
