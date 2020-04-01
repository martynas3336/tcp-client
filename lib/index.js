const tls = require('tls');

class Client {
  constructor(props) {
    this.socket = {};

    this.timeout = {};
    this.rcTimeout = props.rcTimeout;
    this.options = props.options;

    this.callbacks = {};

    this.additionalHandlers = {};
  }

  async connect() { return new Promise((resolve, reject) => {
    Promise.resolve()
    .then(() => this.init())
    .then(() => this.initHandlers())
    .then(resolve)
    .catch(reject);
  })}

  async init() { return new Promise((resolve, reject) => {
    this.log(`Initializing socket.`);
    this.socket = tls.connect(this.options);
    return resolve(this);
  })}

  async initHandlers() { return new Promise((resolve, reject) => {
    this.log(`Initializing socket handlers.`);
    this.socket.setEncoding('utf8');

    this.socket.on('error', (err) => {
      this.log(`Error: ${err}`);
      this.socket.destroy();
    });

    this.socket.on('close', (err) => {
      this.log('Connection closed.');
      this.reconnect();
    });

    this.socket.on('connect', () => {
      this.log('Client has connected');
    });

    this.socket.on('secureConnect', () => {
      this.log('Client has secured connected');
    });

    this.socket.on('data', () => {});

    Object.keys(this.callbacks).forEach(action => {
      this.callbacks[action].forEach(cb => {
        this.socket.on(action, cb);
      });
    });

    return resolve(this);
  })}

  async reconnect() { return new Promise((resolve, reject) => {
    clearTimeout(this.timeout);
    this.log(`Reconnecting to ${this.options.hostname}:${this.options.port} in ${this.rcTimeout}ms.`)

    this.timeout = setTimeout(function() {
      Promise.resolve()
      .then(() => this.connect())
      .then(() => { this.log('Reconnect attempt done.'); })
      .catch((err) => { console.log(err); });
    }.bind(this), this.rcTimeout);


    return resolve(this);
  })}

  async on(action, cb) { return new Promise((resolve, reject) => {
    if(Object.prototype.hasOwnProperty.call(this.callbacks, action) === false) this.callbacks[action] = [];
    this.callbacks[action].push(cb);
  })}
  //
  async log(msg) { return new Promise((resolve, reject) => {
    console.log(`> tcpClient: ${msg}`);
    return resolve(this);
  })}

  static async init(props) { return new Promise((resolve, reject) => {
    Promise.resolve()
    .then(() => new this(props))
    .then(resolve)
    .catch(reject);
  })}
}

module.exports = Client;
