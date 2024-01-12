### 用户相关

#### 批量获取用户信息

**请求URL：**

- `/user/get-batch-info`

**请求方式：**

- POST

**接口请求参数说明**

| 参数名  | 类型       | 说明    |
|:-----|:---------|:------|
| uids | []string | 用户ids |

**接口响应**

```
{
    "code": 200,
    "data": {
        "items":[
            {
                "id":"0xb1d3c24d3cd2ef52e6dc3ac6c06742a7dc17e041",
                "avatar":"https://img1.baidu.com/it/u=3709586903,1286591012\u0026fm=253\u0026fmt=auto\u0026app=138\u0026f=JPEG?w=500\u0026h=500",
                "name":"2hk3ki"
                "gender": 1
            }
        ]
    },
    "msg": ""
}
```

