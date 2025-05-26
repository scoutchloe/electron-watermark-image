import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export interface WatermarkConfig {
  template: string
  text: string
  fontFamily: string
  fontSize: number
  bold: boolean
  color: string
  opacity: number
  rotation: number
  type: 'single' | 'repeat'
  spacing: number
  x: number
  y: number
}

export interface ImageFile {
  file: File
  name: string
  size: number
  preview: string
}

export const useWatermarkStore = defineStore('watermark', () => {
  // 水印配置
  const config = reactive<WatermarkConfig>({
    template: 'custom',
    text: '智能水印',
    fontFamily: 'Microsoft YaHei',
    fontSize: 48,
    bold: false,
    color: '#FF0000',
    opacity: 50,
    rotation: -45,
    type: 'repeat',
    spacing: 100,
    x: 0,
    y: 0
  })

  // 图片文件列表
  const imageFiles = ref<ImageFile[]>([])
  
  // 当前选中的图片索引
  const currentImageIndex = ref(-1)
  
  // 系统字体列表
  const systemFonts = ref<string[]>([])

  // 预设模板
  const templates = {
    custom: '智能水印',
    internal: '内部资料',
    confidential: '保密',
    secret: '绝密',
    'no-copy': '严禁复制',
    datetime: () => {
      const now = new Date()
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    }
  }

  // 更新水印配置
  function updateConfig(newConfig: Partial<WatermarkConfig>) {
    Object.assign(config, newConfig)
  }

  // 应用模板
  function applyTemplate(templateKey: string) {
    const template = templates[templateKey as keyof typeof templates]
    if (typeof template === 'function') {
      config.text = template()
    } else if (template) {
      config.text = template
    }
    config.template = templateKey
  }

  // 添加图片文件
  function addImageFile(file: ImageFile) {
    imageFiles.value.push(file)
  }

  // 移除图片文件
  function removeImageFile(index: number) {
    imageFiles.value.splice(index, 1)
    if (currentImageIndex.value === index) {
      if (imageFiles.value.length > 0) {
        currentImageIndex.value = Math.min(index, imageFiles.value.length - 1)
      } else {
        currentImageIndex.value = -1
      }
    } else if (currentImageIndex.value > index) {
      currentImageIndex.value--
    }
  }

  // 设置当前图片索引
  function setCurrentImageIndex(index: number) {
    currentImageIndex.value = index
  }

  // 设置系统字体
  function setSystemFonts(fonts: string[]) {
    systemFonts.value = fonts
  }

  // 清空所有文件
  function clearFiles() {
    imageFiles.value = []
    currentImageIndex.value = -1
  }

  // 获取当前图片
  function getCurrentImage() {
    if (currentImageIndex.value >= 0 && currentImageIndex.value < imageFiles.value.length) {
      return imageFiles.value[currentImageIndex.value]
    }
    return null
  }

  // 保存配置到本地存储
  function saveConfigToStorage() {
    try {
      localStorage.setItem('watermark-config', JSON.stringify(config))
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  // 从本地存储加载配置
  function loadConfigFromStorage() {
    try {
      const saved = localStorage.getItem('watermark-config')
      if (saved) {
        const savedConfig = JSON.parse(saved)
        Object.assign(config, savedConfig)
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  return {
    // 状态
    config,
    imageFiles,
    currentImageIndex,
    systemFonts,
    templates,
    
    // 方法
    updateConfig,
    applyTemplate,
    addImageFile,
    removeImageFile,
    setCurrentImageIndex,
    setSystemFonts,
    clearFiles,
    getCurrentImage,
    saveConfigToStorage,
    loadConfigFromStorage
  }
}) 