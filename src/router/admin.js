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
      redirect: '/admin/approval/overview',
      meta: { title: '审批管理' },
      children: [
        {
          path: 'overview',
          name: 'ApprovalOverview',
          component: () => import('@/views/admin/approval/overview/index.vue'),
          meta: { title: '审批概览' }
        },
        {
          path: 'leave',
          name: 'LeaveApproval',
          component: () => import('@/views/admin/approval/leave/index.vue'),
          meta: { title: '请假审批' }
        },
        {
          path: 'repair',
          name: 'RepairApproval',
          component: () => import('@/views/admin/approval/repair/index.vue'),
          meta: { title: '报修审批' }
        }
      ]
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
          component: () => import('@/views/admin/statistics/resource/index.vue'),
          meta: { title: '宿舍资源分析' }
        },
        {
          path: 'distribution',
          name: 'PersonnelDistribution',
          component: () => import('@/views/admin/statistics/distribution/index.vue'),
          meta: { title: '人员分布统计' }
        }
      ]
    },
    {
      path: 'settings',
      name: 'SystemSettings',
      redirect: '/admin/settings/college',
      meta: { title: '系统设置' },
      children: [
        {
          path: 'college',
          name: 'CollegeManagement',
          component: () => import('@/views/admin/settings/college/index.vue'),
          meta: { title: '学院管理' }
        },
        {
          path: 'class',
          name: 'ClassManagement',
          component: () => import('@/views/admin/settings/class/index.vue'),
          meta: { title: '班级管理' }
        }
      ]
    }
  ]
} 