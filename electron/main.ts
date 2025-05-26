import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { readdir, writeFile } from 'fs/promises'

const isDev = process.env.NODE_ENV === 'development'

// 禁用安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let mainWindow: BrowserWindow | null = null

async function createWindow(): Promise<void> {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true
    }
  })

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境加载本地文件
    const indexPath = join(__dirname, '../dist/index.html')
    console.log('Loading file from:', indexPath)
    console.log('__dirname:', __dirname)
    console.log('process.cwd():', process.cwd())
    
    try {
      // 使用file://协议直接加载
      const fileUrl = `file://${indexPath.replace(/\\/g, '/')}`
      console.log('Loading URL:', fileUrl)
      
      await mainWindow.loadURL(fileUrl)
      console.log('Successfully loaded index.html')
      
      // 生产环境也打开开发者工具用于调试
      mainWindow.webContents.openDevTools()
      
      // 监听控制台消息
      mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`Console [${level}]: ${message}`)
        if (sourceId) {
          console.log(`  at ${sourceId}:${line}`)
        }
      })
      
      // 监听页面加载完成
      mainWindow.webContents.on('did-finish-load', () => {
        console.log('Page finished loading')
      })
      
      // 监听页面加载失败
      mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('Page failed to load:', errorCode, errorDescription, validatedURL)
      })
      
    } catch (error) {
      console.error('Failed to load index.html:', error)
      // 显示错误信息
      mainWindow.loadURL(`data:text/html,
        <html>
          <head><title>加载错误</title></head>
          <body style="font-family: Microsoft YaHei; padding: 20px; text-align: center;">
            <h1>应用加载失败</h1>
            <p>无法加载主页面文件</p>
            <p>路径: ${indexPath}</p>
            <p>错误: ${error instanceof Error ? error.message : String(error)}</p>
          </body>
        </html>
      `)
    }
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 应用准备就绪时创建窗口
app.whenReady().then(async () => {
  await createWindow()

  // macOS 特殊处理
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    }
  })

  // 设置应用菜单
  createMenu()
})

// 所有窗口关闭时退出应用（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 创建应用菜单
function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开图片',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            openImageDialog()
          }
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-save')
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: '关于智能水印',
              message: '智能水印应用',
              detail: '版本 1.0.0\n现代化的图片水印添加工具'
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 打开图片对话框
async function openImageDialog() {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '选择图片',
    filters: [
      { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile', 'multiSelections']
  })

  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow?.webContents.send('files-selected', result.filePaths)
  }
}

// IPC 处理程序
ipcMain.handle('get-system-fonts', async () => {
  try {
    // 字体名称映射表
    const fontNameMap: Record<string, string> = {
      'Microsoft YaHei': 'Microsoft YaHei(微软雅黑)',
      'SimSun': 'SimSun(宋体)',
      'SimHei': 'SimHei(黑体)',
      'KaiTi': 'KaiTi(楷体)',
      'FangSong': 'FangSong(仿宋)',
      'Microsoft JhengHei': 'Microsoft JhengHei(微软正黑体)',
      'NSimSun': 'NSimSun(新宋体)',
      'LiSu': 'LiSu(隶书)',
      'YouYuan': 'YouYuan(幼圆)',
      'STXihei': 'STXihei(华文细黑)',
      'STKaiti': 'STKaiti(华文楷体)',
      'STSong': 'STSong(华文宋体)',
      'STZhongsong': 'STZhongsong(华文中宋)',
      'STFangsong': 'STFangsong(华文仿宋)',
      'Arial': 'Arial',
      'Times New Roman': 'Times New Roman',
      'Calibri': 'Calibri',
      'Verdana': 'Verdana',
      'Tahoma': 'Tahoma',
      'Georgia': 'Georgia',
      'Trebuchet MS': 'Trebuchet MS',
      'Comic Sans MS': 'Comic Sans MS'
    }
    
    // Windows 系统字体目录
    const fontDirs = [
      'C:/Windows/Fonts',
      'C:/Users/' + process.env.USERNAME + '/AppData/Local/Microsoft/Windows/Fonts'
    ]
    
    const fonts = new Set<string>()
    
    // 添加常用字体（使用映射后的名称）
    Object.values(fontNameMap).forEach(fontName => {
      fonts.add(fontName)
    })
    
    // 尝试读取系统字体目录
    for (const dir of fontDirs) {
      try {
        const files = await readdir(dir)
        files.forEach(file => {
          if (file.endsWith('.ttf') || file.endsWith('.otf')) {
            const fontName = file.replace(/\.(ttf|otf)$/i, '')
            // 如果有映射，使用映射名称，否则使用原名称
            const displayName = fontNameMap[fontName] || fontName
            fonts.add(displayName)
          }
        })
      } catch (error) {
        // 忽略无法访问的目录
      }
    }
    
    return Array.from(fonts).sort()
  } catch (error) {
    console.error('获取系统字体失败:', error)
    // 返回默认字体列表
    return [
      'Microsoft YaHei(微软雅黑)',
      'SimSun(宋体)',
      'SimHei(黑体)',
      'KaiTi(楷体)',
      'FangSong(仿宋)',
      'Arial',
      'Times New Roman',
      'Calibri'
    ]
  }
})

ipcMain.handle('save-image', async (event, imageData: string, fileName: string) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: '保存图片',
      defaultPath: fileName,
      filters: [
        { name: 'PNG 图片', extensions: ['png'] },
        { name: 'JPEG 图片', extensions: ['jpg', 'jpeg'] },
        { name: 'WEBP 图片', extensions: ['webp'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })

    if (!result.canceled && result.filePath) {
      // 将base64数据转换为Buffer
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      
      // 写入文件
      await writeFile(result.filePath, buffer)
      console.log('图片保存成功:', result.filePath)
      
      return result.filePath
    }
    return null
  } catch (error) {
    console.error('保存图片失败:', error)
    return null
  }
})

ipcMain.handle('show-error-dialog', async (event, title: string, content: string) => {
  await dialog.showErrorBox(title, content)
})

ipcMain.handle('show-info-dialog', async (event, title: string, content: string) => {
  await dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title,
    message: content
  })
}) 