# make-me-a-join
JSON options based join query creator. 
Based on [node-sql](https://github.com/brianc/node-sql) by Brian C


## install

```sh
$ npm install make-me-a-join
```

## use
```js
//Require module
var joiner = require('make-me-a-join');
//Define tables
var user = {
    name : "user",
    columns : [ 'id', 'name', 'email', 'phone', 'address', 'created_at' ]
  };
var product = {
    name : "merchant",
    columns : [ 'id', 'name', 'price', 'rating', 'created_at' ]
  };
var order = {
    name : "order",
    columns : [ 'id', 'user_id', 'product_id', 'created_at' ]
  }

```

The **joins** field in options defines the join operations. If you traverse this field
depth wise, then each **right** field adds a new link to the join. This link can be
to a table or to another join. This ways any number of joins can be added.
Only the **tables** and **joins** fields are compulsory, rest all are optional

```js
//Joining two tables with select, where and other clauses.
var joinOpts = {
    tables: {
      'user': user,
      'order': order
    },
    joins: {
      left: 'user',
      right: 'order', //right field can be on object for adding more joins.

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
  };

var query_text = joiner.join(joinOpts).toQuery().text;
//SELECT `user`.`id`, `user`.`name`, `order`.`product_id`, `order`.`created_at` FROM `user` INNER JOIN `order` ON (`user`.`id` = `order`.`user_id`) WHERE (((`order`.`product_id` IN (?, ?)) AND (`user`.`created_at` > ?)) AND (`user`.`created_at` < ?)) GROUP BY `user`.`id` ORDER BY `order`.`id`, `order`.`product_id` 

//Joining three tables
var joinOpts = {
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
  };

var query = joiner.join(joinOpts).toQuery().text;
//SELECT `user`.`id`, `user`.`name`, `merchant`.* FROM `merchant` INNER JOIN `order` ON (`merchant`.`id` = `order`.`product_id`) INNER JOIN `user` ON (`order`.`user_id` = `user`.`id`)

```
### options

Change dialect (default mysql). For available dialects check [node-sql](https://github.com/brianc/node-sql)
```js
var query = joiner.join(joinOpts, 'mssql'); //mssql dialect set.

```
