import { onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  callback: () => void
  description: string
}

export function useKeyboard() {
  const shortcuts = new Map<string, KeyboardShortcut>()

  // 注册快捷键
  function registerShortcut(shortcut: KeyboardShortcut) {
    const key = createShortcutKey(shortcut)
    shortcuts.set(key, shortcut)
  }

  // 注销快捷键
  function unregisterShortcut(shortcut: Omit<KeyboardShortcut, 'callback' | 'description'>) {
    const key = createShortcutKey(shortcut)
    shortcuts.delete(key)
  }

  // 创建快捷键标识
  function createShortcutKey(shortcut: Omit<KeyboardShortcut, 'callback' | 'description'>) {
    const parts = []
    if (shortcut.ctrl) parts.push('ctrl')
    if (shortcut.alt) parts.push('alt')
    if (shortcut.shift) parts.push('shift')
    parts.push(shortcut.key.toLowerCase())
    return parts.join('+')
  }

  // 键盘事件处理
  function handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    const shortcutKey = createShortcutKey({
      key,
      ctrl: event.ctrlKey || event.metaKey, // Mac 上的 Cmd 键
      alt: event.altKey,
      shift: event.shiftKey
    })

    const shortcut = shortcuts.get(shortcutKey)
    if (shortcut) {
      event.preventDefault()
      event.stopPropagation()
      shortcut.callback()
    }
  }

  // 获取所有快捷键
  function getAllShortcuts() {
    return Array.from(shortcuts.values())
  }

  // 格式化快捷键显示
  function formatShortcut(shortcut: KeyboardShortcut) {
    const parts = []
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.shift) parts.push('Shift')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    registerShortcut,
    unregisterShortcut,
    getAllShortcuts,
    formatShortcut
  }
} 