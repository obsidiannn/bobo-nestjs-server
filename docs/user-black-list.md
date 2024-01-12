
#### 添加拉黑

**请求URL：**

- `/auth/add-user-black`
  
**接口请求参数说明**

| 参数名 | 类型     | 说明   |
|:----|:-------|:-----|
| uid | string | 用户ID |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```


#### 移除黑名单

**请求URL：**

- `/auth/remove-user-black`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名 | 类型     | 说明   |
|:----|:-------|:-----|
| uid | string | 用户ID |

**接口响应**

```
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

#### 黑名单列表

**请求URL：**

- `/auth/user-black-list`

**请求方式：**

- POST

**接口请求参数说明**
无

**接口响应参数说明**

| 参数名       | 类型     | 说明       |
|:----------|:-------|:---------|
| uid   | string | 被拉黑的用户Id |
| created_at | int    | 拉黑的时间    |

```
{
    "code": 200,
    "data": {
        "items":[
            {
                "uid":"0xb1d3c24d3cd2ef52",
                "created_at": 1311313
            }
        ]
    },
    "msg": ""
}
```
