import type {Component} from 'vue'
import {fileIcons} from './file-icons'
import {FileIcons} from './file-icons-types'
import {FolderTheme} from './folder-icon-types'
import {folderIcons} from './folder-icons'

const icons = import.meta.globEager('../assets/icons/*.svg')

/**
 * 根据图标名称生成 vue 组件
 * @param iconName 图标名称
 * @returns vue 组件
 */
export const getIconComponentByIconName = (iconName: string): Component | undefined =>
  icons[`../assets/icons/${iconName}.svg`]?.default ?? undefined

/**
 * 根据文件路径获取文件扩展名称
 * 输入 /src/aaa/bbb/cc.route.js 输出 route.js
 * @param filePath 文件路径
 */
export const getFileExtNameFromFilePath = (filePath: string): string => {
  return filePath?.split('/')?.pop()?.split('.')?.slice(1)?.join('.') ?? ''
}

/**
 * 获取文件名称和图标名称的映射表
 * 获取文件扩展名和图标名称的映射表
 */
export const getFileIconMap = (fileIcons: FileIcons) => {
  const fileNameIconMap = new Map<string, string>()
  const fileExtIconMap = new Map<string, string>()
  for (const iconConfig of fileIcons.icons!) {
    const {fileNames = [], fileExtensions = []} = iconConfig
    for (const folderName of fileNames) {
      fileNameIconMap.set(folderName, iconConfig.name)
    }

    for (const fileExt of fileExtensions) {
      fileExtIconMap.set(fileExt, iconConfig.name)
    }
  }
  return {fileNameIconMap, fileExtIconMap}
}

/**
 * 根据文件夹名称获取图标名称
 */
const {fileNameIconMap, fileExtIconMap} = getFileIconMap(fileIcons)
export const getFileIconByFileName = (filename: string): string => {
  const ext = getFileExtNameFromFilePath(filename)
  const fileIcon = fileNameIconMap.get(filename)
  const extIcon = fileExtIconMap.get(ext)
  return fileIcon || extIcon || fileIcons.defaultIcon.name
}

/**
 * 获取文件夹名称和图标名称的映射表
 */
export const getFolderNameIconMap = (folderIcons: FolderTheme) => {
  const map = new Map<string, string>()
  for (const iconConfig of folderIcons.icons!) {
    for (const folderName of iconConfig.folderNames) {
      map.set(folderName, iconConfig.name)
    }
  }
  return map
}

/**
 * 根据文件夹名称获取图标名称
 */
const folderNameIconMap = getFolderNameIconMap(folderIcons)
export const getFolderIconByFolderName = (folderName: string) => {
  return folderNameIconMap.get(folderName) || folderIcons.defaultIcon.name
}
