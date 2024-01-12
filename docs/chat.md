### 会话相关

#### 创建会话(根据业务的好友和群聊生成暂时不对外提供)

#### 我的会话列表

**请求URL：**

- `/chat/mine-list`

**请求方式：**

- POST

**接口响应参数说明**

| 参数名              | 类型     | 说明                         |
|:-----------------|:-------|:---------------------------|
| id               | string | 会话id                       |
| chat_id          | string | 会话ID                       |
| is_top           | int    | 是否置顶 1-是 0-否 默认0           |
| is_mute          | int    | 是否免打扰 1-是 0-否 默认0          |
| is_show          | int    | 是否显示 1-是 0-否 默认1           |
| is_hide          | int    | 是否隐藏 1-是 0-否 默认0           |
| max_read_seq     | int    | 最大读取的消息序号，个人建议用用户的dbIdx表存储 |
| last_online_time | int    | 最后一次在线时间                   |

**接口响应**

```
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "s_a7be32fecc0b2015",
                "chat_id": "s_a7be32fecc0b2015",
                "is_top": 0,
                "is_mute": 0,
                "is_show": 1,
                "is_hide": 0,
                "max_read_seq": 0,
                "last_online_time": 0,
            }
        ]
    },
    "msg": ""
}
```

#### 会话详情

**请求URL：**

- `/chat/detail`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型       | 说明     |
|:----|:---------|:-------|
| ids | []string | 会话id数组 |

**接口响应参数说明**

| 参数名                | 类型     | 说明               |
|:-------------------|:-------|:-----------------|
| id                 | string | 会话id             |
| creator_id        | string | 创建者(群、人、机器人)ID            |
| type               | int    | 1-单聊 2-群聊 3 官方会话 |
| status             | int    | 状态 1-正常 2-禁用     |
| is_enc             | int    | 是否加密 1-是 0-否 默认0 |
| last_read_sequence | int    | 最后一次读取的消息序号    |
| last_sequence      | int    | 最后一次消息序号       |
| last_time          | int    | 最后一次消息时间      |
| created_at         | int    | 创建时间             |
**接口响应**

```
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "s_a7be32fecc0b2015",
                "creator_id": "0x4c3f6cb0cd7df2977ea98e006b61bb899637d1ca",
                "type": 1,
                "status": 1,
                "is_enc": 0,
                "last_read_sequence": 0,
                "last_sequence": 0,
                "last_time": 0,
                "created_at": 0,
            }
        ]
    },
    "msg": ""
}
```

#### 删除会话

**请求URL：**

- `/chat/delete`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型       | 说明     |
|:----|:---------|:-------|
| ids | []string | 会话id数组 |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```