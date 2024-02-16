

# 钱包
> 全部接口均为`post` 类型


## 1 钱包详情
* path: `/wallet/detail`
* reqBody: `{}`
* respBody:
  ```json
  {
    "code": 200,
    "data": {
      "balance": "余额（单位分）",
      "currency": "币种： utsd",
      "type": "1 普通 2 系统钱包"
    },
      "msg": ""
  }

  ```

## 2 账单

#### 2.1 账单列表（包含收支）

* path: `/bill/records`

* reqBody

```json
{
  "page": 1,
  "limit": 20,
  "inOut": 1,
  "type": 1
}
```

| key   | desc          | 必须 |
| ----- | ------------- | ---- |
| inOut | 1 收入 2 支出 | 否   |
| type  | 1-充值 2-提现 | 否   |

* respBody

```json
 {
    "code": 200,
    "data": {
        "page": 1,
        "limit": 20,
        "total": 231,
        "items": [
          {
            "id": "xx",
            "type": 1,
            "inOut": 1,
            "amount": "发生金额",
            "status": 1,
            "createdAt": "2023-12-01 11:00:00"
          }
        ]
    },
    "msg": ""
  }

```

| key       | desc                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| type      | 账单类型 1-充值 2-提现 3-转账 4-红包 5-群收款 6-群退款 7-群提现 8-申请群付费 |
| inOut  | 1 收入 2 支出                                                                |
| amount    | 发生金额，单位分                                                             |
| status    | 1 success，2 待支付,3 pending，4 失败                                        |
| createdAt | 发生日期                                                                     |

#### 2.2 账单详情
* `/bill/detail`

* reqBody
```json
{"id": "billId" }
```

## 3 充值

#### 3.1 在线支付

#### 3.2 礼品卡充值
* path: `/wallet/fill/bobo-card`

* reqBody

```json
{
  "cardNo":""
}
```

* respBody
```json
{
    "code": 200,
    "data": null,
    "msg": ""
}
```

## 6 提现



## 7 转账

* path: /wallet/remit

* reqBody
```json
{
  "objUId": "",
  "amount": 1,
  "remark": ""
}
```

* respBody

```json
{
    "code": 200,
    "data": {
      "billId":"",
      "transforNo": ""
    },
    "msg": ""
}
```

| key        | desc       |
| ---------- | ---------- |
| billId     | 账单主键   |
| transforNo | 交易流水号 | 
