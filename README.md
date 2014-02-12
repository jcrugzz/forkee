# forkee

An extendable prototype for use in creating an agnostic request/response based
child process. It is meant to be used with something like [`fork`][fork] in
order to make it a more pleasurable experience writing node processes meant for
this purpose.

## example

```js

var Forkee = require('forkee');

var forked = new Forkee()
  .on('request', function (message, callback) {
    //
    // Do something async based on message
    //
    var payload = { hi: 'there' };
    callback(null, payload);
  });


//
// We can also just take a callback!
//

var proc = Forkee(function (message, callback) {
  //
  // Do something with message and acquire return payload
  //
  var payload = { woooo: 'yeaaaaa', party: 'time' };
  callback(null, payload);
})
```

[fork]: https://github.com/jcrugzz/fork
