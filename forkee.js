
var EE = require('events').EventEmitter;
var util = require('util');

module.exports = Forkee;

util.inherits(Forkee, EE);

function Forkee (callback) {
  if (!(this instanceof Forkee)) return new Forkee(callback);

  this._callback = callback && typeof callback == 'function'
    ? callback
    : undefined;

  process.on('uncaughtException', this._dieWithError.bind(this));
  process.on('message', this._onMessage.bind(this));

}

Forkee.prototype.die = function () {
  process.exit(0);
};

Forkee.prototype._onMessage = function (message) {
  return !this._callback
    ? this.emit('request', message, this._respond.bind(this))
    : this._callback(message, this._respond.bind(this));
};

Forkee.prototype._respond = function (err, msg) {
  msg = msg || {};
  //
  // Form a ghetto error object since we cannot serialize error objects
  //
  if (err) {
    msg.error = {
      message: err.message,
      stack: err.stack
    };
  }

  process.send(msg);
};

Forkee.prototype._dieWithError = function (err) {
  //
  // We attempt to send an error here but its ok if we don't as `fork`
  // will understand that something bad happened
  //
  process.send({ error: { message: err.message, stack: err.stack }});
  process.exit(1);
};


