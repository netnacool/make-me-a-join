'use strict';
var util = require('util');

module.exports = function performJoin(tables, joins, query) {
  var left = joins.left;
  var right = joins.right;
  var conditions = util.isArray(joins.on) ? joins.on : [joins.on];
  right = typeof joins.right === 'object' ? joins.right.left : joins.right;
  query = query ? query.join(tables[right]) : tables[left].join(tables[right]);

  var andConds;
  conditions.forEach(function(condition) {
    var tableNames = Object.keys(condition);
    var t1 = tableNames[0],
      t2 = tableNames[1];
    var cond = tables[t1][condition[t1]].equals(tables[t2][condition[t2]]);
    andConds = andConds ? andConds.and(cond) : cond;
  });
  query = query.on(andConds);
  return (typeof joins.right) === 'object' ? performJoin(tables, joins.right, query) : query;
};
