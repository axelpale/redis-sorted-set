var intersect = require('./intersect');

var slice = Array.prototype.slice;

var P = 1 / Math.E;

function randomLevel() {
  var level = 1;
  while (Math.random() < P) {
    level += 1;
  }
  return level < 32 ? level : 32;
};

function Level(next, span) {
  this.next = next;
  this.span = span;
};

// value is score, sorted
// key is obj, unique
function Node(level, key, value) {
  this.key = key;
  this.value = value;
  this.next = new Array(level);
  this.prev = null;
};

function Entry(key, value) {
  this.key = key;
  this.value = value;
};

var Z = function (options) {
  if (!(this instanceof Z)) {
    return new Z();
  }
  options || (options = {});
  this._unique = !!options.unique;
  this.empty();
};

Z.intersect = function () {
  return intersect.call(Z, slice.call(arguments));
};

Z.prototype.add = function (key, value) {
  var current;

  if (key === '__proto__') {
    throw new Error('invalid key __proto__');
  }

  if (value == null) {
    return this.rem(key);
  }

  current = this._map[key];

  if (current !== undefined) {
    if (value === current) {
      return current;
    }
    this._remove(key, current);
  }

  var node = this._insert(key, value);
  if (!node) {
    current === undefined || this._insert(key, current);
    // TODO: can we defer _remove until after insert?
    throw new Error('unique constraint violated');
  }

  this._map[key] = value;
  return current === undefined ? null : current;
};

Z.prototype.card = function () {
  // Returns the sorted set cardinality (number of elements)
  if (this.length) {
    return this.length;
  }
  return 0;
};

Z.prototype.has = function (key) {
  return this._map[key] !== undefined;
};

Z.prototype.score = function (member) {
  // Returns the score of member in the sorted set.
  // If member does not exist in the sorted set, null is returned.
  var score = this._map[member];
  return score === undefined ? null : score;
};

Z.prototype.get = function (key) {
  console.warn('Deprecated get(key). Use score(member) instead.');
  return this.score(key);
};

Z.prototype.rem = function (key) {
  var value = this._map[key];
  if (value !== undefined) {
    this._remove(key, value);
    delete this._map[key];
    return value;
  }
  return null;
};

Z.prototype.rank = function (key) {
  // Rank of key, ordered by value.
  //
  // Return
  //   integer
  //     if member exists
  ///  null
  //     if member does not exist

  var value = this._map[key];

  if (value === undefined) {
    return null;
  }

  var i;
  var node = this._head;
  var next = null;
  var rank = -1;

  for (i = this._level - 1; i >= 0; i -= 1) {
    while ((next = node.next[i].next) && (next.value < value || (next.value === value && next.key <= key))) {
      rank += node.next[i].span;
      node = next;
    }
    if (node.key && node.key === key) {
      return rank;
    }
  }

  return null;
};

Z.prototype.count = function (min, max) {
  if (!this.length) {
    return 0;
  }

  if (min == null) {
    min = -Infinity;
  }
  if (max == null) {
    max = Infinity;
  }

  if (min <= this._head.next[0].next.value && max >= this._tail.value) {
    return this.length;
  }

  if (max < min || min > this._tail.value || max < this._head.next[0].next.value) {
    return 0;
  }

  var i;
  var node = this._first(min);
  var count = 0;

  if (!node) {
    return 0;
  }

  for (i = node.next.length - 1; i >= 0; i -= 1) {
    while (node.next[i].next && node.next[i].next.value <= max) {
      count += node.next[i].span;
      node = node.next[i].next;
    }
  }

  // feels hacky and error prone
  return count && count + 1;
};

Z.prototype.rangeByScore = function (min, max) {
  // Return members with score within inclusive range [min, max].
  if (!this.length) {
    return [];
  }

  if (min == null) {
    min = -Infinity;
  }
  if (max == null) {
    max = Infinity;
  }

  if (min <= this._head.next[0].next.value && max >= this._tail.value) {
    return this.toArray();
  }

  if (max < min || min > this._tail.value || max < this._head.next[0].next.value) {
    return [];
  }

  var node = this._first(min)
  var result = [];

  // if (!node)
  //   return result;

  for (; node && node.value <= max; node = node.next[0].next) {
    result.push(new Entry(node.key, node.value));
  }

  return result;
};

Z.prototype.slice = function (start, end) {
  console.log('Deprecated use of slice(). Use range() instead.');
  return this.range(start, end - 1);
};

Z.prototype.range = function (start, stop, options) {
  // Parameters:
  //   start
  //     inclusive
  //   stop
  //     inclusive
  //   options (optional)
  //     withScores (optional, default to false)
  //
  // Return:
  //   an array

  if (this.length === 0) {
    return [];
  }

  if (start == null) {
    start = 0;
  } else if (start < 0) {
    start = Math.max(this.length + start, 0);
  }

  if (stop == null) {
    stop = this.length - 1;
  } else if (stop < 0) {
    stop = this.length + stop;
  }

  if (start > stop || start >= this.length) {
    return [];
  }

  if (stop >= this.length) {
    stop = this.length - 1;
  }

  if (typeof options !== 'object') {
    options = {
      withScores: false,
    };
  }

  var i = 0;
  var length = stop - start + 1;
  try {
    var result = new Array(length);
  } catch(e) {
    console.log('start', start);
    console.log('stop', stop);
    console.log('Invalid length', length);
    throw e;
  }

  var node = start > 0 ? this._get(start) : this._head.next[0].next;

  if (options.withScores) {
    for (; length--; node = node.next[0].next) {
      result[i] = new Entry(node.key, node.value);
      i += 1;
    }
  } else {
    for (; length--; node = node.next[0].next) {
      result[i] = node.key;
      i += 1;
    }
  }

  return result;
};

Z.prototype.gut = function (min, max) {
  var result;
  var removed = 0;

  if (!this.length) {
    return 0;
  }

  if (min == null) {
    min = -Infinity;
  }
  if (max == null) {
    max = Infinity;
  }

  if (min <= this._head.next[0].next.value && max >= this._tail.value) {
    removed = this.length;
    this.empty();
    return removed;
  }

  var next, i;
  var node = this._head;
  var update = new Array(32);

  for (i = this._level - 1; i >= 0; i -= 1) {
    while ((next = node.next[i].next) && next.value < min) {
      node = next;
    }
    update[i] = node;
  }
  node = node.next[0].next;

  while (node && node.value <= max) {
    next = node.next[0].next;
    this._removeNode(node, update);
    delete this._map[node.key];
    removed += 1;
    node = next;
  }

  this.length -= removed;
  return removed;
};

Z.prototype.gutSlice = function (start, end) {
  var len = this.length;

  if (!len) {
    return 0;
  }

  if (start == null) {
    start = 0;
  } else if (start < 0) {
    start = Math.max(len + start, 0);
  }

  if (end == null) {
    end = len;
  } else if (end < 0) {
    end = len + end;
  }

  if (start > end || start >= len) {
    return 0;
  }
  if (end > len) {
    end = len;
  }

  if (start === 0 && end === len) {
    this.empty();
    return len;
  }

  var node = this._head;
  var update = new Array(32)
  var result, i, next;
  var traversed = -1;

  for (i = this._level - 1; i >= 0; i -= 1) {
    while ((next = node.next[i].next) && (traversed + node.next[i].span) < start) {
      traversed += node.next[i].span;
      node = next;
    }
    update[i] = node;
  }

  var removed = 0;
  traversed += 1;
  node = node.next[0].next;

  while (node && traversed < end) {
    next = node.next[0].next;
    this._removeNode(node, update);
    delete this._map[node.key];
    removed += 1;
    traversed += 1;
    node = next;
  }

  this.length -= removed;
  return removed;
};

// intersect values
Z.prototype.intersect = function () {
  var maps = slice.call(arguments);
  maps.unshift(this);
  return intersect.call(this, maps);
};

Z.prototype.intersectKeys = function () {
  var maps = slice.call(arguments);
  maps.unshift(this);
  return intersectKeys.call(this, maps);
};

Z.prototype.values = function () {
  if (!this.length) {
    return [];
  }

  var i;
  var array = new Array(this.length);
  var node = this._head.next[0].next;

  for (i = 0; node; node = node.next[0].next) {
    array[i] = node.value;
    i += 1;
  }

  return array;
};

Z.prototype.keys = function () {
  if (!this.length) {
    return [];
  }

  var i;
  var array = new Array(this.length);
  var node = this._head.next[0].next;

  for (i = 0; node; node = node.next[0].next) {
    array[i] = node.key;
    i += 1;
  }

  return array;
};

Z.prototype.toArray = function () {
  if (!this.length) {
    return [];
  }

  var i;
  var array = new Array(this.length);
  var node = this._head.next[0].next;

  for (i = 0; node; node = node.next[0].next) {
    array[i] = new Entry(node.key, node.value);
    i += 1;
  }

  return array;
};

Z.prototype.empty = function () {
  this.length = 0;
  this._level = 1;
  this._map = Object.create(null);
  this._head = new Node(32, null, 0);
  this._tail = null;

  for (var i = 0; i < 32; i += 1) {
    // hrm
    this._head.next[i] = new Level(null, 0);
  }
};

Z.prototype._insert = function (key, value) {
  // precondition: does not already have key
  // in unique mode, returns null if the value already exists
  var update = new Array(32);
  var rank = new Array(32);
  var node = this._head;
  var next = null;
  var i;

  for (i = this._level - 1; i >= 0; i -= 1) {
    rank[i] = (i === (this._level - 1) ? 0 : rank[i + 1]);
    // TODO: optimize some more?
    while ((next = node.next[i].next) && next.value <= value) {
      if (next.value === value) {
        if (this._unique) {
          return null;
        }
        if (next.key >= key) {
          break;
        }
      }
      rank[i] += node.next[i].span;
      node = next;
    }
    if (this._unique && node.value === value) {
      return null;
    }
    update[i] = node;
  }

  if (this._unique && node.value === value) {
    return null;
  }

  var level = randomLevel();
  if (level > this._level) {
    // TODO: optimize
    for (i = this._level; i < level; i += 1) {
      rank[i] = 0;
      update[i] = this._head;
      update[i].next[i].span = this.length;
    }
    this._level = level;
  }

  node = new Node(level, key, value);
  for (i = 0; i < level; i += 1) {
    node.next[i] = new Level(update[i].next[i].next, update[i].next[i].span - (rank[0] - rank[i]));
    update[i].next[i].next = node;
    update[i].next[i].span = (rank[0] - rank[i]) + 1;
  }

  for (i = level; i < this._level; i += 1) {
    update[i].next[i].span++;
  }

  node.prev = (update[0] === this._head) ? null : update[0];
  if (node.next[0].next) {
    node.next[0].next.prev = node;
  } else {
    this._tail = node;
  }

  this.length += 1;
  return node;
};

// TODO: optimize when index is less than log(N) from the end
Z.prototype._get = function (index) {

  var i;
  var node = this._head;
  var distance = -1;

  for (i = this._level - 1; i >= 0; i--) {
    while (node.next[i].next && (distance + node.next[i].span) <= index) {
      distance += node.next[i].span;
      node = node.next[i].next;
    }
    if (distance === index) {
      return node;
    }
  }
  return null;
};

Z.prototype._first = function (min) {
  var next;
  var node = this._tail;

  if (!node || node.value < min) {
    return null;
  }

  node = this._head;
  for (next = null, i = this._level - 1; i >= 0; i -= 1) {
    while ((next = node.next[i].next) && next.value < min) {
      node = next;
    }
  }

  return node.next[0].next;
};

Z.prototype._next = function (value, node) {
  // find node after node when value >= specified value
  //
  var next, i;

  if (!this._tail || this._tail.value < value) {
    return null;
  }

  // search upwards
  for (next = null; (next = node.next[node.next.length - 1].next) && next.value < value; ) {
    node = next;
  }
  if (node.value === value) {
    return node;
  }

  // search downwards
  for (i = node.next.length - 1; i >= 0; i -= 1) {
    while ((next = node.next[i].next) && next.value < value) {
      node = next;
    }

    if (node.value === value) {
      return node;
    }
  }
  return node.next[0].next;
};

Z.prototype._remove = function (key, value) {
  var update = new Array(32);
  var node = this._head;
  var i, next;

  for (i = this._level - 1; i >= 0; i -= 1) {
    while ((next = node.next[i].next) && (next.value < value || (next.value === value && next.key < key))) {
      node = next;
    }
    update[i] = node;
  }

  node = node.next[0].next;

  if (!node || value !== node.value || node.key !== key) {
    return false;
  }

  // delete
  this._removeNode(node, update);
  this.length -= 1;
};

Z.prototype._removeNode = function (node, update) {
  var next = null;
  var i = 0;
  var n = this._level;

  for (; i < n; i += 1) {
    if (update[i].next[i].next === node) {
      update[i].next[i].span += node.next[i].span - 1;
      update[i].next[i].next = node.next[i].next;
    } else {
      update[i].next[i].span -= 1;
    }
  }
  if (next = node.next[0].next) {
    next.prev = node.prev;
  } else {
    this._tail = node.prev;
  }

  while (this._level > 1 && !this._head.next[this._level - 1].next) {
    this._level -= 1;
  }
};

module.exports = Z;
