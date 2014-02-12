
var EE = require('events').EventEmitter;
var util = require('util');

module.exports = Forkee;

util.inherits(Forkee, EE);

function Forkee (options) {
  if (!(this instanceof Forkee)) return new Forkee(options);

  process.on('uncaughtException', this.dieWithError.bind(this));
  process.on('message', this.onMessage.bind(this));

}

Forkee.prototype.onMessage = function (message) {
  this.emit('request', message, this.respond.bind(this));
};

Forkee.prototype.respond = function (err, message) {
  if (err) {
    message.error = err;
  }

  process.send(message);
};

Forkee.prototype.die = function () {
  process.exit(0);
};

Forkee.prototype.dieWithError = function (err) {
  process.send({ error: err});
  process.exit(1);
};
