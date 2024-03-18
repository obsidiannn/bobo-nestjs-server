##### 消息类型

| sourceType   | 描述     | sourceId | 跳转地址       |
| ------------ | -------- | -------- | -------------- |
| chat_user    | 用户消息 | chatId   | 检测后跳到chat |
| chat_group   | 群组消息 | chatId   | 检测后跳到chat |
| friend_apply | 好友申请 | 无       | 检测后审核列表       |
| apply_reject | 申请拒绝 | 无       | 检测后申请列表       |
| apply_agree  | 申请同意 | chatId   | 检测后跳到chat |

```js
{
  data: {
    sourceType: '',
    sourceId: '',
  }
}
```
