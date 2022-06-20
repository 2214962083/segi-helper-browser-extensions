/* eslint-disable @typescript-eslint/no-explicit-any */
import {hasOwnKey, useStorage} from './common'

type HttpResultFormatType = 'json' | 'text'

interface HttpOptions extends RequestInit {
  /**
   * 结果格式化，默认json
   */
  formatType?: HttpResultFormatType

  /**
   * 缓存时间，undefined 为无限长
   */
  cacheTime?: number | undefined

  /**
   * 是否成功后缓存结果到 session storage，默认为 false
   */
  cacheSessionStorage?: boolean

  /**
   * 是否成功后缓存结果到 local storage，默认为 false
   */
  cacheLocalStorage?: boolean
}

export async function http<ResultType = any>(input: RequestInfo | URL, options?: HttpOptions): Promise<ResultType> {
  const {
    formatType = 'json',
    cacheTime,
    cacheLocalStorage = false,
    cacheSessionStorage = false,
    ...fetchOptions
  } = options || {}

  const cacheType = cacheSessionStorage ? 'session' : cacheLocalStorage ? 'local' : null

  // 错误信息，如果存在错误信息，则抛出
  let errorMsg: null | string = null

  // 缓存
  const [getResult, saveResult] = useStorage(input, cacheType)

  // 读取缓存结果
  const cacheResult = getResult<ResultType>()

  // 如果存在缓存，直接返回缓存
  if (cacheResult) return cacheResult

  // 发送请求
  const result = await fetch(input, fetchOptions).catch(err => {
    // 捕获错误
    if (hasOwnKey(Object(err), 'message')) {
      errorMsg = err.message
    } else if (hasOwnKey(Object(err), 'msg')) {
      errorMsg = err.msg
    } else {
      errorMsg = String(err)
    }
  })

  // 存在错误信息，抛出错误
  if (errorMsg) throw new Error(errorMsg)

  // 解析结果
  const formatResult: ResultType = formatType === 'json' ? await result?.json() : await result?.text()

  if (typeof formatResult === 'object' && hasOwnKey(formatResult as Record<string, any>, 'code')) {
    const {code, message, msg} = formatResult as unknown as {code: string | number; message?: string; msg?: string}
    if (String(code) !== '0') {
      if (message) {
        errorMsg = message
      } else if (msg) {
        errorMsg = msg
      } else {
        errorMsg = `请求错误，错误码 ${code}`
      }
    }
  }

  // 存在错误信息，抛出错误
  if (errorMsg) throw new Error(errorMsg)

  // 写入缓存
  saveResult(formatResult, cacheTime)

  return formatResult
}
