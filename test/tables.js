'use strict';

var DEFAULT_DIALECT = 'sql';

var tables = {
  userTable : {
    name : "user",
    columns : [ 'id', 'name', 'email', 'phone', 'address', 'created_at' ]
  },
  productTable : {
    name : "merchant",
    columns : [ 'id', 'name', 'price', 'rating', 'created_at' ]
  },
  orderTable : {
    name : "order",
    columns : [ 'id', 'user_id', 'product_id', 'created_at' ]
  }
};

module.exports = tables;

