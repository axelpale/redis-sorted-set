# redis-sorted-set

A JavaScript implementation of Redis' [Sorted Sets](https://redis.io/commands#sorted_set). Keeps a set of keys in order based on their value. Uses skip lists under the hood, [like Redis does](http://stackoverflow.com/a/9626334/638546).

This is a fork of the brilliant but abandoned [sorted-map](https://www.npmjs.com/package/sorted-map) package by [Eli Skeggs](https://github.com/skeggse).


## Install

```sh
$ npm install redis-sorted-set
```


## Test

Run any of the following:

```sh
$ mocha
$ npm test
```

_Note:_ remember to `npm install`!


## API

```js
var SortedSet = require('redis-sorted-set');

var ss = new SortedSet();

// average O(log(N))
ss.set('5a600e16', 8);
ss.set('5a600e17', 9);
ss.set('5a600e18', 10); // => null
ss.set('5a600e17', 12); // => 9

// average O(1)
ss.has('5a600e17'); // => true

// average O(1)
ss.get('5a600e17'); // => 12

// average O(log(N))
ss.del('5a600e16'); // => 8

// average O(1)
ss.del('5a600e16'); // => null

ss.set('5a600e10', 16);
ss.set('5a600e11', 6);
ss.set('5a600e12', 17);
ss.set('5a600e13', 11);
ss.set('5a600e14', 14);
ss.set('5a600e15', 19);
ss.set('5a600e16', 3);

// average O(log(N)+M) where M is the number of elements between min and max
ss.range(14, 16); // [14-16]
// => [{key: '5a600e14', value: 14}, {key: '5a600e10', value: 16}]

ss.range(17); // [17-∞)
// => [{key: '5a600e12', value: 17}, {key: '5a600e15', value: 19}]

// average O(log(N)+log(M)) where M as in range
ss.count(14, 16); // => 2

// more or less indexOf for the sorted values
// average O(log(N))
ss.rank('5a600e16'); // => 0
ss.rank('5a600e13'); // => 3
ss.rank('5a600e14'); // => 5
ss.rank('5a600e15'); // => 8
ss.rank('5a600e19'); // => -1

// average O(log(N)+M) where M as in range
ss.slice(0, 3);
// => [{key: '5a600e16', value: 3},
//     {key: '5a600e11', value: 6},
//     {key: '5a600e18', value: 10}]

ss.slice(-1); // => [{key: '5a600e16', value: 3}]

ss.length; // => 9
```


## Intersection

```js
var a = new SortedSet(), b = new SortedSet();

a.set('5a600e10', 16);
a.set('5a600e12', 10);
a.set('5a600e14', 9);
a.set('5a600e15', 14);
a.set('5a600e17', 20);
a.set('5a600e18', 13);
a.set('5a600e19', 15);
a.set('5a600e1a', 19);
a.set('5a600e1b', 7);
a.set('5a600e1c', 13);
a.set('5a600e1e', 10);

b.set('5a600e10', 0);
b.set('5a600e11', 15);
b.set('5a600e13', 5);
b.set('5a600e14', 3);
b.set('5a600e15', 14);
b.set('5a600e17', 12);
b.set('5a600e19', 12);
b.set('5a600e1b', 16);
b.set('5a600e1c', 12);
b.set('5a600e1d', 17);
b.set('5a600e1f', 3);

SortedSet.intersect(a, b);
// => ['5a600e10', '5a600e14', '5a600e17', '5a600e19', '5a600e1c', '5a600e15', '5a600e1b']

SortedSet.intersect(b, a);
// => ['5a600e1b', '5a600e14', '5a600e1c', '5a600e15', '5a600e19', '5a600e10', '5a600e17']

// works, but not preferred
a.intersect(b);
// => ['5a600e10', '5a600e14', '5a600e17', '5a600e19', '5a600e1c', '5a600e15', '5a600e1b']

var c = new SortedSet();

c.set('5a600e10', 7);
c.set('5a600e12', 20);
c.set('5a600e13', 9);
c.set('5a600e14', 19);
c.set('5a600e16', 19);
c.set('5a600e17', 1);
c.set('5a600e18', 18);
c.set('5a600e1a', 6);
c.set('5a600e1c', 15);
c.set('5a600e1f', 4);

// for best performance, the smallest set should be first
SortedSet.intersect(c, a, b);
// => ['5a600e10', '5a600e14', '5a600e17', '5a600e1c']
```


## Unique

You can enable unique values with the unique option, which causes `set` to throw an error if the value provided already belongs to a different key.

```js
var ss = new SortedSet({unique: true});

ss.set('5a600e10', 16);
ss.set('5a600e11', 6);
ss.set('5a600e12', 17);
ss.set('5a600e13', 11);
ss.set('5a600e14', 14);
ss.set('5a600e15', 19);
ss.set('5a600e16', 3);
ss.set('5a600e17', 12);
ss.set('5a600e18', 10);

// currently O(log(N)) because it needs to attempt to insert the value
ss.set('5a600e19', 11); // throws
ss.set('5a600e14', 14); // => 14
```


## Licence

MIT
