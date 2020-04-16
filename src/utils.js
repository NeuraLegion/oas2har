/**
 * Returns the value referenced in the given reference string
 *
 * @param  {Object} spec
 * @param  {string} ref A reference string
 * @return {Object}
 */
const resolveRef = (spec, ref) => {
  const parts = ref.split('/')

  if (parts.length <= 1) return {}

  const recursive = (obj, idx) => {
    if (idx + 1 < parts.length) {
      const newCount = idx + 1

      return recursive(obj[parts[idx]], newCount)
    }

    return obj[parts[idx]]
  }

  return recursive(spec, 1)
}

exports.resolveRef = resolveRef

/**
 * Removes trailing slash from provided URL
 * @param x - url
 * @returns {string}
 */
const removeTrailingSlash = (x) => x.replace(/\/$/, '')

exports.removeTrailingSlash = removeTrailingSlash

/**
 * Removes leading slash from provided URL
 * @param x - url
 * @returns {string}
 */
const removeLeadingSlash = (x) => x.replace(/^\//, '')

exports.removeLeadingSlash = removeLeadingSlash

/**
 * @internal
 * @param val
 * @returns {boolean|boolean}
 */
const isObject = (val) => typeof val === 'object' && !Array.isArray(val)

exports.isObject = isObject

/**
 *
 * @param options
 * @returns {{ALLOWED_FORMATS: Set<string>, format(*=, *): (*|string), _options: {format: string}, verify(): void, normalizeOptions(*=): {format: string}}}
 */
const flattenConfig = (options) => ({
  _options: Object.assign({ format: 'dots' }, options),
  ALLOWED_FORMATS: new Set(['indices', 'dots']),
  verify() {
    if (!this.ALLOWED_FORMATS.has(this._options.format)) {
      throw new TypeError('Invalid format')
    }
  },
  format(a, b) {
    if (!a) {
      return b
    }

    switch (this._options.format) {
      case 'indices':
        return `${a}[${b}]`
      case 'dots':
        return `${a}.${b}`
    }
  },
})

/**
 *
 * @param obj An object that's needed to be converted to entries
 * @param options An additional options
 * @param {'indices' | 'dots'} options.format An optional format can also be passed: "indices" or "dots"
 * @returns {string[]}
 */
const toFlattenArray = (obj, options) => {
  const config = flattenConfig(options)

  config.verify()

  const paths = (obj = {}, head = '') => {
    return Object.entries(obj).reduce((product, [key, value]) => {
      const fullPath = config.format(head, key)
      return isObject(value)
        ? product.concat(paths(value, fullPath))
        : product.concat(fullPath, value.toString())
    }, [])
  }

  return paths(obj)
}

exports.toFlattenArray = toFlattenArray

/**
 *
 * @param ob An object that's needed to be converted to entries
 * @param options An additional options
 * @param {'indices' | 'dots'} options.format An optional format can also be passed: "indices" or "dots"
 * @returns {Object}
 */
const toFlattenObject = (ob, options) => {
  const config = flattenConfig(options)

  config.verify()

  const toReturn = {}

  for (const i in ob) {
    if (!ob.hasOwnProperty(i)) {
      continue
    }

    if (typeof ob[i] == 'object' && ob[i] !== null) {
      const flatObject = toFlattenObject(ob[i])

      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue
        const fullPath = config.format(i, x)
        toReturn[fullPath] = flatObject[x]
      }
    } else {
      toReturn[i] = ob[i]
    }
  }
  return toReturn
}
exports.toFlattenObject = toFlattenObject
