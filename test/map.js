var Map = require('../lib/map');

describe('skip map', function() {
  it('should support basic operations', function() {
    var map = new Map();

    expect(map).to.have.length(0);
    expect(map.toArray()).to.eql([]);
    expect(map.slice()).to.eql([]);
    expect(map.range()).to.eql([]);

    expect(function() {
      map.set('__proto__', 14);
    }).to.throw();

    map.set('5a600e16', 8);
    map.set('5a600e17', 9);
    expect(map.set('5a600e18', 10)).to.equal(null);
    expect(map.set('5a600e17', 12)).to.equal(9);

    expect(map).to.have.length(3);
    expect(map.toArray()).to.eql([{
      key: '5a600e16',
      value: 8
    }, {
      key: '5a600e18',
      value: 10
    }, {
      key: '5a600e17',
      value: 12
    }]);
    expect(map.toArray()).to.eql(map.slice());
    expect(map.toArray()).to.eql(map.range());

    expect(map.has('5a600e16')).to.be.ok;
    expect(map.has('5a600e17')).to.be.ok;
    expect(map.has('5a600e18')).to.be.ok;
    expect(map.has('5a600e19')).to.not.be.ok;

    expect(map.get('5a600e16')).to.equal(8);
    expect(map.get('5a600e17')).to.equal(12);
    expect(map.get('5a600e18')).to.equal(10);
    expect(map.get('5a600e19')).to.equal(null);

    expect(map.del('5a600e16')).to.equal(8);

    expect(map).to.have.length(2);

    expect(map.del('5a600e16')).to.equal(null);

    expect(map).to.have.length(2);

    expect(map.has('5a600e16')).to.not.be.ok;

    expect(map.toArray()).to.eql([{
      key: '5a600e18',
      value: 10
    }, {
      key: '5a600e17',
      value: 12
    }]);
    expect(map.toArray()).to.eql(map.slice());
    expect(map.toArray()).to.eql(map.range());

    map.set('5a600e16', 10);
    map.set('5a600e10', 16);
    map.set('5a600e11', 6);
    map.set('5a600e12', 17);
    map.set('5a600e13', 11);
    map.set('5a600e14', 14);
    map.set('5a600e15', 19);
    map.set('5a600e16', 3);

    expect(map).to.have.length(9);

    // no change, so should be O(1)
    map.set('5a600e17', 12);

    expect(map.rank('5a600e17')).to.equal(4);

    expect(map).to.have.length(9);
    expect(map.toArray()).to.eql([{
      key: '5a600e16',
      value: 3
    }, {
      key: '5a600e11',
      value: 6
    }, {
      key: '5a600e18',
      value: 10
    }, {
      key: '5a600e13',
      value: 11
    }, {
      key: '5a600e17',
      value: 12
    }, {
      key: '5a600e14',
      value: 14
    }, {
      key: '5a600e10',
      value: 16
    }, {
      key: '5a600e12',
      value: 17
    }, {
      key: '5a600e15',
      value: 19
    }]);
    expect(map.toArray()).to.eql(map.slice());
    expect(map.toArray()).to.eql(map.range());

    expect(map.range(14, 16)).to.eql([{
      key: '5a600e14',
      value: 14
    }, {
      key: '5a600e10',
      value: 16
    }]);
  });

  describe('#set', function() {
    it('should implicitly delete', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.set('5a600e14', null)).to.equal(14);
      expect(map.set('5a600e19', null)).to.equal(null);

      expect(map).to.have.length(8);
    });
  });

  describe('#keys', function() {
    it('should return the keys', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.keys()).to.eql(['5a600e16', '5a600e11', '5a600e18', '5a600e13',
        '5a600e17', '5a600e14', '5a600e10', '5a600e12', '5a600e15']);
    });
  });

  describe('#values', function() {
    it('should return the values', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.values()).to.eql([3, 6, 10, 11, 12, 14, 16, 17, 19]);
    });
  });

  describe('#range', function() {
    it('should support special ranges', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.range(14)).to.eql([{
        key: '5a600e14',
        value: 14
      }, {
        key: '5a600e10',
        value: 16
      }, {
        key: '5a600e12',
        value: 17
      }, {
        key: '5a600e15',
        value: 19
      }]);

      expect(map.range(null, 10)).to.eql([{
        key: '5a600e16',
        value: 3
      }, {
        key: '5a600e11',
        value: 6
      }, {
        key: '5a600e18',
        value: 10
      }]);

      expect(map.range(-Infinity, Infinity)).to.eql(map.toArray());
      expect(map.range(null, null)).to.eql(map.toArray());
    });
  });

  describe('#count', function() {
    it('should count elements', function() {
      var map = new Map();

      expect(map.count()).to.equal(0);

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);
      map.set('5a600e19', 14);
      map.set('5a600f00', 30.0);
      map.set('5a600f01', 30.5);
      map.set('5a600f02', 31.0);
      map.set('5a600f03', 31.5);
      map.set('5a600f04', 32.0);
      map.set('5a600f05', 32.0);
      map.set('5a600f06', 32.0);

      expect(map.count()).to.eql(map.range().length);
      expect(map.count(8)).to.eql(map.range(8).length);
      expect(map.count(3, 7)).to.eql(map.range(3, 7).length);
      expect(map.count(5, 14)).to.eql(map.range(5, 14).length);
      expect(map.count(5, 5)).to.eql(map.range(5, 5).length);
      expect(map.count(5, 0)).to.eql(map.range(5, 0).length);
      expect(map.count(30, 32)).to.eql(map.range(30, 32).length);
      expect(map.count(40)).to.eql(map.range(40).length);
    });
  });

  describe('#slice', function() {
    it('should support special ranges', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      var array = map.toArray();

      expect(map.slice()).to.eql(array);
      expect(map.slice(2)).to.eql(array.slice(2));
      expect(map.slice(8)).to.eql(array.slice(8));
      expect(map.slice(0, 3)).to.eql(array.slice(0, 3));
      expect(map.slice(-1)).to.eql(array.slice(-1));
      expect(map.slice(-4)).to.eql(array.slice(-4));
      expect(map.slice(-4, -2)).to.eql(array.slice(-4, -2));
      expect(map.slice(-4, map.length + 1000)).to.eql(array.slice(-4, map.length + 1000));
    });
  });

  describe('#intersect', function() {
    it('should intersect two sets', function() {
      var a = new Map(), b = new Map();

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

      expect(Map.intersect(a, b)).to.eql(['5a600e10', '5a600e14', '5a600e17',
        '5a600e19', '5a600e1c', '5a600e15', '5a600e1b']);
      expect(Map.intersect(b, a)).to.eql(['5a600e1b', '5a600e14', '5a600e1c',
        '5a600e15', '5a600e19', '5a600e10', '5a600e17']);
    });

    it('should intersect three sets', function() {
      var a = new Map(), b = new Map(), c = new Map();

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

      expect(Map.intersect(c, a, b)).to.eql(['5a600e10', '5a600e14', '5a600e17',
        '5a600e1c']);

      expect(Map.intersect(c, a, b)).to.eql(c.intersect(a, b));
    });

    it('should intersect four sets', function() {
      var a = new Map(), b = new Map(), c = new Map(), d = new Map();

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

      d.set('5a600e1c', 400);
      d.set('5a600e17', 500);
      d.set('5a600e1f', 600);
      d.set('5a600e20', 700);

      expect(Map.intersect(d, c, a, b)).to.eql(['5a600e17', '5a600e1c']);

      expect(Map.intersect(d, c, a, b)).to.eql(d.intersect(c, a, b));
    });
  });

  describe('#rank', function() {
    it('should get the correct rank', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.rank('5a600e12')).to.equal(7);
      expect(map.rank('5a600e13')).to.equal(3);
      expect(map.rank('5a600e16')).to.equal(0);
      expect(map.rank('5a600e15')).to.equal(8);

      expect(map.rank('not in set')).to.equal(-1);
    });
  });

  describe('#del', function() {
    it('should delete special elements', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.del('5a600e15')).to.equal(19);

      expect(map).to.have.length(8);

      expect(map.del('5a600e16')).to.equal(3);

      expect(map).to.have.length(7);

      expect(map.toArray()).to.eql([{
        key: '5a600e11',
        value: 6
      }, {
        key: '5a600e18',
        value: 10
      }, {
        key: '5a600e13',
        value: 11
      }, {
        key: '5a600e17',
        value: 12
      }, {
        key: '5a600e14',
        value: 14
      }, {
        key: '5a600e10',
        value: 16
      }, {
        key: '5a600e12',
        value: 17
      }]);
    });

    it('should delete many elements', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.del('5a600e11')).to.equal(6);
      expect(map.del('5a600e13')).to.equal(11);
      expect(map.del('5a600e14')).to.equal(14);
      expect(map.del('5a600e15')).to.equal(19);
      expect(map.del('5a600e16')).to.equal(3);
      expect(map.del('5a600e17')).to.equal(12);

      expect(map.length).to.equal(3);
      expect(map.toArray()).to.eql([{
        key: '5a600e18',
        value: 10
      }, {
        key: '5a600e10',
        value: 16
      }, {
        key: '5a600e12',
        value: 17
      }]);
    });
  });

  describe('#gut', function() {
    it('should strip out a range of elements', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.gut(4, 14)).to.equal(5);
      expect(map).to.have.length(4);

      expect(map.toArray()).to.eql([{
        key: '5a600e16',
        value: 3
      }, {
        key: '5a600e10',
        value: 16
      }, {
        key: '5a600e12',
        value: 17
      }, {
        key: '5a600e15',
        value: 19
      }]);
    });

    it('should strip out all the elements', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.gut(3, 19)).to.equal(9);
      expect(map).to.have.length(0);

      expect(map.toArray()).to.eql([]);
    });
  });

  describe('#gutSlice', function() {
    it('should strip out a slice of elements', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.gutSlice(1, 6)).to.equal(5);
      expect(map).to.have.length(4);

      expect(map.toArray()).to.eql([{
        key: '5a600e16',
        value: 3
      }, {
        key: '5a600e10',
        value: 16
      }, {
        key: '5a600e12',
        value: 17
      }, {
        key: '5a600e15',
        value: 19
      }]);
    });

    it('should strip out all elements', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(map.gutSlice(0, 9)).to.equal(9);
      expect(map).to.have.length(0);

      expect(map.toArray()).to.eql([]);
    });
  });

  describe('#empty', function() {
    it('should remove all elements', function() {
      var map = new Map();

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      map.empty();

      expect(map).to.have.length(0);
      expect(map.toArray()).to.eql([]);
    });
  });

  describe('unique', function() {
    it('should ensure values are unique', function() {
      var map = new Map({unique: true});

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(function() {
        map.set('5a600e19', 11);
      }).to.throw(/unique/);

      // quick exit test
      expect(function() {
        map.set('5a600dff', map._head.next[map._level - 1].next.value);
      }).to.throw(/unique/);

      // this test ensures the key < key check doesn't come into play
      expect(function() {
        map.set('5a600dff', 11);
      }).to.throw(/unique/);

      expect(function() {
        map.set('5a600e18', 10);
      }).to.not.throw();

      expect(map).to.have.length(9);

      expect(map.toArray()).to.eql([{
        key: '5a600e16',
        value: 3
      }, {
        key: '5a600e11',
        value: 6
      }, {
        key: '5a600e18',
        value: 10
      }, {
        key: '5a600e13',
        value: 11
      }, {
        key: '5a600e17',
        value: 12
      }, {
        key: '5a600e14',
        value: 14
      }, {
        key: '5a600e10',
        value: 16
      }, {
        key: '5a600e12',
        value: 17
      }, {
        key: '5a600e15',
        value: 19
      }])
    });

    it('should revert keys if constraint broken during update', function() {
      var map = new Map({unique: true});

      map.set('5a600e10', 16);
      map.set('5a600e11', 6);
      map.set('5a600e12', 17);
      map.set('5a600e13', 11);
      map.set('5a600e14', 14);
      map.set('5a600e15', 19);
      map.set('5a600e16', 3);
      map.set('5a600e17', 12);
      map.set('5a600e18', 10);

      expect(function() {
        map.set('5a600e13', 14);
      }).to.throw(/unique/);

      expect(map).to.have.length(9);
      expect(map.get('5a600e13')).to.equal(11);
    });
  });
});
