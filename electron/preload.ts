import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 系统字体相关
  getSystemFonts: () => ipcRenderer.invoke('get-system-fonts'),
  
  // 文件操作相关
  saveImage: (imageData: string, fileName: string) => 
    ipcRenderer.invoke('save-image', imageData, fileName),
  
  // 对话框相关
  showErrorDialog: (title: string, content: string) => 
    ipcRenderer.invoke('show-error-dialog', title, content),
  showInfoDialog: (title: string, content: string) => 
    ipcRenderer.invoke('show-info-dialog', title, content),
  
  // 事件监听
  onFilesSelected: (callback: (filePaths: string[]) => void) => {
    ipcRenderer.on('files-selected', (event, filePaths) => callback(filePaths))
  },
  
  onMenuSave: (callback: () => void) => {
    ipcRenderer.on('menu-save', () => callback())
  },
  
  // 移除事件监听
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
})

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      getSystemFonts: () => Promise<string[]>
      saveImage: (imageData: string, fileName: string) => Promise<string | null>
      showErrorDialog: (title: string, content: string) => Promise<void>
      showInfoDialog: (title: string, content: string) => Promise<void>
      onFilesSelected: (callback: (filePaths: string[]) => void) => void
      onMenuSave: (callback: () => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
} 