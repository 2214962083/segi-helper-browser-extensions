/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Server, AddressInfo} from 'net'
import os from 'os'
import {CommonServerOptions, ResolvedConfig} from 'vite'

export const wildcardHosts = new Set(['0.0.0.0', '::', '0000:0000:0000:0000:0000:0000:0000:0000'])

export const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1', '0000:0000:0000:0000:0000:0000:0000:0001'])

export interface Hostname {
  // undefined sets the default behaviour of server.listen
  host: string | undefined
  // resolve to localhost when possible
  name: string
}

export function resolveHostname(optionsHost: string | boolean | undefined): Hostname {
  let host: string | undefined
  if (optionsHost === undefined || optionsHost === false) {
    // Use a secure default
    host = 'localhost'
  } else if (optionsHost === true) {
    // If passed --host in the CLI without arguments
    host = undefined // undefined typically means 0.0.0.0 or :: (listen on all IPs)
  } else {
    host = optionsHost
  }

  // Set host name to localhost when possible
  const name = host === undefined || wildcardHosts.has(host) ? 'localhost' : host

  return {host, name}
}

export function getCommonServerUrls(server: Server, options: CommonServerOptions, config: ResolvedConfig) {
  const address = server.address()
  const isAddressInfo = (x: any): x is AddressInfo => x?.address
  if (!isAddressInfo(address)) return []

  const hostname = resolveHostname(options.host)
  const protocol = options.https ? 'https' : 'http'
  const urls: Array<{label: string; url: string}> = []

  const port = address.port
  const base = config.base

  if (hostname.host && loopbackHosts.has(hostname.host)) {
    let hostnameName = hostname.name

    if (hostnameName === '::1' || hostnameName === '0000:0000:0000:0000:0000:0000:0000:0001') {
      hostnameName = `[${hostnameName}]`
    }

    urls.push({
      label: 'Local',
      url: `${protocol}://${hostnameName}:${port}${base}`
    })
  } else {
    Object.values(os.networkInterfaces())
      .flatMap(nInterface => nInterface ?? [])
      .filter(
        detail =>
          detail &&
          detail.address &&
          // Node < v18
          ((typeof detail.family === 'string' && detail.family === 'IPv4') ||
            // Node >= v18
            (typeof detail.family === 'number' && detail.family === 4))
      )
      .forEach(detail => {
        const host = detail.address.replace('127.0.0.1', hostname.name)
        const url = `${protocol}://${host}:${port}${base}`
        const label = detail.address.includes('127.0.0.1') ? 'Local' : 'Network'
        urls.push({label, url})
      })
  }

  return urls.map(item => {
    return {
      popup: `${item.url}src/entries/popup/`,
      background: `${item.url}src/entries/background/`,
      options: `${item.url}src/entries/options/`
    }
  })
}
