import {allowWindowMessaging} from 'webext-bridge' // 重要，这个是通讯中转的桥梁，不能删除\

allowWindowMessaging('UhomecpContentScript') // 允许 window 通信
console.log('background main.ts')
