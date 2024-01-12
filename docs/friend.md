### 好友相关

#### 获取用户关系

**请求URL：**

- `/friends/relation-list`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名  | 类型    | 说明   |
|:-----|:------|:-----|
| uids | array | 用户地址 |

**接口返回参数说明**

| 参数名       | 类型     | 说明                                                         |
|:----------|:-------|:-----------------------------------------------------------|
| id        | string | 用户地址                                                       |
| is_friend | int    | 是否是好友 0-互为陌生人 1-互为好友 2-对方是我的好友/我是对方的陌生人 3-对方是我的陌生人/我是对方的好友 |
```
{
    "code": 200,
    "data": {
        "items":[
            {
                "id":"0xb1d3c24d3cd2ef52e6dc3ac6c06742a7dc17e041",
                "is_friend":1,
            }
        ]
    },
    "msg": ""
}
```

#### 申请添加好友

**请求URL：**

- `/friends/invite-apply`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名     | 类型     | 说明    |
|:--------|:-------|:------|
| obj_uid | string | 对象uid |
| remark  | string | 备注    |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 申请列表

**请求URL：**

- `/friends/invite-list`

**请求方式：**

- POST

**接口请求参数说明**
无

**接口响应**

| 参数名    | 类型     | 说明                  |
|:-------|:-------|:--------------------|
| id     | string | 数据库编号ID             |
| uid    | string | 请求的用户地址             |
| remark | string | 请求的用户备注             |
| status | int8   | 0-等待验证 1-验证通过 2-已拒绝 |

```
{
    "code": 200,
    "data": {
        "items":[
            {
                "id": "fcad58e10337f612",
                "uid": "0xb1d3c24d3cd2ef52e6dc3ac6c06742a7dc17e041",
                "remark": "hello",
                "reject_reason": "",
                "status": 1
            }
        ]
    },
    "msg": ""
}
```

#### 同意

**请求URL：**

- `/friends/invite-agree`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型     | 说明   |
|:----|:-------|:-----|
| id  | string | 主键id |
| alias  | string | 通讯录备注 |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 拒绝

**请求URL：**

- `/friends/invite-reject`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型     | 说明   |
|:----|:-------|:-----|
| id  | string | 主键id |
| reason  | string | 拒绝原因 |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 已读

**请求URL：**

- `/friends/invite-read`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型       | 说明    |
|:----|:---------|:------|
| ids | []string | 主键ids |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 好友列表

**请求URL：**

- `/friends/list`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名  | 类型       | 说明                |
|:-----|:---------|:------------------|
| uids | []string | 好友的用户id数组，为空的时候全量 |

**接口响应的参数说明**

| 参数名     | 类型     | 说明                 |
|:--------|:-------|:-------------------|
| uid     | string | 好友的用户              |
| chat_id | string | 和好友的会话id           |
| alias  | string | 好友的备注              |

**接口响应**

```
{
    "code": 200,
    "data":   {
    "items":[
            {
                "uid":"0x4c3f6cb0cd7df2977ea98e006b61bb899637d1ca",
                "chat_id":"s_a7be32fecc0b2015",
                "alias":"",
            }
        ]
    },
    "msg": ""
}
```

#### 好友备注

**请求URL：**

- `/friends/update-alias`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名     | 类型     | 说明      |
|:--------|:-------|:--------|
| uid | string | 好友的用户id |
| alias  | string | 备注      |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 删除好友（单向）

**请求URL：**

- `/friends/delete-unilateral`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名  | 类型       | 说明                  |
|:-----|:---------|:--------------------|
| uids | []string | 好友的id数组 如果为空-则为删除所有 |

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 删除所有好友（双向）

**请求URL：**

- `/friends/delete-bilateral`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名  | 类型       | 说明                  |
|:-----|:---------|:--------------------|
| uids | []string | 好友的id数组 如果为空-则为删除所有 |

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

