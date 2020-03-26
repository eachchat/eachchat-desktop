# 数据模型使用指南

## 引入 models

```
import {models} from './models.js'
```

## 使用 用户模型

```
var User = await models.User;
```

### Promise 方式

```
var User;
models.User.then((model) => {
  User = model;
  })
```
