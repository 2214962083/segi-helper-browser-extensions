import pkg from '../package.json'

interface SharedManifest {
  homepage_url?: string // 插件主页
  content_scripts: chrome.runtime.ManifestBase['content_scripts']
  icons: chrome.runtime.ManifestIcons
  options_ui: chrome.runtime.ManifestBase['options_ui']
  permissions: chrome.runtime.ManifestPermissions[]
  externally_connectable: chrome.runtime.ManifestBase['externally_connectable']
  web_accessible_resources?: chrome.runtime.ManifestV3['web_accessible_resources'] // 可访问资源
}

const allowUrls = ['*://*/*']

// 共用配置
const sharedManifest: SharedManifest = {
  content_scripts: [
    {
      js: ['src/entries/content-script/index.ts'], // 向 window 注入 js 文件
      matches: [...allowUrls], // 匹配的网址
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
  permissions: ['storage', 'tabs', 'contextMenus', 'notifications', 'activeTab'],
  // 声明哪些扩展、app、网页可以连接此扩展通信
  externally_connectable: {
    ids: ['*'],
    matches: [
      // chrome 任性，一定要指定明确的顶级域名
      '*://*.uhomecp.com/*',
      ...allowUrls
    ],
    accepts_tls_channel_id: false
  },
  web_accessible_resources: [
    {
      resources: ['inject-script.js', 'assets/*'],
      matches: [...allowUrls]
    }
  ]
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
  permissions: [...sharedManifest.permissions, ...allowUrls],
  web_accessible_resources: sharedManifest.web_accessible_resources?.map(item => item.resources).flat()
} as chrome.runtime.ManifestV2

// 第三版扩展配置
const ManifestV3 = {
  ...sharedManifest,
  action: browserAction,
  background: {
    service_worker: 'src/entries/background/serviceWorker.ts'
  },
  host_permissions: [...allowUrls],
  content_security_policy: {
    extension_pages:
      "script-src 'self' 'wasm-unsafe-eval'; default-src 'self'; img-src 'self' data:; connect-src https://* wss://* ; style-src 'self' 'unsafe-inline';"
  }
} as chrome.runtime.ManifestV3

export function getManifest(manifestVersion: number): chrome.runtime.ManifestV2 | chrome.runtime.ManifestV3 {
  const manifest = {
    author: pkg.author, // 作者
    description: pkg.description, // 描述
    name: pkg.displayName ?? pkg.name, // 扩展名
    version: pkg.version // 版本
  } as chrome.runtime.ManifestV2

  if (manifestVersion === 2) {
    // 兼容性好，不过 2023 的 chrome 就不支持了
    // https://developer.chrome.com/blog/mv2-transition/
    return {
      ...manifest,
      ...ManifestV2,
      manifest_version: manifestVersion
    }
  }

  if (manifestVersion === 3) {
    // 兼容性不好，暂时用 v2
    return {
      ...manifest,
      ...ManifestV3,
      manifest_version: manifestVersion
    } as chrome.runtime.ManifestV3
  }

  throw new Error(`Missing manifest definition for manifestVersion ${manifestVersion}`)
}
