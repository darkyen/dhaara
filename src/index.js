import {Duplex} from 'stream';
import autobind from 'core-decorators/lib/autobind';
import Debug from 'debug';

const log = Debug('dhaara');

@autobind
class StreamIO extends Duplex{
  // We can drop this but it allows us to
  // check for duplicate streams without
  // mutating the the socket.io socket.

  // should we actually do it this way though?
  static socketMap = new WeakMap();
  static defaults  = {
    // copy behavior from node-style sockets.
    allowHalfOpen: true
  };

  static getStreams(socket){
    return Object.values(StreamIO.socketMap(socket));
  }

  constructor(opts = {}){
    super(opts);
    this.opts = Object.freeze(Object.assign({}, StreamIO.defaults, opts));
    this._readable = true;
    this._writable = true;

    const {socket, name} = opts;
    const eventNames = {
      error: `x-stream-${name}-error`,
      data: `x-stream-${name}-data`,
      end: `x-stream-${name}-end`
    };

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


    if(map[name]){
      throw new Error('There could only be a single stream of a single name');
    }

    socket.on(eventNames.data, this._handleData);
    socket.on(eventNames.end, this._handleEnd);
    socket.on(eventNames.error, this._handleError);
    log(`Stream[${name}] has been created`);

    this.on('pipe', this._handlePipe);
    map[name] = this;

    this.eventNames = eventNames;
  }

  get socket(){
    return this.opts.socket;
  }

  get name(){
    return this.opts.name;
  }

  _handlePipe(source){
    const {socket, eventNames, name} = this;
    log(`Stream[${name}] now has a new Source[${source.constructor.name}]`);
    source.once('end', this._handleSourceEnd);
  }

  _send(eventType, data, cb){
    const {socket, eventNames} = this;
    socket.emit(eventNames[eventType], {
      payload: data
    }, cb);
  }

  // Occurs when stream piping to this
  // stream ends.
  _handleSourceEnd(data){
    const {opts, name} = this;
    this._send('end', data || null);
    log(`Stream[${name}] recieved end from source`);

    if(opts.allowHalfOpen === false){
      log(`Stream[${name}] should not be half-open, closing now!`);
      this.close();
    }

    this._writable = false;
  }

  // Occurs when remote End emits FIN
  _handleRemoteEnd({payload}){
    const {opts} = this;
    this.push(payload);
    if(payload){
      // Properly finish.
      this.push(null);
    }

    this.emit('end', payload);

    if(opts.allowHalfOpen === false){
      this.close();
    }

    this._readable = false;
  }

  // If this errors out, close it
  // regardless
  _handleError(e){
    log(`Error in Stream[${this.name}] : ${e.message}`);
    this.emit('error', e);
    this.close();
  }

  _handleData({payload}, ack){
    log(`Stream[${this.name}] recieved ${payload.length} bytes`);
    this.push(payload);
    ack();
  }

  _handleEnd(data){
    log(`Stream[${this.name}] recieved FIN packet`);
    this._handleRemoteEnd(data);
  }

  _write(buffer, encoding, done){
    log(`Stream[${this.name}] writing ${buffer.length} bytes`);
    this._send('data', buffer, done);
  }

  _read(n){
    /* Does nothing, we write at our own pace */
  }

  close(){
    // this.emit('end');
    this._readable = this._writable = false;
    this.emit('close');
    this.destroy();
  }

  destroy(){
    // free it.
    const {socket, name, eventNames} = this;
    log(`Stream[${name}] is destroyed and not listening`);
    socket.removeListener(eventNames.data, this._handleData);
    socket.removeListener(eventNames.end, this._handleEnd);
    socket.removeListener(eventNames.error, this._handleError);
    StreamIO.socketMap.get(socket)[name] = null;
  }
}

export default StreamIO;
