import pkg from '../package.json'

interface SharedManifest {
  homepage_url?: string // 插件主页
  content_scripts: chrome.runtime.ManifestBase['content_scripts']
  icons: chrome.runtime.ManifestIcons
  options_ui: chrome.runtime.ManifestBase['options_ui']
  permissions: chrome.runtime.ManifestPermissions[]
  externally_connectable: chrome.runtime.ManifestBase['externally_connectable']
}

// 共用配置
const sharedManifest: SharedManifest = {
  content_scripts: [
    {
      js: ['src/entries/content-script/index.ts'], // 向 window 注入 js 文件
      matches: ['*://*/*'], // 匹配的网址
      run_at: 'document_end' // 执行时机
    }
  ],
  // 扩展图标
  icons: {
    16: 'icons/icon48.png',
    19: 'icons/icon48.png',
    32: 'icons/icon48.png',
    38: 'icons/icon48.png',
    48: 'icons/icon48.png',
    64: 'icons/icon72.png',
    96: 'icons/icon96.png',
    128: 'icons/icon128.png',
    256: 'icons/icon384.png',
    512: 'icons/icon512.png'
  },
  // 扩展设置页面
  options_ui: {
    page: 'src/entries/options/index.html', // 入口文件
    open_in_tab: true // 是否在新标签页打开
  },
  // 权限列表
  permissions: ['storage', 'tabs', 'contextMenus', 'notifications'],
  // 声明哪些扩展、app、网页可以连接此扩展通信
  externally_connectable: {
    matches: ['*://*/*']
  }
}

// 扩展左上角气泡 ui
const browserAction: chrome.runtime.ManifestAction = {
  default_icon: {
    16: sharedManifest.icons[16],
    19: sharedManifest.icons[19],
    32: sharedManifest.icons[32],
    38: sharedManifest.icons[38]
  },
  default_popup: 'src/entries/popup/index.html' // 入口文件
}

// 第二版扩展配置
const ManifestV2 = {
  ...sharedManifest,
  // 后台线程
  background: {
    scripts: ['src/entries/background/index.ts'], // 脚本文件
    persistent: false
  },
  browser_action: browserAction,
  options_ui: {
    ...sharedManifest.options_ui,
    chrome_style: false // 不添加默认样式
  },
  permissions: [...sharedManifest.permissions, '*://*/*']
} as chrome.runtime.ManifestV2

// 第三版扩展配置
const ManifestV3 = {
  ...sharedManifest,
  action: browserAction,
  background: {
    service_worker: 'src/entries/background/serviceWorker.ts'
  },
  host_permissions: ['*://*/*']
} as chrome.runtime.ManifestV3

export function getManifest(manifestVersion: number): chrome.runtime.ManifestV2 | chrome.runtime.ManifestV3 {
  const manifest = {
    author: pkg.author, // 作者
    description: pkg.description, // 描述
    name: pkg.displayName ?? pkg.name, // 扩展名
    version: pkg.version // 版本
  }

  if (manifestVersion === 2) {
    return {
      ...manifest,
      ...ManifestV2,
      manifest_version: manifestVersion
    }
  }

  if (manifestVersion === 3) {
    return {
      ...manifest,
      ...ManifestV3,
      manifest_version: manifestVersion
    }
  }

  throw new Error(`Missing manifest definition for manifestVersion ${manifestVersion}`)
}
