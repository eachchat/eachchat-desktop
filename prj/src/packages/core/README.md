# Core Model

Author: Jakit

Date: 2020/03/13

##

```
import {model, sqlite} from 'index.js'
```

##

```
create table person(
  id integer primary key autoincrement,
  name text,
  age integer);
```



```
const sqliteConnection = new sqlite.Sqlite('/tmp/test.db');
```



```
var Person = await model.Model.create(
  sqliteConnection,
  'person',
  {id: model.integer,
   name: model.string,
   age: model.integer},
  ['id'],
  ['id']) ;
```


```
var Person = await model.Model.create(
  'person',
  {id: model.integer,
   name: model.string,
   age: model.integer},
  'id',
  'id')
```



```
var User;

model.Model.create(
  'person',
  {id: model.integer,
   name: model.string,
   age: model.integer},
  'id',
  'id').then((newModel) => {
    User = newModel;
    })
```



```
var xiaoming = new Person(
  {name: "XiaoMing",
   age: 25});
xiaoming.save();
```


```
var xiaoming = new Person();
xiaoming.name = "XiaoMing";
xiaoming.age = 25;
xiaoming.save();
```



```
Person.first(1)
Person.last(1) 
Person.first(0, 20)

Person.first() 
      .then((people) => {
        for (var i = 0; i < people.length; i++) {
          console.log(people[i].name); 
        }
      })


async function() {
  var people = await Person.first();

  for (var i = 0; i < people.length; i++) {
    if (people[i].name == "XiaoMing") {
      people[i].age = 10;
    }
  }

  var people = await Person.where({name: "XiaoMing"})
                           .first();

  for (var i = 0; i < people.length; i++) {
    if (people[i].name == "XiaoMing") {
      console.log(people[i].age);
      people[i].destroy();
    }
  }
}
```


