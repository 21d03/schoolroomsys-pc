# 宿舍资源分析接口文档

## 1. 宿舍资源总览接口

### 接口信息
- **URL**: `/school/dormitory/resource/overview`
- **方法**: GET
- **功能**: 获取宿舍资源的总体统计数据，包括宿舍楼总数、房间总数、床位总数和使用率

### 请求参数
无

### 响应参数
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "buildingCount": 10,       // 宿舍楼总数
    "roomCount": 500,          // 房间总数
    "bedCount": 2000,          // 床位总数
    "usageRate": 0.85          // 使用率，小数表示，如0.85表示85%
  }
}
```

## 2. 各宿舍楼房间分布接口

### 接口信息
- **URL**: `/school/dormitory/resource/room-distribution`
- **方法**: GET
- **功能**: 获取各宿舍楼的房间分布情况，包括总房间数、已使用房间数、空闲房间数和维修中房间数

### 请求参数
无

### 响应参数
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "buildingName": "1号楼",        // 宿舍楼名称
      "totalRooms": 100,              // 总房间数
      "usedRooms": 80,                // 已使用房间数
      "availableRooms": 15,           // 空闲房间数
      "underMaintenanceRooms": 5      // 维修中房间数
    },
    {
      "buildingName": "2号楼",
      "totalRooms": 120,
      "usedRooms": 100,
      "availableRooms": 18,
      "underMaintenanceRooms": 2
    }
    // ... 其他宿舍楼数据
  ]
}
```

## 3. 各宿舍楼使用率接口

### 接口信息
- **URL**: `/school/dormitory/resource/usage-rate`
- **方法**: GET
- **功能**: 获取各宿舍楼的使用率数据

### 请求参数
无

### 响应参数
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "buildingName": "1号楼",      // 宿舍楼名称
      "usageRate": 0.85             // 使用率，小数表示，如0.85表示85%
    },
    {
      "buildingName": "2号楼",
      "usageRate": 0.92
    }
    // ... 其他宿舍楼数据
  ]
}
```

## 4. 房间类型分布接口

### 接口信息
- **URL**: `/school/dormitory/resource/room-type`
- **方法**: GET
- **功能**: 获取不同房间类型的分布情况

### 请求参数
无

### 响应参数
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "typeName": "四人间",        // 房间类型名称
      "count": 200                 // 数量
    },
    {
      "typeName": "六人间",
      "count": 150
    },
    {
      "typeName": "八人间",
      "count": 100
    },
    {
      "typeName": "单人间",
      "count": 50
    }
    // ... 其他房间类型数据
  ]
}
```

## 5. 男女宿舍比例接口

### 接口信息
- **URL**: `/school/dormitory/resource/gender-ratio`
- **方法**: GET
- **功能**: 获取男生宿舍、女生宿舍和混合宿舍的数量比例

### 请求参数
无

### 响应参数
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "maleCount": 250,          // 男生宿舍数量
    "femaleCount": 230,        // 女生宿舍数量
    "mixedCount": 20           // 混合宿舍数量
  }
}
```

## 响应状态码说明

| 状态码 | 说明 |
| ------ | ---- |
| 0      | 成功 |
| 1      | 系统错误 |
| 2      | 参数错误 |
| 3      | 权限不足 |

## 注意事项

1. 所有接口均需管理员权限
2. 所有接口使用统一的状态码，返回结构相同
3. 所有数值类型数据应保证数据类型的一致性，使用率以小数形式返回
4. 接口需按需缓存常用数据，提升访问速度
5. 所有接口响应时间应控制在500ms以内 