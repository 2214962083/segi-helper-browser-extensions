/* eslint-disable @typescript-eslint/no-explicit-any */
import {onMessage} from 'webext-bridge'

/**
 * message 装饰器，监听 message 然后执行修饰的函数
 * @param id message id
 */
export function OnMessage(id: string): MethodDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const method = target[propertyKey]

    if (method === undefined) {
      return
    }

    if (typeof method === 'function') {
      console.log(`[OnMessage] ${id}`)
      onMessage(id, ({data}) => {
        console.log(`[OnMessage] ${id}`, data, method)
        return method(...data)
      })
    }
  }
}
