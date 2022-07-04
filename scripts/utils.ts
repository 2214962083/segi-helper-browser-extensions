import {execSync} from 'child_process'
import path from 'path'
import pkg from '../package.json'

const pathResolve = (..._path: string[]) => path.resolve(__dirname, ..._path)

export function generateChangelog() {
  const pkgName = pkg.name
  const cmd = `pnpm exec conventional-changelog -p angular -i CHANGELOG.md -s -r 0`
  console.log('start run command: ', cmd)
  execSync(cmd, {stdio: 'inherit', cwd: pathResolve('../')})
}

export function release() {
  generateChangelog()
  execSync('git add .', {stdio: 'inherit'})
  execSync('pnpm exec bumpp package.json --push --tag --all --commit "build: the v%s release"', {
    stdio: 'inherit'
  })
}
