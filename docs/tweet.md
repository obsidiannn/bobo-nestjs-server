# 推文


### 1.搜索（群组）

* path: `/tweet/search`

* reqBody
  ```json
  {
    "keyword": ""
  }
  ```

* respBody
  ```json
  {
    "code": 200,
    "data": {
        "page": 1,
        "limit": 100,
        "items": [
          {
            "sourceId": "",
            "sourceType": "",
            "label": "",
            "desc": "",
            "memberCount": 100,
            "tags": [],
          }
        ],
        "status": 0
    },
    "msg": ""
  }
  ```

### 2.推文分页列表（推荐）

* path: `/tweet/recommend/page`

* reqBody
  ```json
  {
    "page": 1,
    "limit": 100,
    "keyword":""
  }
  ```
* respBody
  ```json
  {
    "code": 200,
    "data": {
        "page": 1,
        "limit": 100,
        "items": [
          {
            "authorId": "",
            "authorName": "",
            "authorAvatar":"",
            "createdAt": "",
            "medias": [],
            "commentLevel": 2,
            "longitude": 123.33,
            "latitude": 333.33,
            "address": "",
            "content": "",
            "retweetId":"",
            "retweetLabel":"",
            "voteCount": 12,
            "voteFlag": false,
            "retweetFlag": true,
            "retweetCount": 103,
            "commentCount": 16,
            "readCount": 23,
            "score": 32,
          }
        ],
        "status": 0
    },
    "msg": ""
  }
  ```

  * item  

| key          | desc                                    |
| ------------ | --------------------------------------- |
| authorId     | 作者id                                  |
| authorName   | 作者name                                |
| authorAvatar | 头像                                    |
| createdAt    |                                         |
| commentLevel | 是否可回复: 1 每个人，2 好友 3 不可回复 |
| longitude    | 经度                                    |
| latitude     | 纬度                                    |
| address      | 地址快照                                |
| retweetId    | 转帖id                                  |
| retweetLabel | 转帖摘要                                |
| voteCount    | 点赞数量(不包含你自己的点赞)            |
| voteFlag     | 是否点赞                                |
| commentCount | 评论数量                                |
| score        | 热度分值                                |
| medias       | 关联媒体                                |
| retweetFlag    | 自己是否转帖                            |
| retweetCount   | 转帖数量                                |

* medias

| key  | desc                 |
| ---- | -------------------- |
| url  | url path             |
| type | 1 图片 2 视频 3 音频 |
| sort | 排序，递增           |


### 3.推文分页列表（好友）

* path: `/tweet/friend/page`

* 出入参同#1

### 我的推文分页

* path `/tweet/mine/page`
* 出入参同#1

### 推文详情

* path `/tweet/detail`

### 发推/发评论

* path: `/tweet/post`

* reqBody
  ```json
  {
    "visibleType": 1,
    "retweetId": "",
    "parentId": "",
    "medias":[],
    "content":"",
    "longitude": 123.33,
    "latitude": 333.33,
    "commentLevel": 3,
  }
  ```

| key          | desc                                    |
| ------------ | --------------------------------------- |
| visibleType  | 可见性 1 公开 2 好友 3 自己 冗余        |
| commentLevel | 是否可回复: 1 每个人，2 好友 3 不可回复 |
| retweetId    | 是否转帖                                |
| parentId     | 主贴id，没有传空                        |
| content      | 内容                                    |
| medias       | 图文参数                                |
| longitude    | 经度                                    |
| latitude     | 纬度                                    |


* medias

| key  | desc                 |
| ---- | -------------------- |
| url  | url path             |
| type | 1 图片 2 视频 3 音频 |
| sort | 排序，递增           |

* respBody
  ```json
  {
    "code": "",
    "data": "",
    "msg": ""
  }
  ```

### 评论列表

* path: `/tweet/comment/page`

* reqBody
  ```json
  {
    "tweetId": "",
    "page": 1,
    "limit": 20
  }
  ```

* respBody
  ```json
  {
    "code": 200,
    "data": {
        "page": 1,
        "limit": 100,
        "items": [
          {
            "parentId": "",
            "authorId": "",
            "authorName": "",
            "authorAvatar":"",
            "createdAt": "",
            "medias": [],
            "commentLevel": 2,
            "longitude": 123.33,
            "latitude": 333.33,
            "address": "",
            "content": "",
            "retweetId":"",
            "retweetLabel":"",
            "voteCount": 12,
            "voteFlag": false,
            "commentCount": 16,
            "readCount": 23,
            "score": 32,
            "retweetFlag": true,
            "retweetCount": 132
          }
        ],
        "status": 0
    },
    "msg": ""
  }
  ```

* item  

| key          | desc                                    |
| ------------ | --------------------------------------- |
| authorId     | 作者id                                  |
| authorName   | 作者name                                |
| authorAvatar | 头像                                    |
| createdAt    |                                         |
| commentLevel | 是否可回复: 1 每个人，2 好友 3 不可回复 |
| longitude    | 经度                                    |
| latitude     | 纬度                                    |
| address      | 地址快照                                |
| retweetId    | 转帖id                                  |
| retweetLabel | 转帖摘要                                |
| voteCount    | 点赞数量(不包含你自己的点赞)            |
| voteFlag     | 是否点赞                                        |
| commentCount | 评论数量                                |
| score        | 热度分值                                |
| medias       | 关联媒体                                |
| retweetFlag    | 自己是否转帖                            |
| retweetCount   | 转帖数量                                |


* medias

| key  | desc                 |
| ---- | -------------------- |
| url  | url path             |
| type | 1 图片 2 视频 3 音频 |
| sort | 排序，递增           |



### 转发/取消转发
> 转帖不可评论、点赞

* path: `/tweet/retweet`

* reqBody
  ```json
  {
    "tweetId": ""
  }
  ```

* respBody
  ```json
  {
      "code: 200,
      "msg": "",
      "data": {
        "retweetFlag": true
      }
  }
  ```

### 点赞/取消点赞

* path: `/tweet/vote`

* reqBody
  ```json
  {
    "tweetId": ""
  }
  ```


* respBody
  ```json
  {
      "code: 200,
      "msg": "",
      "data": {
        "voteFlag": true
      }
  }
  ```
