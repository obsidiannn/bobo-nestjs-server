### 登录相关相关

#### 判断用户是否存在

**请求URL：**

- `/auth/is-register`

**请求方式：**

- POST

**接口响应参数说明**

| 参数名         | 类型   | 说明                  |
|:------------|:-----|:--------------------|
| is_register | int | 1-已经注册 0-未注册 |

```
{
    "code": 200,
    "data": {
        "is_register": 1
    },
    "msg": ""
}
```

#### 用户认证（注册）

**请求URL：**

- `/auth/register`

```
{
    "code": 200,
    "data": {
        "address": "0x0b84b2d122cb1c058b988d9f0291a6e25364c6f8d",
        "avatar": "https://img1.baidu.com/it/u=3709586903,1286591012&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
        "name": "z4x56k",
        "pub_key": "0364d735fb01f4bfd2695b1805585de1aa1992243f5a685a9ead1045e4e10c5c41",
        "create_time": 1692531674664
    },
    "msg": ""
}
```

#### 修改用户昵称

**请求URL：**

- `/auth/update-name`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名  | 类型     | 说明   |
|:-----|:-------|:-----|
| name | string | 用户昵称 |

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 修改用户头像

**请求URL：**

- `/auth/update-avatar`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名    | 类型     | 说明   |
|:-------|:-------|:-----|
| avatar | string | 用户头像 |

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 修改用户性别

**请求URL：**

- `/auth/update-gender`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名    | 类型  | 说明           |
|:-------|:----|:-------------|
| gender | int | 0-未知 1-男 2-女 |

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 修改用户签名

**请求URL：**

- `/auth/update-sign`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名  | 类型     | 说明   |
|:-----|:-------|:-----|
| sign | string | 个性签名 |

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```


#### 注销账号

**请求URL：**

- `/auth/destroy`

**请求方式：**

- POST

**接口请求参数说明**
无

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

