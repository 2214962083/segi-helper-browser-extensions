/* eslint-disable @typescript-eslint/no-explicit-any */
import type {WebextMessage} from '@/common/utils/message-types'

declare module 'webext-bridge' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ProtocolMap extends WebextMessage {}
}
