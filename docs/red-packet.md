# 红包

### 1.发起红包

* path: `/red-packet/create`

* reqBody
  * 群组：普通
  ```json
  {
    "type": 1,
    "sourceType": 1,
    "singleAmount": 1000,
    "packetCount": 10,
    "groupId": "",
    "remark": "",
  }
  ```
  * 群组：拼手气
  ```json
  {
    "type": 2,
    "sourceType": 1,
    "totalAmount": 1000,
    "packetCount": 10,
    "groupId": "",
    "remark": "",
  }
  ```
  * 群组：指定
  ```json
  {
    "type": 3,
    "sourceType": 1,
    "singleAmount": 1000,
    "groupId": "",
    "objUIds": ["uids"],
    "remark": "",
  }
  ```
  * 单聊
  ```json
  {
    "type": 1,
    "sourceType": 2,
    "singleAmount": 1000,
    "objUIds": ["uids"],
    "remark": "",
  }
  ```

| key          | desc                         |
| ------------ | ---------------------------- |
| type         | 类型 1 普通，2 拼手气 3 专属 |
| sourceType   | 1 群聊 2 单聊                |
| singleAmount | 单个金额，单位分             |
| totalAmount  | 总金额，单位分               |
| packetCount  | 红包个数                     |
| groupId      | 群聊id                       |
| objUIds      | 指定人                       |
| remark       | 备注                             |

* respBody
  ```json
  {
    "chatId": "",
    "msgId": "",
    "sequence": "",
    "packetId": "",
    "createdBy":"",
    "createdUid":"",
    "createdAt": "",
    "expireSeconds": 40000,
    "enable": false,
    "remark": "",
  }
  ```

| key           | desc                             |
| ------------- | -------------------------------- |
| sequence      | 当前message的sequence            |
| packetId      | 红包id                           |
| createdBy     | 发起人的名称                     |
| createdAt     | 发起日期                         |
| expireSeconds | 过期秒                           |
| enable        | true： 可被领取，false：已被领取 |
| remark        | 备注                                 |


### 2.红包领取摘要

* path: `/red-packet/info`

* reqBody
  ```json
  {
    "id": "packetId"
  }
  ```

* respBody  
  ```json
  {
    "packetId": "",
    "expiredFlag":false,
    "enable": false,
  }
  ```

| key         | desc                                   |
| ----------- | -------------------------------------- |
| packetId    | 红包id                                 |
| expiredFlag | 是否过期  true 已经过期 false 没有过期 |
| enable      | true： 可被领取，false：已被领取       |


### 3.红包详情

* path: `/red-packetd/detail`

* reqBody
  ```json
  {
    "id": "packetId"
  }
  ```
* respBody
  ```json
  {
    "packetId": "",
    "type": "",
    "createdBy":"",
    "createdUid":"",
    "createdAt": "",
    "createdAvatar": "",
    "expireSeconds": 40000,
    "packetCount": 10,
    "totalAmount": 10000,
    "expiredFlag": false,
    "enable": false,
    "remark": "",
    "records": [
      {
        "uid": "",
        "uidDesc": "",
        "avatar": "",
        "amount": 1,
        "recordAt": ""
      }
    ]
  }
  ```

| key           | desc                             |
| ------------- | -------------------------------- |
| packetId      | 红包id                           |
| type          | 类型 1 普通，2 拼手气 3 专属     |
| createdBy     | 发起人的名称                     |
| createdUid    | 发起人id                         |
| createdAvatar | 发起人头像                       |
| createdAt     | 发起日期                         |
| expireSeconds | 过期秒                           |
| enable        | true： 可被领取，false：已被领取 |
| expiredFlag   | true 已经过期 false 没有过期     | 
| remark        | 备注                             |
| totalAmount   | 总金额（分）                     |
| packetCount   | 总数量                           |

* record item （领取记录）

| key      | desc       |
| -------- | ---------- |
| uid      | 领取人名称 |
| username | 用户名称   |
| avatar   | 领取人头像 |
| amount   | 领取金额   |
| recordAt | 领取时间   |


### 4.领取红包

* path: `/red-packet/apply`

* reqBody
  ```json
  {
    "id": "packetId"
  }
  ```

* respBody
  ```json
  {
    "createdUid":"",
    "createdDesc":"",
    "createdAvatar": "",
    "remark":"",
    "amount": 1,
    "packetId":"",
  }
  ```
