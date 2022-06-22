import {BUNDLED_LANGUAGES, Lang} from 'shiki'

/**
 * 获取 shiki 语言和其依赖语言列表的映射表
 */
export function getLangEmbeddedLangsMap() {
  const langEmbeddedLangsMap = new Map<Lang, Lang[] | undefined>()
  BUNDLED_LANGUAGES.map(lang => langEmbeddedLangsMap.set(lang.id as Lang, lang.embeddedLangs))
  return langEmbeddedLangsMap
}

/**
 * shiki 语言和其依赖语言列表的映射表
 */
export const langEmbeddedLangsMap = getLangEmbeddedLangsMap()

/**
 * 获取所有 shiki 支持的语言
 */
export function getAllSupportsLangs(): Lang[] {
  return BUNDLED_LANGUAGES.reduce((result, lang) => {
    result.push(lang.id as Lang)
    if (lang.aliases) {
      result.push(...(lang.aliases as Lang[]))
    }
    return result
  }, [] as Lang[])
}

/**
 * 所有 shiki 支持的语言
 */
export const allSupportsLangs = getAllSupportsLangs()

/**
 * 获取 shiki 语言简称获对应的 shiki 语言完整名称表
 */
export function getLangNameMap() {
  const langNameMap = new Map<Lang, Lang>()
  BUNDLED_LANGUAGES.map(lang => {
    const currentLangFullName = lang.id as Lang
    langNameMap.set(currentLangFullName, currentLangFullName)
    if (lang.aliases) {
      lang.aliases.map(alias => langNameMap.set(alias as Lang, currentLangFullName))
    }
  })
  return langNameMap
}

/**
 * shiki 语言简称获对应的 shiki 语言完整名称表
 */
export const langNameMap = getLangNameMap()

/**
 * 根据某个语言获取其所要加载的依赖语言列表（包括它自己）
 * @param lang 语言
 * @param _set 内部遍历存储集合，不用传
 * @returns 所需加载的语言
 */
export function findLangsShouldLoad(lang: Lang, _set?: Set<Lang>): Lang[] {
  if (!lang) return []

  const currentLangFullName = langNameMap.get(lang)
  if (!currentLangFullName) return []

  _set = _set || new Set<Lang>([currentLangFullName])
  const embeddedLangs = langEmbeddedLangsMap.get(currentLangFullName) ?? []
  _set = new Set([..._set, ...embeddedLangs])
  embeddedLangs.map(embeddedLang => {
    if (!_set!.has(embeddedLang)) _set = new Set([..._set!, ...findLangsShouldLoad(embeddedLang, _set)])
  })
  return [..._set]
}
