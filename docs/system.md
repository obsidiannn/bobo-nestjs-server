### 系统相关


#### 获取系统公钥

**请求URL：**

- `/sys/info`

**请求方式：**

- POST

**接口响应参数说明**

| 参数名        | 类型     | 说明     |
|:-----------|:-------|:-------|
| pub_key    | string | 用户的公钥  |
| static_url | string | 静态资源地址 |

```
{
    "code": 200,
    "data": {
        "pub_key": "024297241d948c71dcc1b83f98563ceaca36150000fa389855aa84e79b88433e7b",
        "static_url": "https://static.miyayacn.cn"
    },
    "msg": ""
}
```

#### 文件上传获取预签名URL

**请求URL：**

- `/sys/pre-sign-url`

**请求方式：**

- POST

**接口响应参数说明**

| 参数名 | 类型     | 说明  |
|:----|:-------|:----|
| url | string | 预签名 |

```
{
    "code": 200,
    "data": {
        "url": "https://bobobo-test.bb05e19bea2bba53858a8eeadb1c55f3.r2.cloudflarestorage.com/miyaya.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=d71097891fd7fd38ccfe49720b37d20d%2F20231211%2F%2Fs3%2Faws4_request&X-Amz-Date=20231211T094304Z&X-Amz-Expires=900&X-Amz-SignedHeaders=expires%3Bhost&x-id=PutObject&X-Amz-Signature=bf9d7073492f14e88a492befd99d97b3fb48a340fbe8c31ff12f30b679b825ce"
    },
    "msg": ""
}
```

### WEBSOCKET相关

#### 初始化长链接

/wsConnect?address="0x7f90fadd2e3fdbacfd3ffc0c554fcf5878cc1601"&device_id="deviceId001"

#### 有新消息来长连接推送

**CMD类型说明**

| 参数名              | 说明    |
|:-----------------|:------|
| new_msg          | 新消息   |
| apply_friend_msg | 好友申请  |
| agree_add_friend | 同意加好友 |

```
{
"cmd":"new_msg",
"items":{
    "id":"ef4e009633ffde82", //msgId
    "sequence":13489,
    "chat_id":"1e567516ace3d6bebdbe6ea382227efb",
    }
}
```


#### 文件分片上传