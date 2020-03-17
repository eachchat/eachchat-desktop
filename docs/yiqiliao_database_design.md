# Yiqiliao Desktop Storage Design

Author: Jakit

Create: 2020/03/13

## Tables

### Departments

PrimaryKey: `id`

| Field | Type | Decoration | Description |
| ----- | ---- | ---------- | ----------- |
| id    | integer | primary key, autoincrement | 部门 ID |
| parent_id   | integer | not null | 父级 ID |
| unique_id | integer | not null | 唯一标识 ID |
| name | text | not null | 部门名称 |
| description | text | not null | 部门描述 |
| status | text | not null | 状态 |
| property | integer | not null | 机构属性 |

#### Enum<property>

| Value | Description |
| ----- | ----------- |
| 0 | 临时编制 |
| 1 | 外部 |
| 2 | 正式部门 |

### Conversations

PrimaryKey: `id`

| Field | Type | Decoration | Description |
| ----- | ---- | ---------- | ----------- |
| id    | integer | primary key, autoincrement | 对话 ID |
| name  | text | not null | 对话名称 |
| avatar | text | not null | 头像路径 |
| type | integer | not null | 群聊类型 |
| status | integer | not null | 状态 |
| is_group | integer | not null | 是否为群聊 |
| last_message_id | integer | N/A | 最后一条消息 ID |
| notice | text | N/A | 公告 |
| notice_update_time | integer | not null | 公告更新日期 |
| notice_publish_user_id | integer | not null | 公告发布者 ID |
| unread | integer | not null | 未读消息数量 |
| draft | text | N/A | 草稿 |

### Messages

PrimaryKey: `id`

| Field | Type | Decoration | Description |
| ----- | ---- | ---------- | ----------- |
| id    | integer | primary key, autoincrement | 消息 ID |
| unique_id | text | not null | 消息唯一 ID |
| conversation_id | integer | not null | 消息对应的对话 ID |
| type | integer | not null | 消息类型 |
| direction | integer | not null | 消息方向 |
| status | integer | not null | 状态 |
| sender_user_id | integer | not null | 发送者 ID |
| sequence | integer | not null | 序号 |
| create_time | integer | not null | 创建日期 |
| content | text | not null | 内容 |
| file_path | text | not null | 文件路径 |

### Collections

PrimaryKey: `id`

| Field | Type | Decoration | Description |
| ----- | ---- | ---------- | ----------- |
| id    | integer | primary key, autoincrement | 收藏 ID |
| sequence | integer | not null | 序号 |
| owner_user_id | integer | not null | 关联用户 ID |
| type | integer | not null | 收藏类型 |
| reference_id | integer | not null | 引用 ID |
| create_time | integer | not null | 创建日期 |

### Users

PrimaryKey: `id`

| Field | Type | Decoration | Description |
| ----- | ---- | ---------- | ----------- |
| id    | integer | primary key, autoincrement | 用户 ID |
| account | text | not null | 账户名 |
| name | text | not null | 用户名 |
| nick_name | text | not null | 昵称 |
| avatar | text | not null | 头像本地文件地址 |
| avatar_minimal | text | not null | 头像缩略图文件地址 |
| role_id | integer | not null | 关联角色 ID |
| language | integer | N/A | 语言 |
| locale | integer | N/A | 区域 |
| timezone | text | N/A | 时区 |
| is_active | integer | not null | 账号活跃状态 |
| pinyin | text | N/A | 用户名拼音 |
| remark | text | N/A | 备注 |
| remark_pinyin | text | N/A | 备注拼音 |
| job | text | N/A | 工作内容信息 |
| bio | text | N/A | 类似于 github 的 Bio，情景描述文案 |

```
create table users (
  id integer primary key autoincrement -- 用户 ID
  account text not null -- 账户名
  name text not null -- 用户名
  nick_name text not null -- 昵称
  avatar text not null -- 头像本地文件地址
  avatar_minimal text not null -- 头像缩略图文件地址
  role_id integer not null -- 关联角色 ID
  language integer N/A -- 语言
  locale integer N/A -- 区域
  timezone text N/A -- 时区
  is_active integer not null -- 账号活跃状态
  pinyin text N/A -- 用户名拼音
  remark text N/A -- 备注
  remark_pinyin text N/A -- 备注拼音
  job text N/A -- 工作内容信息
  bio text N/A -- 类似于 github 的 Bio
)
```

### Login

PrimaryKey: `id`

| Field | Type | Decoration | Description |
| ----- | ---- | ---------- | ----------- |
| id    | integer | primary key autoincrement | 登陆记录 ID |
| access_token | text | not null | 用于访问的 token |
| refresh_token | text | not null | 用于刷新的 token |
| account | text | not null | 账户名 |
| password | text | not null | 记住密码 |

```
create table login (
  id integer primary key autoincrement -- 登陆记录 ID
  access_token text not null -- 用于访问的 token
  refresh_token text not null -- 用于刷新的 token
  account text not null -- 账户名
  password text not null -- 记住密码
)
```

## Models

### User

```
const User = Model.create(
  'users',
  {
    id: model.integer,
    account: model.string,
    name: model.string
    nick_name: model.string
    avatar: model.string
    avatar_minimal: model.string
    role_id: model.integer
    language: model.integer
    locale: model.integer
    timezone: model.string
    is_active: model.integer
    pinyin: model.string
    remark: model.string
    remark_pinyin: model.string
    job: model.string
    bio: model.string
  },
  'id',
  'id'
)
```

### Login

```
const Login = Model.create(
  'login',
  {
    id: model.integer
    access_token: model.text
    refresh_token: model.text
    account: model.text
    password: model.text
  },
  'id',
  'id'
)
