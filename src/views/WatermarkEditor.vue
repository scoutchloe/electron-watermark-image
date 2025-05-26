<template>
  <div class="watermark-editor">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="openFiles" :icon="FolderOpened">
          打开图片
        </el-button>
        <el-button @click="saveImage" :icon="Download" :disabled="!currentImage">
          保存图片
        </el-button>
      </div>
      <div class="toolbar-center">
        <h1 class="app-title">
          <el-icon><Picture /></el-icon>
          智能水印
        </h1>
      </div>
      <div class="toolbar-right">
        <el-button circle :icon="Setting" @click="showSettings = true" />
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧控制面板 -->
      <div class="control-panel">
        <el-card class="control-card">
          <template #header>
            <div class="card-header">
              <el-icon><Edit /></el-icon>
              <span>水印设置</span>
            </div>
          </template>

          <!-- 水印模板选择 -->
          <div class="control-section">
            <label class="control-label">水印模板</label>
            <el-select v-model="watermarkConfig.template" @change="applyTemplate" class="full-width">
              <el-option label="自定义文本" value="custom" />
              <el-option label="内部资料" value="internal" />
              <el-option label="保密" value="confidential" />
              <el-option label="绝密" value="secret" />
              <el-option label="严禁复制" value="no-copy" />
              <el-option label="时间地点" value="datetime" />
            </el-select>
          </div>

          <!-- 水印文本 -->
          <div class="control-section">
            <label class="control-label">水印文本</label>
            <el-input
              v-model="watermarkConfig.text"
              type="textarea"
              :rows="3"
              placeholder="请输入水印文本"
              @input="updatePreview"
            />
          </div>

          <!-- 字体设置 -->
          <div class="control-section">
            <label class="control-label">字体</label>
            <el-select v-model="watermarkConfig.fontFamily" @change="updatePreview" class="full-width">
              <el-option
                v-for="font in systemFonts"
                :key="font"
                :label="font"
                :value="font"
              />
            </el-select>
          </div>

          <!-- 字体大小 -->
          <div class="control-section">
            <label class="control-label">字体大小: {{ watermarkConfig.fontSize }}px</label>
            <el-slider
              v-model="watermarkConfig.fontSize"
              :min="12"
              :max="200"
              @change="updatePreview"
            />
          </div>

          <!-- 字体样式 -->
          <div class="control-section">
            <label class="control-label">字体样式</label>
            <div class="font-style-controls">
              <el-checkbox v-model="watermarkConfig.bold" @change="updatePreview">
                粗体
              </el-checkbox>
            </div>
          </div>

          <!-- 字体颜色 -->
          <div class="control-section">
            <label class="control-label">字体颜色</label>
            <div class="color-selection">
              <!-- 预设颜色 -->
              <div class="preset-colors">
                <div
                  v-for="color in presetColors"
                  :key="color"
                  class="color-item"
                  :class="{ active: watermarkConfig.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="selectColor(color)"
                ></div>
              </div>
              <!-- 自定义颜色选择器 -->
              <el-color-picker v-model="watermarkConfig.color" @change="updatePreview" />
            </div>
          </div>

          <!-- 透明度 -->
          <div class="control-section">
            <label class="control-label">透明度: {{ watermarkConfig.opacity }}%</label>
            <el-slider
              v-model="watermarkConfig.opacity"
              :min="0"
              :max="100"
              @change="updatePreview"
            />
          </div>

          <!-- 旋转角度 -->
          <div class="control-section">
            <label class="control-label">旋转角度: {{ watermarkConfig.rotation }}°</label>
            <el-slider
              v-model="watermarkConfig.rotation"
              :min="-180"
              :max="180"
              @change="updatePreview"
            />
          </div>

          <!-- 水印类型 -->
          <div class="control-section">
            <label class="control-label">水印类型</label>
            <el-radio-group v-model="watermarkConfig.type" @change="updatePreview">
              <el-radio value="single">单个水印</el-radio>
              <el-radio value="repeat">铺满水印</el-radio>
            </el-radio-group>
          </div>

          <!-- 间距设置（仅铺满水印时显示） -->
          <div v-if="watermarkConfig.type === 'repeat'" class="control-section">
            <label class="control-label">间距: {{ watermarkConfig.spacing }}px</label>
            <el-slider
              v-model="watermarkConfig.spacing"
              :min="1"
              :max="552"
              @change="updatePreview"
            />
          </div>
        </el-card>
      </div>

      <!-- 中间预览区域 -->
      <div class="preview-area">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <el-icon><View /></el-icon>
              <span>预览</span>
            </div>
          </template>

          <div class="preview-container">
            <div v-if="!currentImage" class="empty-preview">
              <DragUpload @files-selected="loadImages" />
            </div>
            <div v-else class="image-preview">
              <canvas
                ref="previewCanvas"
                class="preview-canvas"
                @click="handleCanvasClick"
              ></canvas>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧文件列表 -->
      <div class="file-panel">
        <el-card class="file-card">
          <template #header>
            <div class="card-header">
              <el-icon><Files /></el-icon>
              <span>文件列表</span>
            </div>
          </template>

          <div class="file-list">
            <div
              v-for="(file, index) in imageFiles"
              :key="index"
              class="file-item"
              :class="{ active: currentImageIndex === index }"
              @click="selectImage(index)"
            >
              <img :src="file.preview" alt="预览" class="file-thumbnail" />
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.size) }}</div>
              </div>
              <el-button
                type="danger"
                size="small"
                circle
                :icon="Delete"
                @click.stop="removeFile(index)"
              />
            </div>
          </div>

          <div v-if="imageFiles.length === 0" class="empty-files">
            <el-icon class="empty-icon"><FolderOpened /></el-icon>
            <p>暂无文件</p>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 设置对话框 -->
    <el-dialog v-model="showSettings" title="设置和帮助" width="600px">
      <div class="settings-content">
        <el-tabs>
          <el-tab-pane label="关于" name="about">
            <div class="about-section">
              <h3>关于智能水印</h3>
              <p>版本: 1.0.0</p>
              <p>现代化的图片水印添加工具</p>
              <p>支持多种水印样式和批量处理</p>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="快捷键" name="shortcuts">
            <div class="shortcuts-section">
              <h3>键盘快捷键</h3>
              <div class="shortcut-list">
                <div class="shortcut-item">
                  <span class="shortcut-key">Ctrl + O</span>
                  <span class="shortcut-desc">打开图片文件</span>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-key">Ctrl + S</span>
                  <span class="shortcut-desc">保存当前图片</span>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-key">Delete</span>
                  <span class="shortcut-desc">删除当前文件</span>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-key">← →</span>
                  <span class="shortcut-desc">切换上一张/下一张图片</span>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-key">Ctrl + Z</span>
                  <span class="shortcut-desc">重置水印配置</span>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-key">F1</span>
                  <span class="shortcut-desc">显示此帮助</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="showSettings = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import {
  FolderOpened,
  Download,
  Setting,
  Picture,
  Edit,
  View,
  Files,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useWatermarkStore } from '@/stores/watermark'
import DragUpload from '@/components/DragUpload.vue'
import { useKeyboard } from '@/composables/useKeyboard'

// 响应式数据
const showSettings = ref(false)
const previewCanvas = ref<HTMLCanvasElement>()
const currentImage = ref<HTMLImageElement | null>(null)
const currentImageIndex = ref(-1)
const systemFonts = ref<string[]>([])

// 图片文件列表
const imageFiles = ref<Array<{
  file: File
  name: string
  size: number
  preview: string
}>>([])

// 水印配置
const watermarkConfig = reactive({
  template: 'custom',
  text: '智能水印',
  fontFamily: 'Microsoft YaHei(微软雅黑)',
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

// 水印模板
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

// 特殊模板样式配置
const specialTemplateStyles = {
  internal: {
    hasFrame: true,
    frameStyle: 'double',
    frameColor: '#FF0000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 20
  },
  confidential: {
    hasFrame: true,
    frameStyle: 'dashed',
    frameColor: '#FF6600',
    backgroundColor: 'rgba(255, 102, 0, 0.1)',
    padding: 15
  },
  secret: {
    hasFrame: true,
    frameStyle: 'solid',
    frameColor: '#CC0000',
    backgroundColor: 'rgba(204, 0, 0, 0.15)',
    padding: 25,
    cornerMarks: true
  },
  'no-copy': {
    hasFrame: true,
    frameStyle: 'dotted',
    frameColor: '#0066CC',
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    padding: 18,
    diagonalLines: true
  }
}

// 使用 Pinia store
const watermarkStore = useWatermarkStore()

// 使用键盘快捷键
const { registerShortcut } = useKeyboard()

// 预设颜色
const presetColors = [
  '#FF0000', // 红色
  '#00FF00', // 绿色
  '#0000FF', // 蓝色
  '#FFFF00', // 黄色
  '#FF00FF', // 紫色
  '#00FFFF', // 青色
  '#000000'  // 黑色
]

// 生命周期
onMounted(async () => {
  await loadSystemFonts()
  setupElectronListeners()
  setupKeyboardShortcuts()
})

// 加载系统字体
async function loadSystemFonts() {
  try {
    if (window.electronAPI) {
      const fonts = await window.electronAPI.getSystemFonts()
      systemFonts.value = fonts
    } else {
      // 浏览器环境的默认字体（修改显示格式）
      systemFonts.value = [
        'Microsoft YaHei(微软雅黑)',
        'SimSun(宋体)',
        'SimHei(黑体)',
        'KaiTi(楷体)',
        'FangSong(仿宋)',
        'Arial',
        'Times New Roman',
        'Calibri',
        'Verdana'
      ]
    }
  } catch (error) {
    console.error('加载系统字体失败:', error)
    systemFonts.value = [
      'Microsoft YaHei(微软雅黑)', 
      'SimSun(宋体)', 
      'SimHei(黑体)'
    ]
  }
}

// 设置 Electron 事件监听
function setupElectronListeners() {
  if (window.electronAPI) {
    window.electronAPI.onFilesSelected((filePaths: string[]) => {
      loadImagesFromPaths(filePaths)
    })

    window.electronAPI.onMenuSave(() => {
      saveImage()
    })
  }
}

// 打开文件
function openFiles() {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/*'
  input.onchange = (e) => {
    const files = (e.target as HTMLInputElement).files
    if (files) {
      loadImages(Array.from(files))
    }
  }
  input.click()
}

// 加载图片文件
async function loadImages(files: File[]) {
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const preview = await createImagePreview(file)
      imageFiles.value.push({
        file,
        name: file.name,
        size: file.size,
        preview
      })
    }
  }

  if (imageFiles.value.length > 0 && currentImageIndex.value === -1) {
    selectImage(0)
  }
}

// 从文件路径加载图片（Electron环境）
async function loadImagesFromPaths(filePaths: string[]) {
  // 在实际应用中，这里需要通过 Electron 的 IPC 来读取文件
  // 目前先显示消息
  ElMessage.success(`选择了 ${filePaths.length} 个文件`)
}

// 创建图片预览
function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}

// 选择图片
async function selectImage(index: number) {
  currentImageIndex.value = index
  const fileData = imageFiles.value[index]
  
  const img = new Image()
  img.onload = () => {
    currentImage.value = img
    nextTick(() => {
      updatePreview()
    })
  }
  img.src = fileData.preview
}

// 移除文件
function removeFile(index: number) {
  imageFiles.value.splice(index, 1)
  
  if (currentImageIndex.value === index) {
    if (imageFiles.value.length > 0) {
      const newIndex = Math.min(index, imageFiles.value.length - 1)
      selectImage(newIndex)
    } else {
      currentImage.value = null
      currentImageIndex.value = -1
    }
  } else if (currentImageIndex.value > index) {
    currentImageIndex.value--
  }
}

// 应用模板
function applyTemplate() {
  const template = templates[watermarkConfig.template as keyof typeof templates]
  if (typeof template === 'function') {
    watermarkConfig.text = template()
  } else {
    watermarkConfig.text = template
  }
  
  // 如果是特殊模板，应用相应的样式设置
  const specialStyle = specialTemplateStyles[watermarkConfig.template as keyof typeof specialTemplateStyles]
  if (specialStyle) {
    // 设置颜色为边框颜色
    watermarkConfig.color = specialStyle.frameColor
    // 设置为粗体
    watermarkConfig.bold = true
    // 设置透明度稍高一些
    watermarkConfig.opacity = Math.max(watermarkConfig.opacity, 60)
  }
  
  updatePreview()
}

// 更新预览
function updatePreview() {
  if (!currentImage.value || !previewCanvas.value) return

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const img = currentImage.value
  
  // 创建一个临时画布，使用原始图片尺寸进行渲染
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return
  
  // 设置临时画布为原始图片尺寸
  tempCanvas.width = img.naturalWidth
  tempCanvas.height = img.naturalHeight
  
  // 在临时画布上绘制原图
  tempCtx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)
  
  // 在临时画布上绘制水印（使用原始尺寸，与保存时完全一致）
  drawWatermarkAtOriginalSize(tempCtx, img.naturalWidth, img.naturalHeight)
  
  // 计算预览画布的显示尺寸
  const maxWidth = 800
  const maxHeight = 600
  let displayWidth = img.naturalWidth
  let displayHeight = img.naturalHeight
  
  if (displayWidth > maxWidth || displayHeight > maxHeight) {
    const ratio = Math.min(maxWidth / displayWidth, maxHeight / displayHeight)
    displayWidth *= ratio
    displayHeight *= ratio
  }
  
  // 设置预览画布尺寸
  canvas.width = displayWidth
  canvas.height = displayHeight
  
  // 将临时画布的内容缩放绘制到预览画布上
  ctx.drawImage(tempCanvas, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, displayWidth, displayHeight)
}

// 提取字体的实际名称（去掉中文部分）
function extractFontName(displayName: string): string {
  // 如果包含括号，提取括号前的部分
  const match = displayName.match(/^([^(]+)/)
  return match ? match[1].trim() : displayName
}

// 在原始尺寸上绘制水印（与保存时使用相同的逻辑）
function drawWatermarkAtOriginalSize(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
  const config = watermarkConfig
  
  // 检查是否为特殊模板
  const isSpecialTemplate = specialTemplateStyles[config.template as keyof typeof specialTemplateStyles]
  
  // 设置字体样式
  const fontFamily = config.fontFamily === 'default' 
    ? 'Microsoft YaHei, sans-serif' 
    : extractFontName(config.fontFamily)
  const fontWeight = config.bold ? 'bold' : 'normal'
  ctx.font = `${fontWeight} ${config.fontSize}px ${fontFamily}`
  ctx.fillStyle = config.color
  ctx.globalAlpha = config.opacity / 100
  
  // 测量文本尺寸
  const metrics = ctx.measureText(config.text)
  const textWidth = metrics.width
  const textHeight = config.fontSize
  
  if (config.type === 'single') {
    // 单个水印 - 使用原始尺寸的坐标
    const x = config.x || canvasWidth / 2
    const y = config.y || canvasHeight / 2
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((config.rotation * Math.PI) / 180)
    
    if (isSpecialTemplate) {
      drawSpecialWatermark(ctx, config.text, textWidth, textHeight, isSpecialTemplate)
    } else {
      ctx.fillText(config.text, -textWidth / 2, textHeight / 2)
    }
    
    ctx.restore()
  } else {
    // 铺满水印 - 使用与保存时完全相同的算法
    const spacing = Math.max(config.spacing, 20) // 最小间距20px
    
    // 考虑旋转后的文本边界框
    const rotation = (config.rotation * Math.PI) / 180
    const cos = Math.abs(Math.cos(rotation))
    const sin = Math.abs(Math.sin(rotation))
    
    // 如果是特殊模板，需要考虑边框和内边距
    let effectiveTextWidth = textWidth
    let effectiveTextHeight = textHeight
    
    if (isSpecialTemplate) {
      effectiveTextWidth = textWidth + isSpecialTemplate.padding * 2
      effectiveTextHeight = textHeight + isSpecialTemplate.padding * 2
    }
    
    const rotatedWidth = effectiveTextWidth * cos + effectiveTextHeight * sin
    const rotatedHeight = effectiveTextWidth * sin + effectiveTextHeight * cos
    
    // 计算步长，确保有足够空间显示完整文本
    const stepX = rotatedWidth + spacing
    const stepY = rotatedHeight + spacing
    
    // 计算需要的行列数，确保完全覆盖画布
    const cols = Math.ceil(canvasWidth / stepX) + 2
    const rows = Math.ceil(canvasHeight / stepY) + 2
    
    // 计算起始位置，使水印网格居中
    const totalWidth = (cols - 1) * stepX
    const totalHeight = (rows - 1) * stepY
    const startX = (canvasWidth - totalWidth) / 2
    const startY = (canvasHeight - totalHeight) / 2
    
    // 绘制水印网格
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * stepX + rotatedWidth / 2
        const y = startY + row * stepY + rotatedHeight / 2
        
        // 检查水印是否在可见区域内（包含一定的边界容差）
        const margin = Math.max(rotatedWidth, rotatedHeight) / 2
        if (x > -margin && x < canvasWidth + margin && 
            y > -margin && y < canvasHeight + margin) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(rotation)
          
          if (isSpecialTemplate) {
            drawSpecialWatermark(ctx, config.text, textWidth, textHeight, isSpecialTemplate)
          } else {
            ctx.fillText(config.text, -textWidth / 2, textHeight / 4)
          }
          
          ctx.restore()
        }
      }
    }
  }
  
  ctx.globalAlpha = 1
}

// 绘制特殊样式水印
function drawSpecialWatermark(
  ctx: CanvasRenderingContext2D, 
  text: string, 
  textWidth: number, 
  textHeight: number, 
  style: any
) {
  const padding = style.padding
  const frameWidth = textWidth + padding * 2
  const frameHeight = textHeight + padding * 2
  
  // 绘制背景
  if (style.backgroundColor) {
    ctx.fillStyle = style.backgroundColor
    ctx.fillRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight)
  }
  
  // 绘制边框
  if (style.hasFrame) {
    ctx.strokeStyle = style.frameColor
    ctx.lineWidth = 3
    
    // 设置线条样式
    if (style.frameStyle === 'dashed') {
      ctx.setLineDash([10, 5])
    } else if (style.frameStyle === 'dotted') {
      ctx.setLineDash([3, 3])
    } else if (style.frameStyle === 'double') {
      ctx.setLineDash([])
      // 绘制双重边框
      ctx.strokeRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight)
      ctx.strokeRect(-frameWidth / 2 + 5, -frameHeight / 2 + 5, frameWidth - 10, frameHeight - 10)
    } else {
      ctx.setLineDash([])
      ctx.strokeRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight)
    }
    
    if (style.frameStyle !== 'double') {
      ctx.strokeRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight)
    }
    
    ctx.setLineDash([]) // 重置线条样式
  }
  
  // 绘制角标（仅限绝密）
  if (style.cornerMarks) {
    const markSize = 15
    ctx.fillStyle = style.frameColor
    // 左上角
    ctx.fillRect(-frameWidth / 2, -frameHeight / 2, markSize, markSize)
    // 右上角
    ctx.fillRect(frameWidth / 2 - markSize, -frameHeight / 2, markSize, markSize)
    // 左下角
    ctx.fillRect(-frameWidth / 2, frameHeight / 2 - markSize, markSize, markSize)
    // 右下角
    ctx.fillRect(frameWidth / 2 - markSize, frameHeight / 2 - markSize, markSize, markSize)
  }
  
  // 绘制对角线（仅限严禁复制）
  if (style.diagonalLines) {
    ctx.strokeStyle = style.frameColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    // 左上到右下
    ctx.beginPath()
    ctx.moveTo(-frameWidth / 2, -frameHeight / 2)
    ctx.lineTo(frameWidth / 2, frameHeight / 2)
    ctx.stroke()
    // 右上到左下
    ctx.beginPath()
    ctx.moveTo(frameWidth / 2, -frameHeight / 2)
    ctx.lineTo(-frameWidth / 2, frameHeight / 2)
    ctx.stroke()
    ctx.setLineDash([])
  }
  
  // 绘制文本
  ctx.fillStyle = watermarkConfig.color
  ctx.fillText(text, -textWidth / 2, textHeight / 4)
}

// 处理画布点击（用于单个水印定位）
function handleCanvasClick(event: MouseEvent) {
  if (watermarkConfig.type !== 'single') return
  
  const canvas = previewCanvas.value
  if (!canvas || !currentImage.value) return
  
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 计算预览画布与原始图片的缩放比例
  const img = currentImage.value
  const scaleX = img.naturalWidth / canvas.width
  const scaleY = img.naturalHeight / canvas.height
  
  // 转换为原始图片坐标
  watermarkConfig.x = x * scaleX
  watermarkConfig.y = y * scaleY
  
  updatePreview()
}

// 保存图片
async function saveImage() {
  console.log('开始保存图片...')
  
  if (!currentImage.value || !previewCanvas.value) {
    ElMessage.warning('请先选择图片')
    console.log('保存失败：没有选择图片')
    return
  }

  try {
    console.log('创建保存画布...')
    // 创建一个新的canvas用于保存原始尺寸的图片
    const saveCanvas = document.createElement('canvas')
    const saveCtx = saveCanvas.getContext('2d')
    if (!saveCtx) {
      ElMessage.error('无法创建画布')
      console.error('保存失败：无法创建画布上下文')
      return
    }

    const img = currentImage.value
    console.log('图片尺寸:', img.naturalWidth, 'x', img.naturalHeight)
    
    saveCanvas.width = img.naturalWidth
    saveCanvas.height = img.naturalHeight

    // 绘制原图
    console.log('绘制原图...')
    saveCtx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)

    // 绘制水印（使用原始尺寸）
    console.log('绘制水印...')
    drawWatermarkAtOriginalSize(saveCtx, img.naturalWidth, img.naturalHeight)

    // 生成13位时间戳
    const timestamp = Date.now().toString()
    console.log('生成时间戳:', timestamp)
    
    // 生成文件名（原始文件名+watermark+13位时间戳）
    const originalFile = imageFiles.value[currentImageIndex.value]
    console.log('原始文件:', originalFile.name)
    
    const nameWithoutExt = originalFile.name.replace(/\.[^/.]+$/, '')
    const ext = originalFile.name.split('.').pop() || 'png'
    const newFileName = `${nameWithoutExt}_watermark_${timestamp}.${ext}`
    console.log('新文件名:', newFileName)

    // 根据原始文件扩展名确定输出格式
    let outputFormat = 'image/png'
    let quality = 0.9
    
    if (ext.toLowerCase() === 'jpg' || ext.toLowerCase() === 'jpeg') {
      outputFormat = 'image/jpeg'
    } else if (ext.toLowerCase() === 'webp') {
      outputFormat = 'image/webp'
    }
    
    console.log('输出格式:', outputFormat, '质量:', quality)

    console.log('生成图片数据...')
    const dataURL = saveCanvas.toDataURL(outputFormat, quality)
    console.log('数据URL长度:', dataURL.length)
    
    if (window.electronAPI) {
      // Electron 环境
      console.log('使用Electron保存...')
      const savedPath = await window.electronAPI.saveImage(dataURL, newFileName)
      if (savedPath) {
        ElMessage.success(`图片保存成功: ${newFileName}`)
        console.log('Electron保存成功:', savedPath)
      } else {
        ElMessage.error('保存失败')
        console.error('Electron保存失败')
      }
    } else {
      // 浏览器环境下载
      console.log('使用浏览器下载...')
      try {
        const link = document.createElement('a')
        link.download = newFileName
        link.href = dataURL
        link.style.display = 'none'
        
        console.log('添加下载链接到DOM...')
        document.body.appendChild(link)
        
        console.log('触发下载...')
        link.click()
        
        console.log('清理DOM...')
        setTimeout(() => {
          document.body.removeChild(link)
        }, 100)
        
        ElMessage.success(`图片下载成功: ${newFileName}`)
        console.log('浏览器下载成功')
      } catch (downloadError) {
        console.error('浏览器下载失败:', downloadError)
        ElMessage.error('下载失败')
      }
    }
  } catch (error) {
    console.error('保存图片失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    ElMessage.error(`保存图片失败: ${errorMessage}`)
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 设置键盘快捷键
function setupKeyboardShortcuts() {
  // Ctrl+O - 打开文件
  registerShortcut({
    key: 'o',
    ctrl: true,
    callback: openFiles,
    description: '打开图片文件'
  })

  // Ctrl+S - 保存图片
  registerShortcut({
    key: 's',
    ctrl: true,
    callback: saveImage,
    description: '保存当前图片'
  })

  // Delete - 删除当前文件
  registerShortcut({
    key: 'Delete',
    callback: () => {
      if (currentImageIndex.value >= 0) {
        removeFile(currentImageIndex.value)
      }
    },
    description: '删除当前文件'
  })

  // 左右箭头键 - 切换图片
  registerShortcut({
    key: 'ArrowLeft',
    callback: () => {
      if (currentImageIndex.value > 0) {
        selectImage(currentImageIndex.value - 1)
      }
    },
    description: '上一张图片'
  })

  registerShortcut({
    key: 'ArrowRight',
    callback: () => {
      if (currentImageIndex.value < imageFiles.value.length - 1) {
        selectImage(currentImageIndex.value + 1)
      }
    },
    description: '下一张图片'
  })

  // Ctrl+Z - 重置水印配置
  registerShortcut({
    key: 'z',
    ctrl: true,
    callback: () => {
      Object.assign(watermarkConfig, {
        template: 'custom',
        text: '智能水印',
        fontFamily: 'Microsoft YaHei(微软雅黑)',
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
      updatePreview()
      ElMessage.success('已重置水印配置')
    },
    description: '重置水印配置'
  })

  // F1 - 显示快捷键帮助
  registerShortcut({
    key: 'F1',
    callback: () => {
      showSettings.value = true
    },
    description: '显示设置和帮助'
  })
}

// 选择预设颜色
function selectColor(color: string) {
  watermarkConfig.color = color
  updatePreview()
}
</script>

<style lang="scss" scoped>
.watermark-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $primary-gradient;
}

.toolbar {
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  box-shadow: $shadow-light;

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .toolbar-center {
    flex: 1;
    display: flex;
    justify-content: center;

    .app-title {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $primary-color;
      margin: 0;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md;
  overflow: hidden;
}

.control-panel {
  width: 320px;
  overflow-y: auto;

  .control-card {
    height: 100%;
  }
}

.preview-area {
  flex: 1;
  overflow: hidden;

  .preview-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      padding: 0;
    }
  }
}

.file-panel {
  width: 280px;
  overflow-y: auto;

  .file-card {
    height: 100%;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-weight: $font-weight-medium;
}

.control-section {
  margin-bottom: $spacing-lg;

  .control-label {
    display: block;
    margin-bottom: $spacing-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .font-style-controls {
    display: flex;
    gap: $spacing-sm;
  }

  .color-selection {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .preset-colors {
      display: flex;
      gap: $spacing-xs;
      flex-wrap: wrap;

      .color-item {
        width: 24px;
        height: 24px;
        border-radius: $border-radius-small;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all $transition-fast;

        &:hover {
          transform: scale(1.1);
          box-shadow: $shadow-light;
        }

        &.active {
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
        }
      }
    }
  }
}

.preview-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  position: relative;
}

.empty-preview {
  text-align: center;
  color: $text-secondary;

  .empty-icon {
    font-size: 64px;
    margin-bottom: $spacing-md;
    color: $text-placeholder;
  }

  p {
    margin-bottom: $spacing-lg;
    font-size: $font-size-lg;
  }
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.preview-canvas {
  max-width: 100%;
  max-height: 100%;
  cursor: crosshair;
  box-shadow: $shadow-base;
  border-radius: $border-radius-base;
}

.file-list {
  max-height: 500px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: all $transition-base;
  margin-bottom: $spacing-sm;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  &.active {
    background: rgba(102, 126, 234, 0.2);
    border: 1px solid $primary-color;
  }

  .file-thumbnail {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: $border-radius-small;
    border: 1px solid $border-light;
  }

  .file-info {
    flex: 1;
    min-width: 0;

    .file-name {
      font-weight: $font-weight-medium;
      color: $text-primary;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-size {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
}

.empty-files {
  text-align: center;
  color: $text-secondary;
  padding: $spacing-xl;

  .empty-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
    color: $text-placeholder;
  }
}

.settings-content {
  h3 {
    margin-bottom: $spacing-md;
    color: $text-primary;
  }

  p {
    margin-bottom: $spacing-sm;
    color: $text-regular;
  }
}

.about-section {
  padding: $spacing-md 0;
}

.shortcuts-section {
  padding: $spacing-md 0;

  .shortcut-list {
    .shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-sm 0;
      border-bottom: 1px solid $border-light;

      &:last-child {
        border-bottom: none;
      }

      .shortcut-key {
        font-family: 'Courier New', monospace;
        background: $bg-secondary;
        padding: 4px 8px;
        border-radius: $border-radius-small;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $primary-color;
      }

      .shortcut-desc {
        color: $text-regular;
        flex: 1;
        margin-left: $spacing-md;
      }
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-lg) {
  .main-content {
    flex-direction: column;
    gap: $spacing-sm;
  }

  .control-panel,
  .file-panel {
    width: 100%;
    height: auto;
  }

  .preview-area {
    height: 400px;
  }
}
</style> 