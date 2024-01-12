### 消息相关

#### 发送消息

**请求URL：**

- `/message/send`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名         | 类型         | 说明                   |
|:------------|:-----------|:---------------------|
| id         | string     | 消息id                 |
| chat_id     | string     | 会话id                 |
| content     | string     | 客户端定义，服务端不管          |
| type        | int        | 1-普通消息 2-应用消息 等 （待定） |
| is_enc      | int        | 是否加密 1-是 0-否 默认0     |
| receive_ids | []string?   | 指定接收的用户Id，为空则为会话的全部  |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 获取消息列表

**请求URL：**

- `/message/list`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名     | 类型     | 说明      |
|:--------|:-------|:--------|
| chat_id | string | 会话id    |
| sequence | int    | 序号      |
| direction | string | up/down |

**接口响应**

```
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "0x4c3f6cb0cd7df2977ea98e006b61bb899637d1ca",
                "is_read": 0,
                "sequence": 0,
                "created_at": 0,
            }
        ]
    },
    "msg": ""
}
```



#### 获取消息详情 （可以跟随列表返回）

**请求URL：**

- `/messages/detail`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型       | 说明    |
|:----|:---------|:------|
| ids | []string | 消息ids |

**接口响应**
```
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "0x4c3f6cb0cd7df2977ea98e006b61bb899637d1ca",
                "chat_id": "0x4c3f6cb0cd7df2977ea98e006b61bb899637d1ca",
                "from_uid": "0x4c3f6cb0cd7df2977ea98e006b61bb899637d1ca",
                "content": "0x4c3f6cb0cd7df2977ea98e006b61bb899637d1ca",
                "status": 1,
                "type": 1,
                "is_enc": 0,
                "sequence": 0,
                "extra": {},
                "action": {},
                "created_at": 0,
            }
        ]
    },
    "msg": ""
}
```

#### （双向）撤回消息-根据消息IDs

**请求URL：**

- `/messages/delete-batch`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型       | 说明                  |
|:----|:---------|:--------------------|
| ids | []string | 消息id数组, 单个消息也是这个API |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### （单向）删除消息-按消息Id

**请求URL：**

- `/messages/delete-self-all`

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

#### （双向）删除所有消息-根据会话IDs

**请求URL：**

- `/messages/delete-chat-ids`

**请求方式：**

- POST

**接口请求参数说明**
| 参数名 | 类型 | 说明 |
|:----|:---------|:--------------------|
| chat_ids | []string | 会话id数组, 单个会话也是这个API |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### （单向）删除所有消息-根据会话IDs 解除自己与会话消息的关系

**请求URL：**

- `/messages/delete-self-chat-ids`

**请求方式：**

- POST

**接口请求参数说明**
| 参数名 | 类型 | 说明 |
|:----|:---------|:--------------------|
| chat_ids | []string | 会话id数组, 单个会话也是这个API |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```



#### 撤回消息-根据会话IDs 所有发送者的消息物理删除

**请求URL：**

- `/messages/revoke-chat-ids`

**请求方式：**

- POST

**接口请求参数说明**
| 参数名 | 类型 | 说明 |
|:----|:---------|:--------------------|
| chat_ids | []string | 会话id数组, 单个会话也是这个API |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```


#### 清空所有端消息 物理删除 (不可恢复,只有拥有管理员权限的用户才能调用)

**请求URL：**

- `/messages/clear-chat-ids`

**请求方式：**

- POST

**接口请求参数说明**
| 参数名 | 类型 | 说明 |
|:----|:---------|:--------------------|
| chat_ids | []string | 会话id数组, 单个会话也是这个API |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```