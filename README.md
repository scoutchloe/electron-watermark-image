# 智能水印应用

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.3.11-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Electron-28.0.0-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/Element_Plus-2.4.4-409EFF?style=for-the-badge&logo=element&logoColor=white" alt="Element Plus">
</div>

<div align="center">
  <h3>🎨 现代化的图片水印添加工具</h3>
  <p>基于 Electron + Vue3 + TypeScript 开发的智能水印Windows应用程序</p>
</div>

## ✨ 功能特性

### 🖼️ 图片处理
- **多格式支持**: JPG、PNG、BMP、GIF、WEBP
- **拖拽上传**: 支持拖拽文件到应用窗口
- **批量处理**: 同时处理多张图片
- **实时预览**: Canvas 实时渲染水印效果

### 🎯 水印功能
- **字体选择**: 微软雅黑、宋体、黑体及系统字体（统一FontName(中文名)格式）
- **样式设置**: 字体大小(12-200px)、粗体、颜色选择
- **颜色选择**: 7种预设颜色 + 自定义颜色选择器
- **透明度控制**: 0-100% 精确调节
- **旋转角度**: -180°到180° 自由旋转
- **水印类型**: 单个水印、铺满水印（智能分布算法，考虑旋转边界框）
- **间距设置**: 1-552px 灵活调整（最小20px，确保文字完整显示）
- **智能保存**: 原始尺寸带水印图片，智能格式检测，文件名格式：原始名_watermark_13位时间戳

### 📋 预设模板
- 自定义文本水印
- 内部资料（双重红色边框 + 半透明背景）
- 保密（橙色虚线边框 + 半透明背景）
- 绝密（深红色实线边框 + 四角标记 + 半透明背景）
- 严禁复制（蓝色点线边框 + 对角线装饰 + 半透明背景）
- 时间地点水印（自动生成当前时间）

### ⚡ 用户体验
- **现代化UI**: 渐变色科技感界面
- **键盘快捷键**: 提升操作效率
- **状态管理**: Pinia 状态持久化
- **错误处理**: 友好的用户提示

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run electron:serve
```

### 构建应用
```bash
npm run electron:build
```

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + O` | 打开图片文件 |
| `Ctrl + S` | 保存当前图片 |
| `Delete` | 删除当前文件 |
| `← →` | 切换上一张/下一张图片 |
| `Ctrl + Z` | 重置水印配置 |
| `F1` | 显示帮助 |

## 🛠️ 技术架构

### 前端技术栈
- **Vue 3**: 渐进式JavaScript框架
- **TypeScript**: 类型安全的JavaScript超集
- **Element Plus**: Vue 3 UI组件库
- **Dart Sass**: 现代化CSS预处理器
- **Pinia**: Vue 状态管理库

### 桌面应用
- **Electron**: 跨平台桌面应用框架
- **Vite**: 现代化构建工具

### 图像处理
- **Canvas API**: 原生图像渲染
- **File API**: 文件读取和处理

## 📁 项目结构

```
├── package.json              # 项目配置
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
├── index.html                # 入口HTML
├── electron/                 # Electron 主进程
│   ├── main.ts              # 主进程入口
│   └── preload.ts           # 预加载脚本
├── src/                      # 源代码
│   ├── main.ts              # Vue 应用入口
│   ├── App.vue              # 根组件
│   ├── router/              # 路由配置
│   ├── views/               # 页面组件
│   │   └── WatermarkEditor.vue
│   ├── components/          # 通用组件
│   │   └── DragUpload.vue
│   ├── stores/              # 状态管理
│   │   └── watermark.ts
│   ├── composables/         # 组合式函数
│   │   └── useKeyboard.ts
│   └── styles/              # 样式文件
│       ├── main.scss
│       └── variables.scss
└── 开发计划.md               # 开发计划文档
```

## 🎨 界面预览

### 主界面
- 顶部工具栏：文件操作和设置
- 左侧控制面板：水印参数设置
- 中间预览区域：实时效果展示
- 右侧文件列表：多文件管理

### 设计特色
- 现代化渐变背景
- 毛玻璃效果卡片
- 响应式布局设计
- 流畅的动画过渡

## 🔧 开发指南

### 添加新的水印模板
```typescript
// 在 src/stores/watermark.ts 中添加
const templates = {
  // 现有模板...
  newTemplate: '新模板文本'
}
```

### 自定义快捷键
```typescript
// 在 src/views/WatermarkEditor.vue 中添加
registerShortcut({
  key: 'n',
  ctrl: true,
  callback: yourFunction,
  description: '功能描述'
})
```

## 📝 更新日志

### v1.5.2 (2024-05-26)
- 🔧 修复Electron打包后运行空白页面的问题
- 📦 移除不必要的fabric依赖，解决原生模块编译问题
- 🛠️ 优化Vite配置，生产环境使用相对路径加载资源
- ⚡ 增强Electron主进程配置，改善资源加载兼容性
- 🌐 配置npm镜像源，提高依赖下载速度
- 📋 完善构建流程文档和问题排查指南

### v1.5.1 (2024-05-26)
- 🎨 优化系统字体列表显示格式，统一为"FontName(中文名)"样式
- 🔤 添加完整的中文字体名称映射（微软雅黑、宋体、黑体、楷体等）
- 🛠️ 智能字体名称提取，确保渲染时使用正确的字体标识符
- 📋 扩展字体映射表，支持更多系统字体的友好显示
- ⚡ 保持向后兼容性，底层字体处理逻辑不变

### v1.5.0 (2024-05-26)
- 🎨 为特殊水印模板添加专业边框和装饰元素
- 🔒 内部资料模板：双重红色边框 + 半透明背景
- 🟠 保密模板：橙色虚线边框 + 半透明背景  
- 🔴 绝密模板：深红色实线边框 + 四角标记 + 半透明背景
- 🔵 严禁复制模板：蓝色点线边框 + 对角线装饰 + 半透明背景
- ⚡ 智能样式应用，选择模板时自动配置最佳颜色和字体
- 🎯 保持预览与保存的完全一致性

### v1.4.0 (2024-05-26)
- 🎯 重构预览渲染逻辑，实现真正的"所见即所得"效果
- 🔧 修复预览与保存图片不一致的问题，确保100%准确性
- 📐 优化单个水印定位，精确到像素级的坐标转换
- 🎨 统一水印渲染函数，预览和保存使用完全相同的算法
- ⚡ 性能优化，使用临时画布提高渲染效率

### v1.3.0 (2024-05-26)
- 🔧 修复Electron环境下保存功能核心问题，确保图片数据正确写入文件
- 🎯 修复Element Plus Radio组件警告，使用value属性替代已弃用的label属性
- 📊 增强调试信息，添加详细的保存过程日志
- 🎨 优化保存对话框，添加WEBP格式支持
- 🛡️ 清理已弃用的Electron配置项

### v1.2.0 (2024-05-26)
- 🔧 修复保存图片功能，确保水印图片正确保存
- 📝 优化文件名格式为：原始文件名_watermark_13位时间戳
- 🎨 智能格式检测，根据原始文件格式选择输出格式
- 🛡️ 改进错误处理机制，提供详细的错误信息

### v1.1.0 (2024-05-26)
- 🔧 优化水印分布算法，考虑文本旋转后的实际边界框
- 🎨 统一字体列表显示格式为FontName(中文名)
- ✨ 改进间距控制，确保水印文字完整显示
- 🐛 修复大间距时水印分布不均的问题

### v1.0.0 (2024-01-XX)
- ✨ 初始版本发布
- 🎯 完整的水印功能
- 🖼️ 多格式图片支持
- ⌨️ 键盘快捷键
- 🎨 现代化UI设计

## 🎯 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

Smart Watermark Team

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Element Plus](https://element-plus.org/) - Vue 3 UI组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

<div align="center">
  <p>如果这个项目对你有帮助，请给它一个 ⭐️</p>
</div> 