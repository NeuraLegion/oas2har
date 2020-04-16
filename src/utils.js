/**
 * Returns the value referenced in the given reference string
 *
 * @param  {object} spec
 * @param  {string} ref A reference string
 * @return {any}
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


const removeTrailingSlash = (x) => x.replace(/\/$/, '');

exports.removeTrailingSlash = removeTrailingSlash

const removeLeadingSlash = (x) => x.replace(/^\//, '');

exports.removeLeadingSlash = removeLeadingSlash
