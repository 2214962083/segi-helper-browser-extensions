/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RunInPageContextOptions<Args extends any[], Result = any> {
  /**
   * 函数主体，这个会自动转换成字符串注入到页面上，
   * 不要引用本地的函数与变量，想用本地变量可以通过 args 传进去
   */
  func: ((...args: Args) => Result) | string

  /**
   * 函数参数，多参数格式为数组
   * 会执行 JSON.stringify 操作，参数尽可能是简单的
   */
  args?: Args

  /**
   * 超时限制，默认为空，空则无限制
   */
  timeout?: number

  /**
   * Document 对象，用于插入 script 标签，默认为 document
   */
  doc?: Document
}

/**
 * 在页面上下文执行函数，并返回 promise 结果
 */
export async function runInPageContext<Args extends any[], Result = any>(
  options: RunInPageContextOptions<Args, Result>
): Promise<Result | undefined> {
  const {func, args, timeout, doc = document} = options

  // 测试我们是否使用 allow-scripts 权限运行
  try {
    window.sessionStorage
  } catch (ignore) {
    return undefined
  }

  // 随机唯一 message id
  const resultMessageId = parseInt('' + Math.floor(Math.random() * 100 + 1) + new Date().getTime())

  // 在页面上下文执行的代码
  const code = `
      (
          async function () {
                  const response = {
                      id: ${resultMessageId}
                  };
                  try {
                      response.result = JSON.stringify(await (${func})(...${JSON.stringify(args || [])})); // 运行脚本
                  } catch(err) {
                      response.error = JSON.stringify(err);
                  }

                  window.postMessage(response, '*'); // 广播执行结果
          }
      )();
  `

  // 创建脚本 element
  const scriptElm = doc.createElement('script')
  scriptElm.setAttribute('type', 'application/javascript')
  scriptElm.textContent = code
  doc.documentElement.appendChild(scriptElm)
  // 进入执行流程了，清理脚本 element
  scriptElm.remove()

  // 创建一个扁平的 promise
  let resolve: Function, reject: Function
  const promise = new Promise<Result | undefined>((res, rej) => {
    resolve = res
    reject = rej
  })

  // 超时拒绝
  if (timeout !== undefined && timeout !== null) {
    const timerId = setTimeout(() => {
      onResult({
        data: {
          id: resultMessageId,
          error: '脚本执行超时'
        }
      })
    }, timeout)

    // 清除计时器
    promise.finally(() => (timerId !== null ? clearTimeout(timerId) : null))
  }

  // 回调结果
  function onResult(event: {
    data: {
      id: number
      result?: Result
      error?: any
    }
  }) {
    const data = Object(event.data)
    if (data.id === resultMessageId) {
      // 来自我们的脚本广播的结果
      window.removeEventListener('message', onResult)
      if (data.error !== undefined) {
        // 如果存在错误，则拒绝
        return reject(JSON.parse(data.error))
      }
      // 否则，返回结果
      return resolve(data.result !== undefined ? JSON.parse(data.result) : undefined)
    }
  }

  window.addEventListener('message', onResult)

  return promise
}
