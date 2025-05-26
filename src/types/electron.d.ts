// Electron API 类型声明
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

export {} // 确保这是一个模块 