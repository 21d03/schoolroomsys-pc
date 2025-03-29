# 学院管理接口文档

## 1. 学院分页查询接口

URL: http://localhost:8080/SchoolRoomSys/school/college/page
请求方式: GET

### 请求头
Authorization: Bearer {token}

### 请求参数
| 参数名      | 必选 | 类型   | 说明                                  |
| ----------- | ---- | ------ | ------------------------------------- |
| page        | 是   | Number | 当前页码，从1开始                     |
| size        | 是   | Number | 每页记录数                            |
| collegeName | 否   | String | 学院名称，用于模糊查询                |

### 响应结果
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "total": 5,
    "records": [
      {
        "collegeId": "1001",
        "collegeName": "计算机学院",
        "description": "计算机科学与技术、软件工程等相关专业",
        "createTime": "2023-01-15 10:30:00"
      },
      {
        "collegeId": "1002",
        "collegeName": "电子工程学院",
        "description": "电子信息、通信工程等相关专业",
        "createTime": "2023-01-16 14:20:00"
      }
    ]
  }
}
```

### 响应参数说明
| 参数名      | 类型   | 说明     |
| ----------- | ------ | -------- |
| total       | Number | 总记录数 |
| records     | Array  | 学院列表 |
| - collegeId   | String | 学院ID   |
| - collegeName | String | 学院名称 |
| - description | String | 学院描述 |
| - createTime  | String | 创建时间 |

### 请求示例
```bash
curl -X GET \
  'http://localhost:8080/SchoolRoomSys/school/college/page?page=1&size=10&collegeName=计算机' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## 2. 添加学院接口

URL: http://localhost:8080/SchoolRoomSys/school/college/add
请求方式: POST

### 请求头
Authorization: Bearer {token}
Content-Type: application/json

### 请求参数
```json
{
  "collegeId": "1006",
  "collegeName": "艺术学院",
  "description": "音乐、美术、设计等艺术类专业"
}
```

| 参数名      | 必选 | 类型   | 说明                               |
| ----------- | ---- | ------ | ---------------------------------- |
| collegeId   | 是   | String | 学院ID，3-10位字母或数字           |
| collegeName | 是   | String | 学院名称，2-20个字符               |
| description | 否   | String | 学院描述，最多200个字符            |

### 响应结果
```json
{
  "code": 1,
  "msg": "添加成功",
  "data": null
}
```

### 请求示例
```bash
curl -X POST \
  'http://localhost:8080/SchoolRoomSys/school/college/add' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "collegeId": "1006",
    "collegeName": "艺术学院",
    "description": "音乐、美术、设计等艺术类专业"
  }'
```

### 特别说明
1. collegeId必须唯一，若已存在则返回错误
2. 添加成功后，createTime由系统自动生成

## 3. 更新学院接口

URL: http://localhost:8080/SchoolRoomSys/school/college/update
请求方式: PUT

### 请求头
Authorization: Bearer {token}
Content-Type: application/json

### 请求参数
```json
{
  "collegeId": "1001",
  "collegeName": "计算机与信息工程学院",
  "description": "计算机科学与技术、软件工程、网络工程等相关专业"
}
```

| 参数名      | 必选 | 类型   | 说明                 |
| ----------- | ---- | ------ | -------------------- |
| collegeId   | 是   | String | 学院ID，不可修改     |
| collegeName | 是   | String | 学院名称，2-20个字符 |
| description | 否   | String | 学院描述，最多200个字符 |

### 响应结果
```json
{
  "code": 1,
  "msg": "更新成功",
  "data": null
}
```

### 请求示例
```bash
curl -X PUT \
  'http://localhost:8080/SchoolRoomSys/school/college/update' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "collegeId": "1001",
    "collegeName": "计算机与信息工程学院",
    "description": "计算机科学与技术、软件工程、网络工程等相关专业"
  }'
```

### 特别说明
1. collegeId用于确定要更新的学院，不可修改
2. 若学院不存在，则返回错误

## 4. 删除学院接口

URL: http://localhost:8080/SchoolRoomSys/school/college/delete/{collegeId}
请求方式: DELETE

### 请求头
Authorization: Bearer {token}

### 请求参数
| 参数名    | 必选 | 类型   | 说明   |
| --------- | ---- | ------ | ------ |
| collegeId | 是   | String | 学院ID |

### 响应结果
```json
{
  "code": 1,
  "msg": "删除成功",
  "data": null
}
```

### 请求示例
```bash
curl -X DELETE \
  'http://localhost:8080/SchoolRoomSys/school/college/delete/1001' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 特别说明
1. 删除前会检查学院下是否有关联的班级，若有则无法删除
2. 若学院不存在，则返回错误
3. 删除操作不可恢复，请谨慎操作

## 错误码说明

| 错误码 | 说明 |
| ------ | ---- |
| 1      | 成功 |
| 1001   | 参数错误 |
| 1002   | 数据不存在 |
| 1003   | 学院ID已存在 |
| 1004   | 存在关联班级，无法删除 |
| 5001   | 系统内部错误 | 