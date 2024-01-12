### 群组相关

#### 创建群聊

**请求URL：**

- `/groups/create`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名     | 类型     | 说明             |
|:--------|:-------|:---------------|
| id      | string | 群ID，前端生成防止重复调用 |
| avatar  | string | 头像             |
| name    | string | 名称             |
| pub_key | string | 公钥             |
| is_enc | int    | 是否加密 1-是 0-否 默认0             |
| type | int    | 群类型 1-普通 2-付费 3-私密 默认1             |
| ban_type | int    | 禁言类型 1-不禁言 2-全员禁言 3-仅管理员可发言 4-仅群主可发言 默认1             |
| search_type | int    | 搜索类型 1-允许被搜索 2-不允许被搜索 默认1             |

**请求Demo**

```
{
	"id": "test001",
	"pub_key":"",
	"avatar": "https://img1.baidu.com/it/u=3709586903,1286591012&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
	"name": "miya-test001",
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 群聊用户

**请求URL：**

- `/groups/members`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型     | 说明  |
|:----|:-------|:----|
| id  | string | 群ID |
| limit  | int | 限制 最多 100个 |
| page  | int | 页数 |

**请求Demo**

```
{
	"id": "test001",
}
```

**接口响应参数说明**

| 参数名      | 类型     | 说明                   |
|:---------|:-------|:---------------------|
| id       | string | 主键ID                 |
| uid      | string | 用户id（地址）             |
| gid      | string | 群id                  |
| role     | int8   | 角色 1-群组 2-管理员 3-普通成员 |
| my_alias | string | 群昵称                  |

**接口响应**

```
{
    "code": 200,
    "data": {
        "page": 1,
        "limit": 100,
        "items": [
            {
                "id": "2e2bd92a86eb9b61",
                "uid": "0x7f90fadd2e3fdbacfd3ffc0c554fcf5878cc1601",
                "gid": "test001",
                "role": 3,
                "my_alias": "",
                "admin_at": 0,
                "created_at": 1696839147569
            },
            {
                "id": "c3427c909968d7bc",
                "uid": "0x7fe4407b6de6b0ac3b0a02fe93ecd175e9b31aa8",
                "gid": "test001",
                "role": 1,
                "my_alias": "",
                "admin_at": 0,
                "created_at": 1696839147569
            }
        ],
        "status": 0
    },
    "msg": ""
}
```

#### 同意加入群聊

（只有群组和管理员有权限）

**请求URL：**

- `/groups/agree-join`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名     | 类型       | 说明     |
|:--------|:---------|:-------|
| id      | string   | 群ID    |
| uids | []string | 用户id数组 |

**请求Demo**

```
{
	"id": "test001"
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 邀请加入群聊

**请求URL：**

- `/groups/invite-join`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名   | 类型       | 说明     |
|:------|:---------|:-------|
| id    | string   | 群ID    |
| items | []string | 用户相关信息 |

| items参数           | 类型       | 说明        |
|:--------------|:---------|:----------|
| items.uid     | string   | 用户ID      |
| items.enc_key | []string | 用户enc_key |

**请求Demo**

```
{
	"id": "test001",
	"items": [
		{
			"uid":"test002",
			"enc_key":"",
		}
	]
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 踢出群聊

（群组和管理员有权限）

**请求URL：**

- `/groups/kick-out`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名     | 类型       | 说明     |
|:--------|:---------|:-------|
| id      | string   | 群ID    |
| uids | []string | 用户id数组 |

**请求Demo**

```
{
	"id": "test001",
    "uids": ["xxx"]
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 我的群聊

**请求URL：**

- `/groups/list`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型 | 说明 |
|:----|:---|:---|

| gids[]        | string[] |群id列表

**接口响应**

```
{
    "code": 200,
    "data": {
        "gids": [
            "gid",
            "gid"
        ]
    },
    "msg": ""
}
```

#### 修改群名称

（群组和管理员有权限）

**请求URL：**

- `/groups/update-name`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名  | 类型     | 说明  |
|:-----|:-------|:----|
| id   | string | 群ID |
| name | string | 群名称 |

**请求Demo**

```
{
	"id": "test001",
	"name": "test002"
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 修改群头像

（群组和管理员有权限）

**请求URL：**

- `/groups/update-avatar`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名    | 类型     | 说明  |
|:-------|:-------|:----|
| id     | string | 群ID |
| avatar | string | 头像  |

**请求Demo**

```
{
	"id": "test001",
	"avatar": "",
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 修改我在群里面的昵称

（只能修改自己的）

**请求URL：**

- `/groups/update-alias`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名   | 类型     | 说明    |
|:------|:-------|:------|
| id    | string | 群ID   |
| alias | string | 用户群昵称 |

**请求Demo**

```
{
	"id": "test001",
	"alias": "miyaya"
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 退出群聊

##### 指定单个群

**请求URL：**

- `/groups/quit`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型     | 说明  |
|:----|:-------|:----|
| id  | string | 群ID |

**请求Demo**

```
{
	"id": "test001",
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

##### 指定多个群

**请求URL：**

- `/groups/quit-batch`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型       | 说明   |
|:----|:---------|:-----|
| ids | []string | 群Ids |

**请求Demo**

```
{
	"id": ["test001","test002"]
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

##### 我的所有

**请求URL：**

- `/group/quit-all`

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

#### 修改群通告

**请求URL：**

- `/groups/update-notice`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名       | 类型     | 说明                |
|:----------|:-------|:------------------|
| id        | string | 群ID               |
| notice    | string | 群通告               |
| notice_md5    | string | 群通告md5               |

**请求Demo**

```
{
	"id": "test001",
	"notice": "miyayayayayayay",
    "notice_md5": ""
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 获取群通告

**请求URL：**

- `/groups/get-notice`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型     | 说明  |
|:----|:-------|:----|
| id  | string | 群ID |

**请求Demo**

```
{
	"id": "test001",
}
```

**接口响应**

```
{
	"id": "test001",
	"notice": "miyayayayayayay",
	"notice_md5": "aaaaaaaa",
}
```

#### 修改群简介

**请求URL：**

- `/groups/update-desc`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名      | 类型     | 说明              |
|:---------|:-------|:----------------|
| id       | string | 群ID             |
| desc     | string | 群简介             |
| desc_md5 | string | 群简介 md5(desc) |

**请求Demo**

```
{
	"id": "test001",
	"desc": "miyayayayayayay",
	"desc_md5": "aaaaaaaa",
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 获取群简介

**请求URL：**

- `/groups/get-desc`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型     | 说明  |
|:----|:-------|:----|
| id  | string | 群ID |

**请求Demo**

```
{
	"id": "test001",
}
```

**接口响应**

```
{
	"id": "test001",
	"desc": "miyayayayayayay",
	"desc_md5": "aaaaaaaa",
}
```

#### 解散群聊

（只有群组有权限）

**请求URL：**

- `/groups/dismiss`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型     | 说明  |
|:----|:-------|:----|
| ids  | string[] | 群ID |

**请求Demo**

```
{
	ids: ["xx"]
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 转移群组

（只有群主有权限）

**请求URL：**

- `/groups/transfer`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名     | 类型     | 说明     |
|:--------|:-------|:-------|
| id      | string | 群ID    |
| uid | string | 转移对象id |

**请求Demo**

```
{
	"id": "test001",
	"uid": "test001",
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 添加管理员

（只有群主有权限）

**请求URL：**

- `/groups/add-admin`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名     | 类型          | 说明               |
|:--------|:------------|:-----------------|
| id      | string      | 群ID              |
| uids | []string 数组 | 管理员的ids，一次可以添加多个 |

**请求Demo**

```
{
	"id": "test001",
	"uids": ["test001","test002"],
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 移除管理员

（只有群主有权限）

**请求URL：**

- `/groups/remove-admin`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名     | 类型          | 说明               |
|:--------|:------------|:-----------------|
| id      | string      | 群ID              |
| uids | []string 数组 | 管理员的ids，一次可以移除多个 |

**请求Demo**

```
{
	"id": "test001",
	"uids": ["test001","test002"],
}
```

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```


#### 待审核申请列表

---只有群主和管理员有权限

**请求URL：**

- `/groups/apply-list`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型 | 说明           |
|:----|:---|:-------------|
| id | 数组 | 群Id |

**请求Demo**

```
{
	"id": "xx",
}
```

**接口响应参数说明**

| 参数名    | 类型         | 说明       |
|:-------|:-----------|:---------|
| id     | string     | 主键ID     |
| uid    | string     | 用户id（地址） |
| gid    | string     | 群id      |

**接口响应**

```
{
    "code": 200,
    "data": [
        {
            "id": "e162b4e9f9fc8cc9",
            "gid": "05df14c0-2b87-4dea-be20-aff84f7fb631",
            "uid": "0x0b9830658957726106c84bdef3e2dc24fb826ec7",
            "enc_key": "",
            "role": 3,
            "status": 0,
            "created_at": 0
        }
    ],
    "msg": ""
}
```

#### 我的申请列表

**请求URL：**

`/groups/my-apply-list`

**请求方式：**

- POST



**接口响应参数说明**

| 参数名          | 类型     | 说明       |
|:-------------|:-------|:---------|
| id           | string | 主键ID     |
| gid          | string | 群id（地址） |
| status         | int8   | 状态      |
| created_at  | int64  | 创建时间     |

**接口响应**

```
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "2e2bd92a86eb9b61",
                "gid": "2e2bd92a86eb9b61",
                "created_at": 1696839147569,
                "status": 1
            }
        ],
    },
    "msg": ""
}
```

#### 群详情

**请求URL：**

- `/groups/get-batch-info`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型       | 说明   |
|:----|:---------|:-----|
| ids | []string | 群Ids |

**请求Demo**

```
{
	"ids": ["test001","test002"],
}
```

**接口响应参数说明**

| 参数名          | 类型     | 说明                                   |
|:-------------|:-------|:-------------------------------------|
| id           | string | 主键ID                                 |
| gid          | string | 群id                                  |
| name         | int8   | 群昵称                                  |
| avatar       | string | 群头像                                  |
| pubKey       | string | 群公钥                                  |
| created_at   | int64  | 创建时间                                 |
| creator_id   | string | 创建者                                  |
| owner_id     | string | 群主                                   |
| notice       | string | 群公告                                  |
| notice_md5   | string | 公告字符串md5加密 判定是否有更新                   |
| desc         | string | 群描述                                  |
| desc_md5     | string | 群描述字符串md5加密 判定是否有更新                  |
| cover        | string | 群封面                                  |
| is_enc       | int    | 是否加密 1-是 0-否 默认0                     |
| type         | int    | 群类型 1-普通 2-付费 3-私密                   |
| ban_type     | int    | 禁言类型 1-不禁言 2-全员禁言 3-仅管理员可发言 4-仅群主可发言 |
| search_type  | int    | 搜索类型 1-允许被搜索 2-不允许被搜索                |
| status       | int    | 群状态 1-正常 2-禁用                        |
| total        | int    | 当前总人数                                |
| member_limit | int    | 限制个数 默认100-待定也可根据配置                  |



**接口响应**

```
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "2e2bd92a86eb9b61",
                "gid": "2e2bd92a86eb9b61",
                "name": "test001",
                "avatar": "",
                "created_at": 1696839147569,
                "member_limit": 100,
                "total": 2,
                "pub_key": "",
                "owner_id": "0x7f90fadd2e3fdbacfd3ffc0c554fcf5878cc1601",
                "creator_id": "0x7f90fadd2e3fdbacfd3ffc0c554fcf5878cc1601",
                "notice": "",
                "notice_md5": "",
                "desc": "",
                "desc_md5": "",
                "cover": "",
                "is_enc": 0,
                "type": 1,
                "ban_type": 1,
                "search_type": 1,
                "status": 1
            }
        ],
        "status": 0
    },
    "msg": ""
}
```
