'use strict';

var sql = require('sql');
var util = require('util');
var clone = require('clone');

var joiner = require('./join');
var aux = require('./aux');

var DEFAULT_DIALECT = 'mysql';

var Joiner = function (dialect) {
  this.setDialect(dialect);
  this.sql = sql;
};

Joiner.prototype.join = function (joinOpts, dialect) {
  this.setDialect(dialect || DEFAULT_DIALECT);
  var that = this;
  var opts = clone(joinOpts);
  var tables = opts.tables;
  var joins = opts.joins;

  if(!tables || !Object.keys(tables).length){
    return new Error("Require tables to perform join query");
  }

  //Define sql objects for tables
  Object.keys(tables).forEach(function(key){
    var table = tables[key];
    tables[key] = that.sql.define(table);
  });

  var query = joiner(tables, joins, query);
  query = tables[joins.left].from(query);
  query = aux(query, opts);
  
  return query;
};

Joiner.prototype.setDialect = function (dialect) {
  this.dialect = dialect;
  sql.setDialect(dialect);
};

module.exports = new Joiner(DEFAULT_DIALECT);
module.exports.Joiner = Joiner;