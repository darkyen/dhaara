import assert from 'assert';
import StreamIO from '../src/index.js';
import fs from 'fs';
import setup from './stub.js';

function polluteGlobals(sockets){
  global.serverSocket = sockets.serverSocket;
  global.clientSocket = sockets.clientSocket;
}

describe('Stream.IO', function(){
  describe('Client', function(){
    it('should throw if name is not passed as an argument', function(){
      assert.throws(() => {
        const stream = new StreamIO({
          socket: socket
        });
      }, 'There must be name in options');
    })

    it('should throw if socket is not passed as an argument', function(){
      assert.throws(() => {
        const stream = new StreamIO({
          name: 'test'
        });
      }, 'There must be socket in options');
    })

    it('should allow creating new streams on client socket.io instances', function(){
      assert.doesNotThrow(() => {
        const stream = new StreamIO({
          socket: clientSocket,
          name: 'test-create-client'
        });
      });
    });

    it('should allow creating new stream on server socket.io instances', function(){
      assert.doesNotThrow(() => {
        const stream = new StreamIO({
          socket: serverSocket,
          name: 'test-create-server'
        });
      });
    });

    it('should not allow creating two streams of same name!', function(){
      assert.throws(() => {
        const stream = new StreamIO({
          socket: serverSocket,
          name: 'test-duplicate'
        });

        const stream2 = new StreamIO({
          socket: serverSocket,
          name: 'test-duplicate'
        });
      });
    });

    it('Should send data from server to client', function(done){
      const clientStream = new StreamIO({
        socket: clientSocket,
        name: 'firengi'
      });

      const serverStream = new StreamIO({
        socket: serverSocket,
        name: 'firengi'
      });

      const rulesRead = fs.createReadStream('test/firengi.txt');
      const rulesWrite = fs.createWriteStream('test/firengi-2.txt', {
        flag: 2
      });
      // This will make a good echo stream!
      serverStream.pipe(serverStream);
      rulesRead.pipe(clientStream);
      clientStream.pipe(rulesWrite);

      rulesWrite.on('end', function(){
        const rulesOriginal = fs.readFileSync('test/firengi.txt');
        const rulesCloned   = fs.readFileSync('test/firengi-2.txt');
        assert.equals(rulesOriginal, rulesCloned);
        done();
      });
    });
  });

  setup().then(polluteGlobals).then(run);
});
