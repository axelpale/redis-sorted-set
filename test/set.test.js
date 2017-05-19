var SortedSet = require('../lib/set');

describe('skip map', function () {
  it('should support basic operations', function () {
    var z = new SortedSet();

    expect(z).to.have.length(0);
    expect(z.toArray()).to.eql([]);
    expect(z.range()).to.eql([]);
    expect(z.rangeByScore()).to.eql([]);

    expect(function () {
      z.add('__proto__', 14);
    }).to.throw();

    z.add('5a600e16', 8);
    z.add('5a600e17', 9);
    expect(z.add('5a600e18', 10)).to.equal(null);
    expect(z.add('5a600e17', 12)).to.equal(9);

    expect(z).to.have.length(3);
    expect(z.toArray()).to.eql(['5a600e16', '5a600e18', '5a600e17']);
    expect(z.toArray()).to.eql(z.range(0, -1));
    expect(z.toArray()).to.eql(z.rangeByScore());

    expect(z.has('5a600e16')).to.be.ok;
    expect(z.has('5a600e17')).to.be.ok;
    expect(z.has('5a600e18')).to.be.ok;
    expect(z.has('5a600e19')).to.not.be.ok;

    expect(z.score('5a600e16')).to.equal(8);
    expect(z.score('5a600e17')).to.equal(12);
    expect(z.score('5a600e18')).to.equal(10);
    expect(z.score('5a600e19')).to.equal(null);

    expect(z.rem('5a600e16')).to.equal(8);

    expect(z).to.have.length(2);

    expect(z.rem('5a600e16')).to.equal(null);

    expect(z).to.have.length(2);

    expect(z.has('5a600e16')).to.not.be.ok;

    expect(z.toArray()).to.eql(['5a600e18','5a600e17']);
    expect(z.toArray({ withScores: true}))
      .to.eql(z.range(0, -1, { withScores: true }));
    expect(z.toArray()).to.eql(z.rangeByScore());

    z.add('5a600e16', 10);
    z.add('5a600e10', 16);
    z.add('5a600e11', 6);
    z.add('5a600e12', 17);
    z.add('5a600e13', 11);
    z.add('5a600e14', 14);
    z.add('5a600e15', 19);
    z.add('5a600e16', 3);

    expect(z).to.have.length(9);

    // no change, so should be O(1)
    z.add('5a600e17', 12);

    expect(z.rank('5a600e17')).to.equal(4);

    expect(z).to.have.length(9);
    expect(z.toArray()).to.eql([
      '5a600e16',
      '5a600e11',
      '5a600e18',
      '5a600e13',
      '5a600e17',
      '5a600e14',
      '5a600e10',
      '5a600e12',
      '5a600e15',
    ]);
    expect(z.toArray()).to.eql(z.range(0, -1));
    expect(z.toArray()).to.eql(z.rangeByScore());

    expect(z.rangeByScore(14, 16, { withScores: true })).to.eql([
      ['5a600e14', 14],
      ['5a600e10', 16],
    ]);
  });


  describe('#add', function () {
    it('should implicitly delete', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.add('5a600e14', null)).to.equal(14);
      expect(z.add('5a600e19', null)).to.equal(null);

      expect(z).to.have.length(8);
    });
  });


  describe('#empty', function () {
    it('should remove all elements', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      z.empty();

      expect(z).to.have.length(0);
      expect(z.toArray()).to.eql([]);
    });
  });


  describe('#incrBy(increment, key)', function () {
    it('should increase rank', function () {
      var z = new SortedSet();

      z.add('first', 1);
      z.add('second', 2);
      z.add('third', 3);
      z.add('fourth', 4);

      expect(z.incrBy(2, 'first')).to.equal(3);
      expect(z.rank('first')).to.equal(1);
    });

    it('should create if not found', function () {
      var z = new SortedSet();
      z.add('first', 1);
      z.incrBy(2, 'second');
      expect(z.card()).to.equal(2);
      expect(z.rank('second')).to.equal(1);
    });
  });


  describe('#keys', function () {
    it('should return the keys', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.keys()).to.eql(['5a600e16', '5a600e11', '5a600e18', '5a600e13',
        '5a600e17', '5a600e14', '5a600e10', '5a600e12', '5a600e15']);
    });
  });

  describe('#rangeByScore', function () {
    it('should support special ranges', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.rangeByScore(14, null, { withScores: true })).to.eql([
        ['5a600e14', 14],
        ['5a600e10', 16],
        ['5a600e12', 17],
        ['5a600e15', 19],
      ]);

      expect(z.rangeByScore(null, 10, { withScores: true })).to.eql([
        ['5a600e16', 3],
        ['5a600e11', 6],
        ['5a600e18', 10],
      ]);

      expect(z.rangeByScore(-Infinity, Infinity)).to.eql(z.toArray());
      expect(z.rangeByScore(null, null)).to.eql(z.toArray());
    });
  });

  describe('#count', function () {
    it('should count elements', function () {
      var z = new SortedSet();

      expect(z.count()).to.equal(0);

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);
      z.add('5a600e19', 14);
      z.add('5a600f00', 30.0);
      z.add('5a600f01', 30.5);
      z.add('5a600f02', 31.0);
      z.add('5a600f03', 31.5);
      z.add('5a600f04', 32.0);
      z.add('5a600f05', 32.0);
      z.add('5a600f06', 32.0);

      expect(z.count()).to.eql(z.rangeByScore().length);
      expect(z.count(8)).to.eql(z.rangeByScore(8).length);
      expect(z.count(3, 7)).to.eql(z.rangeByScore(3, 7).length);
      expect(z.count(5, 14)).to.eql(z.rangeByScore(5, 14).length);
      expect(z.count(5, 5)).to.eql(z.rangeByScore(5, 5).length);
      expect(z.count(5, 0)).to.eql(z.rangeByScore(5, 0).length);
      expect(z.count(30, 32)).to.eql(z.rangeByScore(30, 32).length);
      expect(z.count(40)).to.eql(z.rangeByScore(40).length);
    });
  });

  describe('#range', function () {
    it('should support special ranges', function () {
      var z = new SortedSet();
      z.add('first', 1);
      z.add('second', 2);
      z.add('third', 3);
      z.add('fourth', 4);

      var array = ['first', 'second', 'third', 'fourth'];

      expect(z.range()).to.eql(array);

      expect(z.range(2)).to.eql(array.slice(2));
      expect(z.range(8)).to.eql(array.slice(8));
      expect(z.range(0, 2)).to.eql(array.slice(0, 3));
      expect(z.range(-1)).to.eql(['fourth']);
      expect(z.range(-4)).to.eql(array);
      expect(z.range(-4, -2)).to.eql(array.slice(0, 3));
      expect(z.range(-4, z.length + 1000))
        .to.eql(array.slice(-4, z.length + 1000));
    });

    it('should support withScores', function () {
      var z = new SortedSet();
      z.add('first', 1);
      z.add('second', 2);

      expect(z.range(0, 0, { withScores: true}))
        .to.eql([ ['first', 1] ]);
    });
  });

  describe('#intersect', function () {
    it('should intersect two sets', function () {
      var a = new SortedSet(), b = new SortedSet();

      a.add('5a600e10', 16);
      a.add('5a600e12', 10);
      a.add('5a600e14', 9);
      a.add('5a600e15', 14);
      a.add('5a600e17', 20);
      a.add('5a600e18', 13);
      a.add('5a600e19', 15);
      a.add('5a600e1a', 19);
      a.add('5a600e1b', 7);
      a.add('5a600e1c', 13);
      a.add('5a600e1e', 10);

      b.add('5a600e10', 0);
      b.add('5a600e11', 15);
      b.add('5a600e13', 5);
      b.add('5a600e14', 3);
      b.add('5a600e15', 14);
      b.add('5a600e17', 12);
      b.add('5a600e19', 12);
      b.add('5a600e1b', 16);
      b.add('5a600e1c', 12);
      b.add('5a600e1d', 17);
      b.add('5a600e1f', 3);

      expect(SortedSet.intersect(a, b)).to.eql(['5a600e10', '5a600e14',
        '5a600e17', '5a600e19', '5a600e1c', '5a600e15', '5a600e1b']);
      expect(SortedSet.intersect(b, a)).to.eql(['5a600e1b', '5a600e14',
        '5a600e1c', '5a600e15', '5a600e19', '5a600e10', '5a600e17']);
    });

    it('should intersect three sets', function () {
      var a = new SortedSet(), b = new SortedSet(), c = new SortedSet();

      a.add('5a600e10', 16);
      a.add('5a600e12', 10);
      a.add('5a600e14', 9);
      a.add('5a600e15', 14);
      a.add('5a600e17', 20);
      a.add('5a600e18', 13);
      a.add('5a600e19', 15);
      a.add('5a600e1a', 19);
      a.add('5a600e1b', 7);
      a.add('5a600e1c', 13);
      a.add('5a600e1e', 10);

      b.add('5a600e10', 0);
      b.add('5a600e11', 15);
      b.add('5a600e13', 5);
      b.add('5a600e14', 3);
      b.add('5a600e15', 14);
      b.add('5a600e17', 12);
      b.add('5a600e19', 12);
      b.add('5a600e1b', 16);
      b.add('5a600e1c', 12);
      b.add('5a600e1d', 17);
      b.add('5a600e1f', 3);

      c.add('5a600e10', 7);
      c.add('5a600e12', 20);
      c.add('5a600e13', 9);
      c.add('5a600e14', 19);
      c.add('5a600e16', 19);
      c.add('5a600e17', 1);
      c.add('5a600e18', 18);
      c.add('5a600e1a', 6);
      c.add('5a600e1c', 15);
      c.add('5a600e1f', 4);

      expect(SortedSet.intersect(c, a, b)).to.eql(['5a600e10', '5a600e14',
        '5a600e17', '5a600e1c']);

      expect(SortedSet.intersect(c, a, b)).to.eql(c.intersect(a, b));
    });

    it('should intersect four sets', function () {
      var a = new SortedSet();
      var b = new SortedSet();
      var c = new SortedSet();
      var d = new SortedSet();

      a.add('5a600e10', 16);
      a.add('5a600e12', 10);
      a.add('5a600e14', 9);
      a.add('5a600e15', 14);
      a.add('5a600e17', 20);
      a.add('5a600e18', 13);
      a.add('5a600e19', 15);
      a.add('5a600e1a', 19);
      a.add('5a600e1b', 7);
      a.add('5a600e1c', 13);
      a.add('5a600e1e', 10);

      b.add('5a600e10', 0);
      b.add('5a600e11', 15);
      b.add('5a600e13', 5);
      b.add('5a600e14', 3);
      b.add('5a600e15', 14);
      b.add('5a600e17', 12);
      b.add('5a600e19', 12);
      b.add('5a600e1b', 16);
      b.add('5a600e1c', 12);
      b.add('5a600e1d', 17);
      b.add('5a600e1f', 3);

      c.add('5a600e10', 7);
      c.add('5a600e12', 20);
      c.add('5a600e13', 9);
      c.add('5a600e14', 19);
      c.add('5a600e16', 19);
      c.add('5a600e17', 1);
      c.add('5a600e18', 18);
      c.add('5a600e1a', 6);
      c.add('5a600e1c', 15);
      c.add('5a600e1f', 4);

      d.add('5a600e1c', 400);
      d.add('5a600e17', 500);
      d.add('5a600e1f', 600);
      d.add('5a600e20', 700);

      expect(SortedSet.intersect(d, c, a, b)).to.eql(['5a600e17', '5a600e1c']);

      expect(SortedSet.intersect(d, c, a, b)).to.eql(d.intersect(c, a, b));
    });
  });

  describe('#rank', function () {
    it('should get the correct rank', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.rank('5a600e12')).to.equal(7);
      expect(z.rank('5a600e13')).to.equal(3);
      expect(z.rank('5a600e16')).to.equal(0);
      expect(z.rank('5a600e15')).to.equal(8);

      expect(z.rank('not in set')).to.equal(null);
    });
  });

  describe('#rem', function () {
    it('should delete special elements', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.rem('5a600e15')).to.equal(19);

      expect(z).to.have.length(8);

      expect(z.rem('5a600e16')).to.equal(3);

      expect(z).to.have.length(7);

      expect(z.toArray({ withScores: true })).to.eql([
        ['5a600e11', 6],
        ['5a600e18', 10],
        ['5a600e13', 11],
        ['5a600e17', 12],
        ['5a600e14', 14],
        ['5a600e10', 16],
        ['5a600e12', 17],
      ]);
    });

    it('should delete many elements', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.rem('5a600e11')).to.equal(6);
      expect(z.rem('5a600e13')).to.equal(11);
      expect(z.rem('5a600e14')).to.equal(14);
      expect(z.rem('5a600e15')).to.equal(19);
      expect(z.rem('5a600e16')).to.equal(3);
      expect(z.rem('5a600e17')).to.equal(12);

      expect(z.length).to.equal(3);
      expect(z.toArray({ withScores: true })).to.eql([
        ['5a600e18', 10],
        ['5a600e10', 16],
        ['5a600e12', 17],
      ]);
    });
  });

  describe('#remRangeByScore', function () {
    it('should strip out a range of elements', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.remRangeByScore(4, 14)).to.equal(5);
      expect(z).to.have.length(4);

      expect(z.toArray({ withScores: true })).to.eql([
        ['5a600e16', 3],
        ['5a600e10', 16],
        ['5a600e12', 17],
        ['5a600e15', 19],
      ]);
    });

    it('should strip out all the elements', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.remRangeByScore(3, 19)).to.equal(9);
      expect(z).to.have.length(0);

      expect(z.toArray()).to.eql([]);
    });
  });

  describe('#remRangeByRank', function () {
    it('should strip out a slice of elements', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.remRangeByRank(1, 6)).to.equal(5);
      expect(z).to.have.length(4);

      expect(z.toArray({ withScores: true })).to.eql([
        ['5a600e16', 3],
        ['5a600e10', 16],
        ['5a600e12', 17],
        ['5a600e15', 19],
      ]);
    });

    it('should strip out all elements', function () {
      var z = new SortedSet();

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(z.remRangeByRank(0, 9)).to.equal(9);
      expect(z).to.have.length(0);

      expect(z.toArray()).to.eql([]);
    });
  });

  describe('#values', function () {
    it('should return the values', function () {
      var z = new SortedSet();

      z.add('first', -1);
      z.add('third', 5);
      z.add('second', 3);

      expect(z.values()).to.eql([-1, 3, 5]);
    });
  });

  describe('unique', function () {
    it('should ensure values are unique', function () {
      var z = new SortedSet({unique: true});

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(function () {
        z.add('5a600e19', 11);
      }).to.throw(/unique/);

      // quick exit test
      expect(function () {
        z.add('5a600dff', z._head.next[z._level - 1].next.value);
      }).to.throw(/unique/);

      // this test ensures the key < key check doesn't come into play
      expect(function () {
        z.add('5a600dff', 11);
      }).to.throw(/unique/);

      expect(function () {
        z.add('5a600e18', 10);
      }).to.not.throw();

      expect(z).to.have.length(9);

      expect(z.toArray({ withScores: true })).to.eql([
        ['5a600e16', 3],
        ['5a600e11', 6],
        ['5a600e18', 10],
        ['5a600e13', 11],
        ['5a600e17', 12],
        ['5a600e14', 14],
        ['5a600e10', 16],
        ['5a600e12', 17],
        ['5a600e15', 19],
      ]);
    });

    it('should revert keys if constraint broken during update', function () {
      var z = new SortedSet({ unique: true });

      z.add('5a600e10', 16);
      z.add('5a600e11', 6);
      z.add('5a600e12', 17);
      z.add('5a600e13', 11);
      z.add('5a600e14', 14);
      z.add('5a600e15', 19);
      z.add('5a600e16', 3);
      z.add('5a600e17', 12);
      z.add('5a600e18', 10);

      expect(function () {
        z.add('5a600e13', 14);
      }).to.throw(/unique/);

      expect(z).to.have.length(9);
      expect(z.score('5a600e13')).to.equal(11);
    });
  });
});
