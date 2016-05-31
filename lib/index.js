'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _stream = require('stream');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = (0, _debug2.default)('dhaara');

var StreamIO = function (_Duplex) {
  _inherits(StreamIO, _Duplex);

  function StreamIO() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, StreamIO);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StreamIO).call(this, opts));

    _this.opts = Object.freeze(opts);
    _this._handleEmit = _this._handleEmit.bind(_this);

    var socket = opts.socket;
    var name = opts.name;


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

    socket.on('x-stream-' + name, _this._handleEmit);
    map[name] = true;
    return _this;
  }

  _createClass(StreamIO, [{
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
}(_stream.Duplex);

StreamIO.socketMap = new WeakMap();
exports.default = StreamIO;