import chai from 'chai';
import StreamIO from '../src/index.js';
import fs from 'fs';
import setup from './stub.js';


chai.should();

function polluteGlobals(sockets){
  global.serverSocket = sockets.serverSocket;
  global.clientSocket = sockets.clientSocket;
}

describe('Stream.IO', function(){
  describe('Basic Tests', function(){
    it('should throw if name is not passed as an argument', function(){
      (() => {
        const stream = new StreamIO({
          socket: clientSocket
        });
      }).should.throw('There must be name in options');
    });

    it('should throw if socket is not passed as an argument', function(){
      (() => {
        const stream = new StreamIO({
          name: 'test'
        });
      }).should.throw('There must be socket in options');
    });


    it('should allow creating new streams on client socket.io instances', function(){
      (() => {
        const stream = new StreamIO({
          socket: clientSocket,
          name: 'test-create-client'
        });
      }).should.not.throw();
    });

    it('should allow creating new stream on server socket.io instances', function(){
      (() => {
        const stream = new StreamIO({
          socket: serverSocket,
          name: 'test-create-server'
        });
      }).should.not.throw();
    });

    it('should not allow creating two streams of same name!', function(){
      (() => {
        const stream = new StreamIO({
          socket: serverSocket,
          name: 'test-duplicate'
        });

        const stream2 = new StreamIO({
          socket: serverSocket,
          name: 'test-duplicate'
        });
      }).should.throw();
    });

  });

  describe('Runtime Tests', function(){
    it('Firengi Echo Test', function(done){
      this.timeout(4000);
      clientSocket.displayName = 'Client';
      const clientStream = new StreamIO({
        socket: clientSocket,
        name: 'firengi'
      });

      serverSocket.displayName = 'Server';
      const serverStream = new StreamIO({
        socket: serverSocket,
        name: 'firengi'
      });

      const rulesRead = fs.createReadStream('test/firengi.txt');
      const rulesWrite = fs.createWriteStream('test/firengi-2.txt');
      // This will make a good echo stream!
      serverStream.pipe(serverStream);
      rulesRead.pipe(clientStream);
      clientStream.pipe(rulesWrite);

      rulesWrite.on('finish', function(){
        const rulesOriginal = fs.readFileSync('test/firengi.txt').toString('utf8');
        const rulesCloned   = fs.readFileSync('test/firengi-2.txt').toString('utf8');
        rulesOriginal.should.equal(rulesCloned);
        done();
      });
    });

    it('Big File Transfer Echo Test', function(done){
      this.timeout(40000);
      const clientStream = new StreamIO({
        socket: clientSocket,
        name: 'big-file'
      });

      const serverStream = new StreamIO({
        socket: serverSocket,
        name: 'big-file'
      });

      const rulesRead = fs.createReadStream('test/yes.txt');
      const rulesWrite = fs.createWriteStream('test/yes-2.txt');
      // This will make a good echo stream!
      serverStream.pipe(serverStream);
      rulesRead.pipe(clientStream);
      clientStream.pipe(rulesWrite);

      rulesWrite.on('finish', function(){
        const rulesOriginal = fs.readFileSync('test/yes.txt').toString('utf8');
        const rulesCloned   = fs.readFileSync('test/yes-2.txt').toString('utf8');
        rulesOriginal.should.equal(rulesCloned);
        done();
      });
    });

  });
  setup().then(polluteGlobals).then(run);
});
