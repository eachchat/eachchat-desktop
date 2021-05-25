#

##

```
import {models} from './models.js'
```

##

```
var User = await models.User;
```

##

```
var User;
models.User.then((model) => {
  User = model;
  })
```
