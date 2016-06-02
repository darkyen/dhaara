'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _class, _class2, _temp;

var _stream = require('stream');

var _autobind = require('core-decorators/lib/autobind');

var _autobind2 = _interopRequireDefault(_autobind);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = (0, _debug2.default)('dhaara');

var StreamIO = (0, _autobind2.default)(_class = (_temp = _class2 = function (_Duplex) {
  _inherits(StreamIO, _Duplex);

  function StreamIO() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, StreamIO);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StreamIO).call(this, opts));

    _this.opts = Object.freeze(opts);
    _this.eventNames = {
      error: 'x-stream-' + name + '-error',
      data: 'x-stream-' + name + '-data',
      end: 'x-stream-' + name + '-end'
    };

    var socket = opts.socket;
    var name = opts.name;
    var eventNames = _this.eventNames;


    if (!name) {
      throw new Error('There must be name in options');
    }

    if (!socket) {
      throw new Error('There must be socket in options');
    }

    var map = StreamIO.socketMap.get(socket);

    if (!map) {
      map = {};
      StreamIO.socketMap.set(socket, map);
    }

    if (map[name] === true) {
      throw new Error('There could only be a single stream of a single name');
    }

    socket.on(eventNames.data, _this._handleEmit);
    socket.on(eventNames.end, _this._handleEnd);
    socket.on(eventNames.error, _this._handleError);

    map[name] = true;
    return _this;
  }

  _createClass(StreamIO, [{
    key: '_handlePipe',
    value: function _handlePipe(source) {
      var _this2 = this;

      log('Stream[' + this.name + '] now has a new Source[' + source.constructor.name + ']');
      source.on('end', function () {
        log('Source [' + source.constructor.name + '] emitted end on Stream[' + _this2.name + ']');
      });
    }
  }, {
    key: '_handleError',
    value: function _handleError(e) {
      log('Error in Stream[' + this.name + '] : ' + e.message);
      this.emit('error', e);
      this.close();
    }
  }, {
    key: '_handleEmit',
    value: function _handleEmit(data) {
      log('Stream[' + this.name + '] recieved ' + data.length + ' bytes');
      this.push(data.payload);
    }
  }, {
    key: '_write',
    value: function _write(buffer, encoding, done) {
      var socket = this.socket;
      var name = this.name;

      log('Stream[' + this.name + '] writing ' + buffer.length + ' bytes');
      socket.emit('x-stream-' + name, {
        payload: buffer
      }, done);
    }
  }, {
    key: '_read',
    value: function _read() {
      /* Does nothing */
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var socket = this.socket;
      var name = this.name;

      StreamIO.socketMap.get(socket)[name] = false;
      socket.off('x-stream-' + name, this._handleEmit);
      _get(Object.getPrototypeOf(StreamIO.prototype), 'destroy', this).call(this);
    }
  }, {
    key: 'socket',
    get: function get() {
      return this.opts.socket;
    }
  }, {
    key: 'name',
    get: function get() {
      return this.opts.name;
    }
  }]);

  return StreamIO;
}(_stream.Duplex), _class2.socketMap = new WeakMap(), _temp)) || _class;

exports.default = StreamIO;