# app api

[toc]

## 应用

### 1.获取tag 列表

* path: `/system/tags/list`
* reqBody
  ```json
  {
    "type": 1
  }
  ```

* respBody
  ```json
   {
    "code": 200,
    "data": {
      "items": [{
          "id": 1,
          "name": "tagName",
          "sort": 1
        }]
    },
      "msg": ""
  }
  ```

### 2.应用列表

* path: `/apps/page`
* reqBody
  ```json
  {
  "page": 1,
  "limit": 20,
  "tag": "tagName",
  "sort": "",
  "groupId": ""
  }
  ```

| key     | desc   |   
| ------- | ------ |
| **groupId** | 群组id |

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
            "icon": "logo图表",
            "name": "应用名称",
            "desc": "描述",
            "avgStar": 4.5,
            "installCount": "使用人数",
            "groupInstallFlag": "true/false"
          }
        ]
    },
    "msg": ""
  }
  ```

| key              | desc                      |
| ---------------- | ------------------------- |
| avgStar          | 平均分，小数点后两位      |
| installCount     | 使用人数，                |
| groupInstallFlag | true-已安装，false-未安装 |

### 3.应用详情

* path: `/apps/detail`
* reqBody
  ```json
  {
    "appId": "",
    "groupId": "",
  }
  ```
* respBody
  ```json
  {
    "code": 200,
    "data": {
        "id": "",
        "icon": "",
        "name": "",
        "desc": "",
        "tags": {
          "name": "",
          "color": ""
        },
        "author": "作者",
        "activeAt": "上架时间",
        "avgStar": 4.5,
        "installCount": "使用人数",
        "detailImages": ["imageUrl"],
        "groupInstallFlag": "true/false"
    },
    "msg": ""
  }
  ```

| key              | param                     |
| ---------------- | ------------------------- |
| tags             | 标签及样式                |
| groupInstallFlag | true-已安装，false-未安装 |
| commentCount     | 评论数量 (后续可能会拆分) |

### 4.应用评论列表

* path: `/apps/comments/page`
* reqBody
  ```json
  {
    "appId": "",
    "page": 1,
    "limit": 20,
  }
  ```
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
            "id": "commentId",
            "uid": "",
            "username": "",
            "avatar": "用户头像",
            "star": "评论点赞数量",
            "score": "打分值",
            "createdAt": "",
            "content": "",
            "voteFlag": true
          }
        ]
    },
    "msg": ""
  }
  ```
| key       | desc                      |
| --------- | ------------------------- |
| id        | commentId                 |
| uid       | 评论用户                  |
| avatar    | 用户头像                  |
| username  | 用户昵称                  |
| star      | 评论的点赞数              |
| score     | 自己打分的分值            |
| createdAt | 评论时间                  |
| voteFlag  | true-已点赞，false 未点赞 |

### 5.应用打分（评论）

* path: `/apps/comments/create`
* reqBody
  ```json
  {
    "appId":"",
    "score": 5,
    "content": ""
  }
  ```
* respBody
  ```json
  {
    "code": 200,
    "data": "",
    "msg": ""
  }
  ```


### 6.应用内评论点赞

* path: `/apps/comments/vote`
* reqBody
  ```json
  {
    "appId":"",
    "commentId": ""
  }
  ```
* respBody
  ```json
  {
    "code": 200,
    "data": {
      "commentId":"",
      "voteFlag": "true/false"
    },
    "msg": ""
  }
  ```

## 群组

### 7.群组应用列表

* path: `/groups/app/list`

* reqBody
  ```json
  {
    "groupId": ""
  }
  ```
* respBody
  ```json
  {
  "code": 200,
  "data": {
      "items": [
        {
          "id":"",
          "name": "",
          "icon": ""
        }
      ]
    },
    "msg": ""
  }
  ```

### 8.添加群组应用

* path: `/groups/app/install`
* reqBody
  ```json
  {
    "groupId": "",
    "appId":"",
  }
  ```
* respBody
  ```json
  {
    "code": 200,
    "data": "",
    "msg": ""
  }
  ```

### 9.移除群组应用

* path: `/groups/app/uninstall`
* reqBody
  ```json
  {
    "groupId": "",
    "appId":"",
  }
  ```
* respBody
  ```json
  {
    "code": 200,
    "data": "",
    "msg": ""
  }
  ```
