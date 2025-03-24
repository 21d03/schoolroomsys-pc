import request from '@/utils/request'

// 获取宿舍楼列表
export function getBuildingList(params) {
  return request({
    url: '/api/building/list',
    method: 'get',
    params
  })
}

// 获取宿舍楼详情
export function getBuildingDetail(id) {
  return request({
    url: `/api/building/${id}`,
    method: 'get'
  })
}

// 新增宿舍楼
export function addBuilding(data) {
  return request({
    url: '/api/building',
    method: 'post',
    data
  })
}

// 更新宿舍楼
export function updateBuilding(id, data) {
  return request({
    url: `/api/building/${id}`,
    method: 'put',
    data
  })
}

// 删除宿舍楼
export function deleteBuilding(id) {
  return request({
    url: `/api/building/${id}`,
    method: 'delete'
  })
}

// 获取宿舍楼楼层分布图
export function getBuildingFloorPlan(id) {
  return request({
    url: `/api/building/${id}/floor-plan`,
    method: 'get'
  })
}

// 导出宿舍楼数据
export function exportBuildingData(params) {
  return request({
    url: '/api/building/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取宿管列表
export function getDormManagers() {
  return request({
    url: '/api/dorm-manager/list',
    method: 'get'
  })
} 