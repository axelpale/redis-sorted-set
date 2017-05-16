// efficient time to live implementation with sorted sets

var Set = require('..');

// a ttl set
function TTL() {
  this._set = new Set();
}

// returns true when added, false when it already existed
TTL.prototype.add = function(key, ms) {
  this.cleanup(); // might not need to call this on every update
  return this._set.set(key, Date.now() + ms) === null;
};

// returns true when added, false when it already existed
TTL.prototype.set = function(key, time) {
  this.cleanup();
  return this._set.set(key, time) === null;
};

// returns whether the set contains the given key
TTL.prototype.has = function(key) {
  var time = this._set.get(key), now = Date.now() - 1;
  if (time <= now) {
    this._set.gut(null, now);
    return false;
  }
  return true;
};

// returns number of keys removed
TTL.prototype.cleanup = function() {
  return this._set.gut(null, Date.now() - 1);
};

var ttl = new TTL();

// clean up storage every tenth of a second
var interval = setInterval(ttl.cleanup.bind(ttl), 100);

ttl.add('hello', 400);
ttl.add('world', 500);

setTimeout(function() {
  console.log(ttl._set.length); // should be 2
  console.log('hello should exist:\t' + ttl.has('hello'));
  console.log('world should exist:\t' + ttl.has('world'));
}, 350);

setTimeout(function() {
  console.log(ttl._set.length); // should be 1
  console.log('hello should not exist:\t' + !ttl.has('hello'));
  console.log('world should exist:\t' + ttl.has('world'));
}, 450);

setTimeout(function() {
  console.log(ttl._set.length); // should be 0
  console.log('hello should not exist:\t' + !ttl.has('hello'));
  console.log('world should not exist:\t' + !ttl.has('world'));
  // clear event loop, terminates process
  clearInterval(interval);
}, 550);
