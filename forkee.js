
var EE = require('events').EventEmitter;
var errs = require('errs');
var util = require('util');

var extend = util._extend;

module.exports = Forkee;

util.inherits(Forkee, EE);

function Forkee (callback) {
  if (!(this instanceof Forkee)) return new Forkee(callback);
  EE.call(this);

  this._callback = callback && typeof callback == 'function'
    ? callback
    : undefined;

  process.on('uncaughtException', this._dieWithError.bind(this));
  process.on('message', this._onMessage.bind(this));

  //
  // Send special event objects for logging purposes if an "event" event is emit
  // on us
  //
  this.on('event', function (type, object) {
    process.send(extend({ __event: type }, object));
  });

}

Forkee.prototype.die = function () {
  process.exit(0);
};

Forkee.prototype._onMessage = function (message) {
  return !this._callback
    ? this.emit('request', message, this._respond.bind(this))
    : this._callback(message, this._respond.bind(this));
};

Forkee.prototype.notify = function (type, object) {
  this.emit('event', type, object);
};

Forkee.prototype._respond = function (err, msg) {
  msg = msg || {};

  //
  // Use Errs so that we create a serializable error object
  //
  if (err) {
    msg.error = errs.merge(err, { child: true });
  }

  process.send(msg);
  process.disconnect();
};

Forkee.prototype._dieWithError = function (err) {
  //
  // We attempt to send an error here but its ok if we don't as `fork`
  // will understand that something bad happened
  //
  process.send({ error: errs.merge(err, { uncaughtException: true, child: true }) });
  //
  // Try and ensure we end before we force exit on uncaughtExceptions
  //
  setTimeout(function () {
    process.exit(1);
  }, 100).unref();
};
