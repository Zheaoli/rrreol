import { EventEmitter } from 'events'
import chalk from 'chalk'
import fs from 'fs-extra'
import { isString } from 'lodash'
import { isNil, join } from 'ramda'
import { CLRFtoLF } from './utils'

export class FileManager extends EventEmitter {
  constructor (path) {
    super()
    this.__content = null
    this.filePath = path || null

    this.on('loaded', (val) => {
      if (isNil(val)) throw new TypeError()
      if (Array.isArray(val)) {
        this.__content = val
      } else if (val instanceof Buffer) {
        this.__content = val.toString().split('\n')
      }
    })

    if (!isNil(path) && fs.existsSync(path)) {
      this.emit('loaded', fs.readFileSync(path))
    }
  }

  static of = (val) => {
    const copy = new FileManager()
    if (isNil(val)) return copy
    if (val instanceof FileManager) {
      copy.__content = val.__content
      copy.filePath = val.filePath
    }
    return copy
  }

  static save = async (path, content) => {
    await fs.writeFile(path, content)
  }

  get content () {
    return join('\n')(this.__content || [])
  }

  loadContent = (content) => {
    // todo: add other method to loadContent content
    if (isString(content)) {
      this.__content = content.split('\n')
    }
    return this
  }

  save = async (path) => {
    if (!isNil(path)) {
      await FileManager.save(path, this.content)
    } else {
      await fs.writeFile(this.filePath, this.content)
    }
    return this
  }

  readPath = async (path) => {
    await fs.readFile(path).then(res => this.emit('loaded', res))
    return this
  }

  line = (line) => {
    if (line < 0 || line > (this.__content?.length || Number.MIN_VALUE)) {
      console.log(chalk.red('error'))
      throw TypeError(`target line ${line} is empty`)
    } else {
      return CLRFtoLF(this.__content[line - 1])
    }
  }

  lines = () => this.__content?.length || 0
}

export default FileManager
