<template>
  <div
    class="drag-upload"
    :class="{ 'drag-over': isDragOver }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <div class="drag-content">
      <el-icon class="drag-icon"><UploadFilled /></el-icon>
      <p class="drag-text">拖拽图片到此处或</p>
      <el-button type="primary" @click="selectFiles">选择文件</el-button>
      <p class="drag-hint">支持 JPG、PNG、BMP、GIF、WEBP 格式</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 定义事件
const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

// 响应式数据
const isDragOver = ref(false)

// 拖拽事件处理
function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  // 只有当离开整个拖拽区域时才设置为false
  if (!e.currentTarget?.contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    ElMessage.warning('请选择图片文件')
    return
  }

  if (imageFiles.length !== files.length) {
    ElMessage.warning(`已过滤 ${files.length - imageFiles.length} 个非图片文件`)
  }

  emit('filesSelected', imageFiles)
}

// 选择文件
function selectFiles() {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/*'
  input.onchange = (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || [])
    if (files.length > 0) {
      emit('filesSelected', files)
    }
  }
  input.click()
}
</script>

<style lang="scss" scoped>
.drag-upload {
  border: 2px dashed $border-base;
  border-radius: $border-radius-large;
  padding: $spacing-xxl;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all $transition-base;
  cursor: pointer;

  &:hover {
    border-color: $primary-color;
    background: rgba(255, 255, 255, 0.9);
  }

  &.drag-over {
    border-color: $primary-color;
    background: rgba(102, 126, 234, 0.1);
    transform: scale(1.02);
  }
}

.drag-content {
  .drag-icon {
    font-size: 48px;
    color: $primary-color;
    margin-bottom: $spacing-md;
  }

  .drag-text {
    font-size: $font-size-lg;
    color: $text-regular;
    margin-bottom: $spacing-md;
  }

  .drag-hint {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-top: $spacing-md;
  }
}
</style> 