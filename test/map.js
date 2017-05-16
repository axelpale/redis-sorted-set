var SortedSet = require('../lib/set');

describe('skip map', function() {
  it('should support basic operations', function() {
    var ss = new SortedSet();

    expect(ss).to.have.length(0);
    expect(ss.toArray()).to.eql([]);
    expect(ss.slice()).to.eql([]);
    expect(ss.range()).to.eql([]);

    expect(function() {
      ss.set('__proto__', 14);
    }).to.throw();

    ss.set('5a600e16', 8);
    ss.set('5a600e17', 9);
    expect(ss.set('5a600e18', 10)).to.equal(null);
    expect(ss.set('5a600e17', 12)).to.equal(9);

    expect(ss).to.have.length(3);
    expect(ss.toArray()).to.eql([{
      key: '5a600e16',
      value: 8
    }, {
      key: '5a600e18',
      value: 10
    }, {
      key: '5a600e17',
      value: 12
    }]);
    expect(ss.toArray()).to.eql(ss.slice());
    expect(ss.toArray()).to.eql(ss.range());

    expect(ss.has('5a600e16')).to.be.ok;
    expect(ss.has('5a600e17')).to.be.ok;
    expect(ss.has('5a600e18')).to.be.ok;
    expect(ss.has('5a600e19')).to.not.be.ok;

    expect(ss.get('5a600e16')).to.equal(8);
    expect(ss.get('5a600e17')).to.equal(12);
    expect(ss.get('5a600e18')).to.equal(10);
    expect(ss.get('5a600e19')).to.equal(null);

    expect(ss.del('5a600e16')).to.equal(8);

    expect(ss).to.have.length(2);

    expect(ss.del('5a600e16')).to.equal(null);

    expect(ss).to.have.length(2);

    expect(ss.has('5a600e16')).to.not.be.ok;

    expect(ss.toArray()).to.eql([{
      key: '5a600e18',
      value: 10
    }, {
      key: '5a600e17',
      value: 12
    }]);
    expect(ss.toArray()).to.eql(ss.slice());
    expect(ss.toArray()).to.eql(ss.range());

    ss.set('5a600e16', 10);
    ss.set('5a600e10', 16);
    ss.set('5a600e11', 6);
    ss.set('5a600e12', 17);
    ss.set('5a600e13', 11);
    ss.set('5a600e14', 14);
    ss.set('5a600e15', 19);
    ss.set('5a600e16', 3);

    expect(ss).to.have.length(9);

    // no change, so should be O(1)
    ss.set('5a600e17', 12);

    expect(ss.rank('5a600e17')).to.equal(4);

    expect(ss).to.have.length(9);
    expect(ss.toArray()).to.eql([{
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
    expect(ss.toArray()).to.eql(ss.slice());
    expect(ss.toArray()).to.eql(ss.range());

    expect(ss.range(14, 16)).to.eql([{
      key: '5a600e14',
      value: 14
    }, {
      key: '5a600e10',
      value: 16
    }]);
  });

  describe('#set', function() {
    it('should implicitly delete', function() {
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.set('5a600e14', null)).to.equal(14);
      expect(ss.set('5a600e19', null)).to.equal(null);

      expect(ss).to.have.length(8);
    });
  });

  describe('#keys', function() {
    it('should return the keys', function() {
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.keys()).to.eql(['5a600e16', '5a600e11', '5a600e18', '5a600e13',
        '5a600e17', '5a600e14', '5a600e10', '5a600e12', '5a600e15']);
    });
  });

  describe('#values', function() {
    it('should return the values', function() {
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.values()).to.eql([3, 6, 10, 11, 12, 14, 16, 17, 19]);
    });
  });

  describe('#range', function() {
    it('should support special ranges', function() {
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.range(14)).to.eql([{
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

      expect(ss.range(null, 10)).to.eql([{
        key: '5a600e16',
        value: 3
      }, {
        key: '5a600e11',
        value: 6
      }, {
        key: '5a600e18',
        value: 10
      }]);

      expect(ss.range(-Infinity, Infinity)).to.eql(ss.toArray());
      expect(ss.range(null, null)).to.eql(ss.toArray());
    });
  });

  describe('#count', function() {
    it('should count elements', function() {
      var ss = new SortedSet();

      expect(ss.count()).to.equal(0);

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);
      ss.set('5a600e19', 14);
      ss.set('5a600f00', 30.0);
      ss.set('5a600f01', 30.5);
      ss.set('5a600f02', 31.0);
      ss.set('5a600f03', 31.5);
      ss.set('5a600f04', 32.0);
      ss.set('5a600f05', 32.0);
      ss.set('5a600f06', 32.0);

      expect(ss.count()).to.eql(ss.range().length);
      expect(ss.count(8)).to.eql(ss.range(8).length);
      expect(ss.count(3, 7)).to.eql(ss.range(3, 7).length);
      expect(ss.count(5, 14)).to.eql(ss.range(5, 14).length);
      expect(ss.count(5, 5)).to.eql(ss.range(5, 5).length);
      expect(ss.count(5, 0)).to.eql(ss.range(5, 0).length);
      expect(ss.count(30, 32)).to.eql(ss.range(30, 32).length);
      expect(ss.count(40)).to.eql(ss.range(40).length);
    });
  });

  describe('#slice', function() {
    it('should support special ranges', function() {
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      var array = ss.toArray();

      expect(ss.slice()).to.eql(array);
      expect(ss.slice(2)).to.eql(array.slice(2));
      expect(ss.slice(8)).to.eql(array.slice(8));
      expect(ss.slice(0, 3)).to.eql(array.slice(0, 3));
      expect(ss.slice(-1)).to.eql(array.slice(-1));
      expect(ss.slice(-4)).to.eql(array.slice(-4));
      expect(ss.slice(-4, -2)).to.eql(array.slice(-4, -2));
      expect(ss.slice(-4, ss.length + 1000))
        .to.eql(array.slice(-4, ss.length + 1000));
    });
  });

  describe('#intersect', function() {
    it('should intersect two sets', function() {
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

      expect(SortedSet.intersect(a, b)).to.eql(['5a600e10', '5a600e14',
        '5a600e17', '5a600e19', '5a600e1c', '5a600e15', '5a600e1b']);
      expect(SortedSet.intersect(b, a)).to.eql(['5a600e1b', '5a600e14',
        '5a600e1c', '5a600e15', '5a600e19', '5a600e10', '5a600e17']);
    });

    it('should intersect three sets', function() {
      var a = new SortedSet(), b = new SortedSet(), c = new SortedSet();

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

      expect(SortedSet.intersect(c, a, b)).to.eql(['5a600e10', '5a600e14',
        '5a600e17', '5a600e1c']);

      expect(SortedSet.intersect(c, a, b)).to.eql(c.intersect(a, b));
    });

    it('should intersect four sets', function() {
      var a = new SortedSet();
      var b = new SortedSet();
      var c = new SortedSet();
      var d = new SortedSet();

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

      expect(SortedSet.intersect(d, c, a, b)).to.eql(['5a600e17', '5a600e1c']);

      expect(SortedSet.intersect(d, c, a, b)).to.eql(d.intersect(c, a, b));
    });
  });

  describe('#rank', function() {
    it('should get the correct rank', function() {
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.rank('5a600e12')).to.equal(7);
      expect(ss.rank('5a600e13')).to.equal(3);
      expect(ss.rank('5a600e16')).to.equal(0);
      expect(ss.rank('5a600e15')).to.equal(8);

      expect(ss.rank('not in set')).to.equal(-1);
    });
  });

  describe('#del', function() {
    it('should delete special elements', function() {
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.del('5a600e15')).to.equal(19);

      expect(ss).to.have.length(8);

      expect(ss.del('5a600e16')).to.equal(3);

      expect(ss).to.have.length(7);

      expect(ss.toArray()).to.eql([{
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
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.del('5a600e11')).to.equal(6);
      expect(ss.del('5a600e13')).to.equal(11);
      expect(ss.del('5a600e14')).to.equal(14);
      expect(ss.del('5a600e15')).to.equal(19);
      expect(ss.del('5a600e16')).to.equal(3);
      expect(ss.del('5a600e17')).to.equal(12);

      expect(ss.length).to.equal(3);
      expect(ss.toArray()).to.eql([{
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
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.gut(4, 14)).to.equal(5);
      expect(ss).to.have.length(4);

      expect(ss.toArray()).to.eql([{
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
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.gut(3, 19)).to.equal(9);
      expect(ss).to.have.length(0);

      expect(ss.toArray()).to.eql([]);
    });
  });

  describe('#gutSlice', function() {
    it('should strip out a slice of elements', function() {
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.gutSlice(1, 6)).to.equal(5);
      expect(ss).to.have.length(4);

      expect(ss.toArray()).to.eql([{
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
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      expect(ss.gutSlice(0, 9)).to.equal(9);
      expect(ss).to.have.length(0);

      expect(ss.toArray()).to.eql([]);
    });
  });

  describe('#empty', function() {
    it('should remove all elements', function() {
      var ss = new SortedSet();

      ss.set('5a600e10', 16);
      ss.set('5a600e11', 6);
      ss.set('5a600e12', 17);
      ss.set('5a600e13', 11);
      ss.set('5a600e14', 14);
      ss.set('5a600e15', 19);
      ss.set('5a600e16', 3);
      ss.set('5a600e17', 12);
      ss.set('5a600e18', 10);

      ss.empty();

      expect(ss).to.have.length(0);
      expect(ss.toArray()).to.eql([]);
    });
  });

  describe('unique', function() {
    it('should ensure values are unique', function() {
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

      expect(function() {
        ss.set('5a600e19', 11);
      }).to.throw(/unique/);

      // quick exit test
      expect(function() {
        ss.set('5a600dff', ss._head.next[ss._level - 1].next.value);
      }).to.throw(/unique/);

      // this test ensures the key < key check doesn't come into play
      expect(function() {
        ss.set('5a600dff', 11);
      }).to.throw(/unique/);

      expect(function() {
        ss.set('5a600e18', 10);
      }).to.not.throw();

      expect(ss).to.have.length(9);

      expect(ss.toArray()).to.eql([{
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

      expect(function() {
        ss.set('5a600e13', 14);
      }).to.throw(/unique/);

      expect(ss).to.have.length(9);
      expect(ss.get('5a600e13')).to.equal(11);
    });
  });
});
