import {Duplex} from 'stream';
import Debug from 'debug';

const log = Debug('dhaara');

export default class StreamIO extends Duplex{
  static socketMap = new WeakMap();
  constructor(opts = {}){
    super(opts);
    this.opts = Object.freeze(opts);
    this._handleEmit = this._handleEmit.bind(this);

    const {socket, name} = opts;

    if(!name){
      throw new Error('There must be name in options');
    }

    if(!socket){
      throw new Error('There must be socket in options');
    }

    let map = StreamIO.socketMap.get(socket);

    if( !map ){
      map = {};
      StreamIO.socketMap.set(socket, map);
    }

    if(map[name] === true){
      throw new Error('There could only be a single stream of a single name');
    }

    socket.on(`x-stream-${name}`, this._handleEmit);
    map[name] = true;
  }

  get socket(){
    return this.opts.socket;
  }

  get name(){
    return this.opts.name;
  }

  _handleEmit(data){
    log(`Stream[${this.name}] recieved ${data.length} bytes`);
    this.push(data.payload);
  }

  _write(buffer, encoding, done){
    const {socket, name} = this;
    log(`Stream[${this.name}] writing ${buffer.length} bytes`);
    socket.emit(`x-stream-${name}`, {
      payload: buffer,
    }, done);
  }

  _read(){
    /* Does nothing */
  }

  destroy(){
    const {socket, name} = this;
    StreamIO.socketMap.get(socket)[name] = false;
    socket.off(`x-stream-${name}`, this._handleEmit);
    super.destroy();
  }
}
