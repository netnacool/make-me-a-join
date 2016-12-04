'use strict';

var mocha = require('mocha');
var assert = require('assert');
var joiner = require('../lib');

var tables = require('./tables');
var user = tables.userTable;
var product = tables.productTable;
var order = tables.orderTable;

var DIALECT = 'sql';

var testCases = {
  opts_simple: {
    tables: {
      'user': user,
      'order': order
    },
    joins: {
      left: 'user',
      right: 'order',

      on: {
        'user': 'id',
        'order': 'user_id'
      }
    }
  },

  opts_simple_aux: {
    tables: {
      'user': user,
      'order': order
    },
    joins: {
      left: 'user',
      right: 'order',

      on: {
        'user': 'id',
        'order': 'user_id'
      }
    },
    select: {
      'user': ['id', 'name'],
      'order': ['product_id', 'created_at']
    },
    filters: {
      'order': {
        'product_id': [44512, 33221]
      }
    },
    gt: {
      'user': {
        'created_at': '2016-04-04'
      }
    },
    lt: {
      'user': {
        'created_at': '2017-04-04'
      }
    },
    orderBy: {
      'order': ['id', 'product_id']
    },
    groupBy: {
      'user': 'id'
    }
  },

  opts_multi_A: {
    tables: {
      'user': user,
      'product': product,
      'order': order
    },
    joins: {
      left: 'order',
      right: {
        left: 'user',
        right: 'product',
        on: {
          'product': 'id',
          'order': 'product_id'
        }
      },
      on: {
        'user': 'id',
        'order': 'user_id'
      }
    }
  },

  opts_multi_B: {
    tables: {
      'user': user,
      'product': product,
      'order': order
    },
    joins: {
      left: 'product',
      right: {
        left: 'order',
        right: 'user',
        on: {
          'order': 'user_id',
          'user': 'id'
        }
      },
      on: {
        'product': 'id',
        'order': 'product_id'
      }
    },
    select : {
      'user' : ['id', 'name'],
      'product' : '*'
    }
  }

};

/**
 * Tests to be run - 
 * 1.) Two table simple join
 * 2.) Two table simple joing with aux clauses.
 * 3.) Three table join. a) Third table linked to first. b) Third table linked to second
 *
 * Conditions to meet for success - 
 * 1.) Final query should be same as that generated using normal sql chaining.
 */

describe("make-me-a-join tests", function () {
  it("Makes a simple join of two table", function () {
    var test_query = joiner.join(testCases.opts_simple).toQuery().text;
    var query = "SELECT * FROM `user` INNER JOIN `order` ON (`user`.`id` = `order`.`user_id`)";
    assert.equal(test_query, query);
  });

  it("Makes a simple join of two tables with aux clauses", function () {
    var test_query = joiner.join(testCases.opts_simple_aux).toQuery();
    var query = {
      text: "SELECT `user`.`id`, `user`.`name`, `order`.`product_id`, `order`.`created_at` FROM `user` INNER JOIN `order` ON (`user`.`id` = `order`.`user_id`) WHERE (((`order`.`product_id` IN (?, ?)) AND (`user`.`created_at` > ?)) AND (`user`.`created_at` < ?)) GROUP BY `user`.`id` ORDER BY `order`.`id`, `order`.`product_id`",
      values: [44512, 33221, '2016-04-04', '2017-04-04']
    }
    assert.equal(test_query.text, query.text);
    assert.deepEqual(test_query.values, query.values);
  });

  describe("Makes a join of three tables", function () {
    it(" Third table linked to first", function () {
      var test_query = joiner.join(testCases.opts_multi_A).toQuery().text;
      var query = "SELECT * FROM `order` INNER JOIN `user` ON (`user`.`id` = `order`.`user_id`) INNER JOIN `merchant` ON (`merchant`.`id` = `order`.`product_id`)";
      assert.equal(test_query, query);
    });

    it(" Third table linked to second", function () {
      var test_query = joiner.join(testCases.opts_multi_B).toQuery().text;
      var query = "SELECT `user`.`id`, `user`.`name`, `merchant`.* FROM `merchant` INNER JOIN `order` ON (`merchant`.`id` = `order`.`product_id`) INNER JOIN `user` ON (`order`.`user_id` = `user`.`id`)";
      assert.equal(test_query, query);
    });
  });

});