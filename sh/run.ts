import cp from 'node:child_process'

export const run = (command: string, path?: string) => {
  const [cmd, ...args] = command.split(' ')

  return new Promise((resolve, reject) => {
    const app = cp.spawn(cmd, args, {
      cwd: path || process.cwd(), // 兜底当前路径
      stdio: 'inherit',
      shell: true // Windows 下必须，Mac 下可选但建议开启以支持通配符
    })

    app.on('error', (err: any) => {
      reject(err)
    })

    app.on('close', (code: unknown) => {
      if (code === 0) {
        resolve(code)
      } else {
        // ✅ 建议处理：非 0 退出码通常代表执行出错
        reject(new Error(`Command failed with code ${code}`))
      }
    })
  })
}