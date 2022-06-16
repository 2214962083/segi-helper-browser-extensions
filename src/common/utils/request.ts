/* eslint-disable @typescript-eslint/no-explicit-any */
import {useStorage} from './common'

type HttpResultFormatType = 'json' | 'text'

interface HttpOptions extends RequestInit {
  /**
   * 结果格式化，默认json
   */
  formatType?: HttpResultFormatType

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
  const {formatType = 'json', cacheLocalStorage = false, cacheSessionStorage = false, ...fetchOptions} = options || {}

  const cacheType = cacheSessionStorage ? 'session' : cacheLocalStorage ? 'local' : null

  // 缓存
  const [getResult, saveResult] = useStorage(input, cacheType)

  // 读取缓存结果
  const cacheResult = getResult<ResultType>()

  // 如果存在缓存，直接返回缓存
  if (cacheResult) return cacheResult

  // 发送请求
  const result = await fetch(input, fetchOptions)

  // 解析结果
  const formatResult: ResultType = formatType === 'json' ? await result.json() : await result.text()

  // 写入缓存
  saveResult(formatResult)

  return formatResult
}
