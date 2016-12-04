'use strict';
var util = require('util');

var aux = function (query, opts) {
  var tables = opts.tables;

  //Apply select fields
  var selectFields = opts.select || {};
  Object.keys(selectFields).forEach(function (table) {
    var toSelect = selectFields[table];
    if (toSelect === '*') {
      query = query.select(tables[table].star());
      return;
    }
    toSelect = util.isArray(toSelect) ? toSelect : [toSelect];
    if (!tables[table]) return;
    toSelect.forEach(function (col) {
      if (opts.as && opts.as[table] && opts.as[table][col]) {
        query = query.select(tables[table][col].as(opts.as[table][col]));
      } else {
        query = query.select(tables[table][col]);
      }
    });

  });

  var filters = [];
  // Apply where condtions
  var filterFields = opts.filters || {};
  var whereConds;
  Object.keys(filterFields).forEach(function (table) {
    var toFilter = filterFields[table];
    if (!tables[table]) return;
    Object.keys(toFilter).forEach(function (col) {
      var val = toFilter[col];
      var cond = util.isArray(val) ? tables[table][col].in(val) : tables[table][col].equals(
        val);
      filters.push(cond);
    });

  });

  //Aplly gt conditions 
  var gtFields = opts.gt || {};
  var gtConds;
  Object.keys(gtFields).forEach(function (table) {
    var toFilter = gtFields[table];
    if (!tables[table]) return;
    Object.keys(toFilter).forEach(function (col) {
      var val = toFilter[col];
      var cond = tables[table][col].gt(val);
      filters.push(cond);
    });

  });

  //Aplly lt conditions 
  var ltFields = opts.lt || {};
  var ltConds;
  Object.keys(ltFields).forEach(function (table) {
    var toFilter = ltFields[table];
    if (!tables[table]) return;
    Object.keys(toFilter).forEach(function (col) {
      var val = toFilter[col];
      var cond = tables[table][col].lt(val);
      filters.push(cond);
    });

  });

  if (filters && filters.length) {
    query = query.where.apply(query, filters);
  }

  //Group By
  var groupBy = opts.groupBy || {};
  Object.keys(groupBy).forEach(function (table) {
    var groupCol = groupBy[table];
    if (!tables[table]) return;
    groupCol = util.isArray(groupCol) ? groupCol : [groupCol];
    groupCol.forEach(function (col) {
      query = query.group(tables[table][col]);
    });
  });

  //Order By
  var orderBy = opts.orderBy || {};
  Object.keys(orderBy).forEach(function (table) {
    var orderCol = orderBy[table];
    if (!tables[table]) return;
    orderCol = util.isArray(orderCol) ? orderCol : [orderCol];
    orderCol.forEach(function (col) {
      query = query.order(tables[table][col]);
    });
  });

  //Limit
  if (opts.limit) {
    query = query.limit(opts.limit);
  }
  return query;
};

module.exports = aux;