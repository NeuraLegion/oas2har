const fs = require('fs')
const { promisify } = require('util')
const { extname } = require('path')
const { ok } = require('assert')

const readFile = promisify(fs.readFile)

/**
 * @internal
 * @param path - path to oas specification
 * @returns {Promise<string>}
 */
const read = async (path) => {
  try {
    return await readFile(path, 'utf8')
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error('File not found!')
    }

    throw new Error('Cannot read file.');
  }
}

/**
 *
 * @param path - path to oas specification
 * @returns {Promise<any>}
 */
const load = async (path) => {
  ok(path, 'Path is not provided.')

  const ext = extname(path.toLowerCase())
  const content = await read(path)

  if (ext === '.yml' || ext === '.yaml') {
    return require('js-yaml').safeLoad(content)
  }

  return JSON.parse(content)
}

module.exports = load
