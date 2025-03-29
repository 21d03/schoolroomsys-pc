import AdminLayout from '@/layout/admin/index.vue'
import UnderDevelopment from '@/components/UnderDevelopment.vue'

export const adminRoutes = {
  path: '/admin',
  component: AdminLayout,
  redirect: '/admin/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/dashboard/index.vue'),
      meta: { title: '首页' }
    },
    {
      path: 'dormitory',
      name: 'DormitoryManagement',
      redirect: '/admin/dormitory/building',
      meta: { title: '宿舍管理' },
      children: [
        {
          path: 'building',
          name: 'BuildingManagement',
          component: () => import('@/views/admin/dormitory/building/index.vue'),
          meta: { title: '宿舍楼管理' }
        },
        {
          path: 'room',
          name: 'RoomManagement',
          component: () => import('@/views/admin/dormitory/room/index.vue'),
          meta: { title: '房间管理' }
        }
      ]
    },
    {
      path: 'personnel',
      name: 'PersonnelManagement',
      redirect: '/admin/personnel/student',
      meta: { title: '人员管理' },
      children: [
        {
          path: 'student',
          name: 'StudentManagement',
          component: () => import('@/views/admin/personnel/student/index.vue'),
          meta: { title: '学生管理' }
        },
        {
          path: 'teacher',
          name: 'TeacherManagement',
          component: () => import('@/views/admin/personnel/teacher/index.vue'),
          meta: { title: '教师管理' }
        },
        {
          path: 'dorm-manager',
          name: 'DormManagerManagement',
          component: () => import('@/views/admin/personnel/dorm-manager/index.vue'),
          meta: { title: '宿管管理' }
        },
        {
          path: 'maintenance',
          name: 'MaintenanceManagement',
          component: () => import('@/views/admin/personnel/maintenance/index.vue'),
          meta: { title: '维修人员管理' }
        }
      ]
    },
    {
      path: 'approval',
      name: 'ApprovalManagement',
      component: UnderDevelopment,
      meta: { title: '审批管理' }
    },
    {
      path: 'statistics',
      name: 'DataStatistics',
      redirect: '/admin/statistics/resource',
      meta: { title: '数据统计' },
      children: [
        {
          path: 'resource',
          name: 'ResourceAnalysis',
          component: UnderDevelopment,
          meta: { title: '宿舍资源分析' }
        },
        {
          path: 'distribution',
          name: 'PersonnelDistribution',
          component: UnderDevelopment,
          meta: { title: '人员分布统计' }
        }
      ]
    },
    {
      path: 'settings',
      name: 'SystemSettings',
      redirect: '/admin/settings/permission',
      meta: { title: '系统设置' },
      children: [
        {
          path: 'permission',
          name: 'PermissionConfig',
          component: UnderDevelopment,
          meta: { title: '权限配置' }
        },
        {
          path: 'college',
          name: 'CollegeManagement',
          component: UnderDevelopment,
          meta: { title: '学院/班级管理' }
        }
      ]
    }
  ]
} 