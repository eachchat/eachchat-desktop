# Core Model 使用指南

Author: Jakit

Date: 2020/03/13

## 导入包

```
import {model, sqlite} from 'index.js'
```

## 创建表人物表

```
create table person(
  id integer primary key autoincrement,
  name text,
  age integer);
```

## 打开 SQLite

```
const sqliteConnection = new sqlite.Sqlite('/tmp/test.db');
```

## 初始化 User 模型

```
const Person = model.Model.create(
  sqliteConnection,
  'person', // 表名称
  {id: model.integer,
   name: model.string,
   age: model.integer},
  ['id'], // 主键（可能多个）
  ['id']) // 自增字段（可能多个）;
```

如果主键、自增字段只有一个，那么可以缩写成：

```
const Person = model.Model.create(
  'person', // 表名称
  {id: model.integer,
   name: model.string,
   age: model.integer},
  'id', // 主键（可能多个）
  'id') // 自增字段（可能多个）;
```

## 增加条目

```
var xiaoming = new Person(
  {name: "XiaoMing",
   age: 25});
xiaoming.save();
```

或者这样：

```
var xiaoming = new Person();
xiaoming.name = "XiaoMing";
xiaoming.age = 25;
xiaoming.save();
```

## 查找与删除

```
Person.first(1) // 按顺序找 1 个人
Person.last(1) // 倒序（最新）找 1 个人
Person.first(0, 20) // 以 0 的偏移、找 20 个人

Person.first() // 默认找一个，就是第一个
      .then((people) => {
        for (var i = 0; i < people.length; i++) {
          console.log(people[i].name); // 逐个打印人名
        }
      })

// 使用 async
async function() {
  var people = await Person.first();

  for (var i = 0; i < people.length; i++) {
    if (people[i].name == "XiaoMing") {
      // 把小明的年龄改成 10 岁
      people[i].age = 10;
    }
  }

  // 把叫做小明的都找出来
  var people = await Person.where({name: "XiaoMing"})
                           .first();

  for (var i = 0; i < people.length; i++) {
    if (people[i].name == "XiaoMing") {
      // 发现小明的年龄变了
      console.log(people[i].age);
      // 删除小明
      people[i].destroy();
    }
  }
}
```


