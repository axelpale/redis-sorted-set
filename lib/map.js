var intersect = require('./intersect');

var slice = Array.prototype.slice;

var P = 1 / Math.E;

function randomLevel() {
  var level = 1;
  while (Math.random() < P)
    level++;
  return level < 32 ? level : 32;
}

function Level(next, span) {
  this.next = next;
  this.span = span;
}

// value is score, sorted
// key is obj, unique
function Node(level, key, value) {
  this.key = key;
  this.value = value;
  this.next = new Array(level);
  this.prev = null;
}

function Entry(key, value) {
  this.key = key;
  this.value = value;
}

function Map(options) {
  if (!(this instanceof Map))
    return new Map();
  options || (options = {});
  this._unique = !!options.unique;
  this.empty();
}

Map.intersect = function() {
  return intersect.call(Map, slice.call(arguments));
};

Map.prototype.set = function(key, value) {
  var current;
  if (key === '__proto__')
    throw new Error('invalid key __proto__');
  if (value == null)
    return this.del(key);
  current = this._map[key];
  if (current !== undefined) {
    if (value === current)
      return current;
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

Map.prototype.has = function(key) {
  return this._map[key] !== undefined;
};

Map.prototype.get = function(key) {
  var value = this._map[key];
  return value === undefined ? null : value;
};

Map.prototype.del = function(key) {
  var value = this._map[key];
  if (value !== undefined) {
    this._remove(key, value);
    delete this._map[key];
    return value;
  }
  return null;
};

Map.prototype.rank = function(key) {
  var value = this._map[key];
  if (value === undefined)
    return -1;
  var i = this._level - 1, node = this._head, next = null, rank = -1;
  for (; i >= 0; i--) {
    while ((next = node.next[i].next) && (next.value < value || (next.value === value && next.key <= key))) {
      rank += node.next[i].span;
      node = next;
    }
    if (node.key && node.key === key) {
      return rank;
    }
  }
  return -1;
};

Map.prototype.count = function(min, max) {
  if (!this.length)
    return 0;
  min == null && (min = -Infinity);
  max == null && (max = Infinity);
  if (min <= this._head.next[0].next.value && max >= this._tail.value)
    return this.length;
  if (max < min || min > this._tail.value || max < this._head.next[0].next.value)
    return 0;
  var node = this._first(min), count = 0;
  if (!node)
    return 0;
  for (var i = node.next.length - 1; i >= 0; i--) {
    while (node.next[i].next && node.next[i].next.value <= max) {
      count += node.next[i].span;
      node = node.next[i].next;
    }
  }
  // feels hacky and error prone
  return count && count + 1;
};

Map.prototype.range = function(min, max) {
  if (!this.length)
    return [];
  min == null && (min = -Infinity);
  max == null && (max = Infinity);
  if (min <= this._head.next[0].next.value && max >= this._tail.value)
    return this.toArray();
  if (max < min || min > this._tail.value || max < this._head.next[0].next.value)
    return [];
  var node = this._first(min), result = [];
  // if (!node)
  //   return result;
  for (; node && node.value <= max; node = node.next[0].next)
    result.push(new Entry(node.key, node.value));
  return result;
};

Map.prototype.slice = function(start, end) {
  if (start == null) start = 0;
  else if (start < 0) start = Math.max(this.length + start, 0);
  if (end == null) end = this.length;
  else if (end < 0) end = this.length + end;

  if (start > end || start >= this.length)
    return [];
  if (end > this.length)
    end = this.length;

  if (start === 0 && end === this.length)
    return this.toArray();

  var i = 0, length = end - start, result = new Array(length);
  var node = start > 0 ? this._get(start) : this._head.next[0].next;

  for (; length--; node = node.next[0].next)
    result[i++] = new Entry(node.key, node.value);

  return result;
};

Map.prototype.gut = function(min, max) {
  var result, removed = 0;
  if (!this.length)
    return 0;
  min == null && (min = -Infinity);
  max == null && (max = Infinity);
  if (min <= this._head.next[0].next.value && max >= this._tail.value)
    return removed = this.length, this.empty(), removed;
  var next, node = this._head, update = new Array(32), i = this._level - 1;
  for (; i >= 0; i--) {
    while ((next = node.next[i].next) && next.value < min)
      node = next;
    update[i] = node;
  }
  node = node.next[0].next;

  while (node && node.value <= max) {
    next = node.next[0].next;
    this._removeNode(node, update);
    delete this._map[node.key];
    removed++;
    node = next;
  }
  this.length -= removed;
  return removed;
};

Map.prototype.gutSlice = function(start, end) {
  var len = this.length;
  if (!len)
    return 0;
  if (start == null) start = 0;
  else if (start < 0) start = Math.max(len + start, 0);
  if (end == null) end = len;
  else if (end < 0) end = len + end;

  if (start > end || start >= len)
    return 0;
  if (end > len)
    end = len;

  if (start === 0 && end === len)
    return this.empty(), len;

  var node = this._head, update = new Array(32), result, traversed = -1, next;
  for (var i = this._level - 1; i >= 0; i--) {
    while ((next = node.next[i].next) && (traversed + node.next[i].span) < start) {
      traversed += node.next[i].span;
      node = next;
    }
    update[i] = node;
  }

  var removed = 0;
  traversed++;
  node = node.next[0].next;

  while (node && traversed < end) {
    next = node.next[0].next;
    this._removeNode(node, update);
    delete this._map[node.key];
    removed++;
    traversed++;
    node = next;
  }
  this.length -= removed;
  return removed;
};

// intersect values
Map.prototype.intersect = function() {
  var maps = slice.call(arguments);
  maps.unshift(this);
  return intersect.call(this, maps);
};

Map.prototype.intersectKeys = function() {
  var maps = slice.call(arguments);
  maps.unshift(this);
  return intersectKeys.call(this, maps);
};

Map.prototype.values = function() {
  if (!this.length)
    return [];
  var i = 0, array = new Array(this.length), node = this._head.next[0].next;
  for (; node; node = node.next[0].next)
    array[i++] = node.value;
  return array;
};

Map.prototype.keys = function() {
  if (!this.length)
    return [];
  var i = 0, array = new Array(this.length), node = this._head.next[0].next;
  for (; node; node = node.next[0].next)
    array[i++] = node.key;
  return array;
};

Map.prototype.toArray = function() {
  if (!this.length)
    return [];
  var i = 0, array = new Array(this.length), node = this._head.next[0].next;
  for (; node; node = node.next[0].next)
    array[i++] = new Entry(node.key, node.value);
  return array;
};

Map.prototype.empty = function() {
  this.length = 0;
  this._level = 1;
  this._map = Object.create(null);
  this._head = new Node(32, null, 0);
  this._tail = null;
  for (var i = 0; i < 32; i++) {
    // hrm
    this._head.next[i] = new Level(null, 0);
  }
};

// precondition: does not already have key
// in unique mode, returns null if the value already exists
Map.prototype._insert = function(key, value) {
  var update = new Array(32), rank = new Array(32), node = this._head, next = null, i = this._level - 1;
  for (; i >= 0; i--) {
    rank[i] = i === (this._level - 1) ? 0 : rank[i + 1];
    // TODO: optimize some more?
    while ((next = node.next[i].next) && next.value <= value) {
      if (next.value === value) {
        if (this._unique)
          return null;
        if (next.key >= key)
          break;
      }
      rank[i] += node.next[i].span;
      node = next;
    }
    if (this._unique && node.value === value)
      return null;
    update[i] = node;
  }
  if (this._unique && node.value === value)
    return null;
  var level = randomLevel();
  if (level > this._level) {
    // TODO: optimize
    for (i = this._level; i < level; i++) {
      rank[i] = 0;
      update[i] = this._head;
      update[i].next[i].span = this.length;
    }
    this._level = level;
  }
  node = new Node(level, key, value);
  for (i = 0; i < level; i++) {
    node.next[i] = new Level(update[i].next[i].next, update[i].next[i].span - (rank[0] - rank[i]));
    update[i].next[i].next = node;
    update[i].next[i].span = (rank[0] - rank[i]) + 1;
  }

  for (i = level; i < this._level; i++)
    update[i].next[i].span++;

  node.prev = (update[0] === this._head) ? null : update[0];
  if (node.next[0].next)
    node.next[0].next.prev = node;
  else
    this._tail = node;
  this.length++;
  return node;
};

// TODO: optimize when index is less than log(N) from the end
Map.prototype._get = function(index) {
  var node = this._head, distance = -1;
  for (var i = this._level - 1; i >= 0; i--) {
    while (node.next[i].next && (distance + node.next[i].span) <= index) {
      distance += node.next[i].span;
      node = node.next[i].next;
    }
    if (distance === index)
      return node;
  }
  return null;
};

Map.prototype._first = function(min) {
  var node = this._tail;
  if (!node || node.value < min)
    return null;
  node = this._head;
  for (var next = null, i = this._level - 1; i >= 0; i--)
    while ((next = node.next[i].next) && next.value < min)
      node = next;
  return node.next[0].next;
};

// find node after node when value >= specified value
Map.prototype._next = function(value, node) {
  if (!this._tail || this._tail.value < value)
    return null;
  // search upwards
  for (var next = null; (next = node.next[node.next.length - 1].next) && next.value < value; )
    node = next;
  if (node.value === value)
    return node;
  // search downwards
  for (var i = node.next.length - 1; i >= 0; i--) {
    while ((next = node.next[i].next) && next.value < value)
      node = next;
    if (node.value === value)
      return node;
  }
  return node.next[0].next;
};

Map.prototype._remove = function(key, value) {
  var update = new Array(32), node = this._head, next;
  for (var i = this._level - 1; i >= 0; i--) {
    while ((next = node.next[i].next) && (next.value < value || (next.value === value && next.key < key))) {
      node = next;
    }
    update[i] = node;
  }
  node = node.next[0].next;
  if (!node || value !== node.value || node.key !== key)
    return false;
  // delete
  this._removeNode(node, update);
  this.length--;
};

Map.prototype._removeNode = function(node, update) {
  var next = null, i = 0, n = this._level;
  for (; i < n; i++) {
    if (update[i].next[i].next === node) {
      update[i].next[i].span += node.next[i].span - 1;
      update[i].next[i].next = node.next[i].next;
    } else {
      update[i].next[i].span--;
    }
  }
  if (next = node.next[0].next)
    next.prev = node.prev;
  else
    this._tail = node.prev;
  while (this._level > 1 && !this._head.next[this._level - 1].next)
    this._level--;
};

module.exports = Map;
