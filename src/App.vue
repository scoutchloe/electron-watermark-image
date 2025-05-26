<template>
  <div id="app" class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 移除加载动画
  const loading = document.querySelector('.loading')
  if (loading) {
    loading.remove()
  }
})
</script>

<style lang="scss">
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

// 全局样式重置
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// Element Plus 样式覆盖
.el-button {
  border-radius: 8px;
  font-weight: 500;
}

.el-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.el-input__wrapper {
  border-radius: 8px;
}

.el-select .el-input__wrapper {
  border-radius: 8px;
}

.el-slider__runway {
  border-radius: 4px;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style> 