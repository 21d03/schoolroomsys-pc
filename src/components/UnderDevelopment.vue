<template>
  <div class="under-development">
    <el-empty :image-size="200">
      <template #description>
        <div class="description">
          <h3>{{ title }}开发中</h3>
          <p>该功能正在开发中，敬请期待...</p>
        </div>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '页面'
  }
})
</script>

<style lang="scss" scoped>
.under-development {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;

  .description {
    text-align: center;

    h3 {
      font-size: 20px;
      color: #1890ff;
      margin-bottom: 8px;
    }

    p {
      color: #909399;
      font-size: 14px;
    }
  }
}
</style> 