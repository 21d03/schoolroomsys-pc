# 人员分布统计页面接口文档

## 1. 人员总览数据接口

URL: http://localhost:8080/SchoolRoomSys/school/personnel/overview
请求方式: GET

### 请求头
Authorization: Bearer {token}

### 请求参数
无

### 响应结果
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "studentCount": 5000,     // 学生总数
    "teacherCount": 300,      // 教师总数
    "dormManagerCount": 50,   // 宿管人数
    "maintenanceCount": 20    // 维修人员数
  }
}
```

### 响应参数说明
| 参数名           | 类型   | 说明       |
| ---------------- | ------ | ---------- |
| studentCount     | Number | 学生总数   |
| teacherCount     | Number | 教师总数   |
| dormManagerCount | Number | 宿管人数   |
| maintenanceCount | Number | 维修人员数 |

### 请求示例
```bash
curl -X GET \
  'http://localhost:8080/SchoolRoomSys/school/personnel/overview' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 特别说明
1. 接口功能：获取学生、教师、宿管和维修人员的总数统计
2. 统计数据来源：
   - studentCount: student_info表的记录总数
   - teacherCount: teacher_info表的记录总数
   - dormManagerCount: house_master表的记录总数
   - maintenanceCount: repair_people表的记录总数
3. 无需任何请求参数
4. 接口返回的所有统计项目不会为null
5. 需要管理员权限才能调用此接口

## 2. 学院列表接口

URL: http://localhost:8080/SchoolRoomSys/school/college/list2
请求方式: GET

### 请求头
Authorization: Bearer {token}

### 请求参数
无

### 响应结果
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "collegeId": "1001",
      "collegeName": "计算机学院"
    },
    {
      "collegeId": "1002",
      "collegeName": "电子工程学院"
    }
  ]
}
```

### 响应参数说明
| 参数名      | 类型   | 说明     |
| ----------- | ------ | -------- |
| collegeId   | String | 学院ID   |
| collegeName | String | 学院名称 |

### 请求示例
```bash
curl -X GET \
  'http://localhost:8080/SchoolRoomSys/school/college/list' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 特别说明
1. 接口功能：获取所有学院信息列表
2. 数据来源：直接查询college_info表
3. 无需任何请求参数
4. 接口返回所有学院的ID和名称
5. 需要登录权限才能调用此接口

## 3. 各学院学生分布接口

URL: http://localhost:8080/SchoolRoomSys/school/college/student-distribution
请求方式: GET

### 请求头
Authorization: Bearer {token}

### 请求参数
无

### 响应结果
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "collegeId": "1001",
      "collegeName": "计算机学院",
      "studentCount": 1200
    },
    {
      "collegeId": "1002",
      "collegeName": "电子工程学院",
      "studentCount": 800
    }
  ]
}
```

### 响应参数说明
| 参数名       | 类型   | 说明           |
| ------------ | ------ | -------------- |
| collegeId    | String | 学院ID         |
| collegeName  | String | 学院名称       |
| studentCount | Number | 该学院学生人数 |

### 请求示例
```bash
curl -X GET \
  'http://localhost:8080/SchoolRoomSys/school/college/student-distribution' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 特别说明
1. 接口功能：获取各学院学生人数分布数据
2. 数据来源：
   - collegeId: college_info表的college_id
   - collegeName: college_info表的college_name
   - studentCount: student_info表中college字段匹配的记录数量
3. 处理逻辑：
   - 先从college_info表获取所有学院基本信息
   - 然后遍历每个学院，统计student_info表中对应学院的学生数量
4. 无需任何请求参数
5. 接口返回所有学院的ID、名称和学生人数
6. 需要登录权限才能调用此接口

## 4. 学生性别比例接口

### 接口信息
- **接口地址**：/school/personnel/student/gender-ratio
- **请求方式**：GET
- **接口描述**：获取全校学生男女性别比例数据

### 请求参数
无

### 响应参数
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "maleCount": 2800,
    "femaleCount": 2200
  }
}
```

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| maleCount | Number | 男生人数 |
| femaleCount | Number | 女生人数 |

## 5. 班级人数分布接口

### 接口信息
- **接口地址**：/school/personnel/class/distribution
- **请求方式**：GET
- **接口描述**：获取班级人数分布数据，可按学院筛选

### 请求参数

| 参数名 | 必选 | 类型 | 说明 |
| --- | --- | --- | --- |
| collegeId | 否 | String | 学院ID，不传则返回所有学院的班级 |

### 响应参数
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "classId": "2001",
      "className": "计算机科学与技术1班",
      "collegeId": "1001",
      "collegeName": "计算机学院",
      "studentCount": 42
    },
    {
      "classId": "2002",
      "className": "软件工程2班",
      "collegeId": "1001",
      "collegeName": "计算机学院",
      "studentCount": 38
    }
  ]
}
```

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| classId | String | 班级ID |
| className | String | 班级名称 |
| collegeId | String | 所属学院ID |
| collegeName | String | 所属学院名称 |
| studentCount | Number | 班级学生人数 |

## 6. 人员覆盖率接口

### 接口信息
- **接口地址**：/school/personnel/coverage-rate
- **请求方式**：GET
- **接口描述**：获取人员管理覆盖率数据

### 请求参数
无

### 响应参数
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "studentCoverage": 98.5,
    "teacherCoverage": 95.2,
    "dormManagerCoverage": 100,
    "maintenanceCoverage": 90.8,
    "classCoverage": 97.3
  }
}
```

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| studentCoverage | Number | 学生管理覆盖率(%) |
| teacherCoverage | Number | 教师分配覆盖率(%) |
| dormManagerCoverage | Number | 宿舍管理覆盖率(%) |
| maintenanceCoverage | Number | 维修响应覆盖率(%) |
| classCoverage | Number | 班级覆盖率(%) |

## 错误码说明

| 错误码 | 说明 |
| --- | --- |
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 数据不存在 |
| 5001 | 系统内部错误 | 