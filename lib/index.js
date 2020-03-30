const tls = require('tls');
const JsonSocket = require('json-socket');
const Message = require('./message');

class Client {
  constructor(props) {
    this.socket = {};

    this.timeout = {};
    this.rcTimeout = props.rcTimeout;
    this.host = props.host;
    this.port = props.port;
    this.options = props.options;

    this.callbacks = [];
  }

  async init() { return new Promise((resolve, reject) => {
    this.log(`Socket created`);
    this.socket = new JsonSocket(new tls.TLSSocket());
    return resolve(this);
  })}

  async connect() { return new Promise((resolve, reject) => {
    this.log(`Connecting to ${this.host}:${this.port}`);
    this.socket.connect(this.port, this.host, this.options);
    return resolve(this);
  })}

  async initHandlers() { return new Promise((resolve, reject) => {

    this.socket.on('connect', () => {
      this.log('Client has connected');
    })

    this.socket.on('error', (err) => {
      this.log(`Error: ${err}`);
      this.socket._socket.destroy();
    });

    this.socket.on('close', () => {
      this.log('Connection closed.');
      this.reconnect();
    });
    return resolve(this);
  })}

  async reconnect() { return new Promise((resolve, reject) => {
    clearTimeout(this.timeout);
    this.log(`Reconnecting to ${this.host}:${this.port} in ${this.rcTimeout}ms.`)
    this.timeout = setTimeout(this.connect.bind(this), this.rcTimeout);
    return resolve(this);
  })}

  async log(msg) { return new Promise((resolve, reject) => {
    console.log(`> tcpClient: ${msg}`);
    return resolve(this);
  })}

  async on(action, cb) { return new Promise((resolve, reject) => {
    this.socket.on(action, cb);
    return resolve(this);
  })}

  async enableCallback() { return new Promise((resolve, reject) => {
    this.socket.on('message', (msg) => {
      Message.runCallback(msg);
    })
    return resolve(this);
  })}

  async enablePassiveCallback() { return new Promise((resolve, reject) => {
    this.socket.on('message', (msg) => {
      Message.runPassiveCallback(msg);
    });
    return resolve(this);
  })}

  async send(msg, cb) { return new Promise((resolve, reject) => {
    Promise.resolve()
    .then(Message.init({socket:this.socket, data:msg}))
    .then((message) => message.send(cb))
    .then(resolve)
    .catch(reject);
  })}

  static async init(props) { return new Promise((resolve, reject) => {
    Promise.resolve()
    .then(() => new this(props))
    .then((client) => client.init())
    .then((client) => client.initHandlers())
    .then(resolve)
    .catch(reject);
  })}
}

module.exports = Client;
module.exports.Message = Message;
