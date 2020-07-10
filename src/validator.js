const { ok } = require('assert')
const Ajv = require('ajv')
const { openapi } = require('openapi-schemas')
const semver = require('semver')

const MIN_ALLOWED_VERSION = '2.0.0'

const VERSION_SCHEMA_MAP = {
  2: openapi.v2.id,
  3: openapi.v3.id,
}

const createAjv = () => {
  const ajv = new Ajv({
    allErrors: true,
    $data: true,
    jsonPointers: true,
    extendRefs: true,
    async: true,
    schemaId: 'auto',
  })

  const ajvFormats = require('ajv/lib/compile/formats.js')
  ajv.addFormat('uriref', ajvFormats.full['uri-reference'])
  ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
  ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema' // optional, using unversioned URI is out of spec
  ;[openapi.v2, openapi.v3].forEach((schema) => ajv.addSchema(schema))
  return ajv
}

const ajv = createAjv()

const validate = async (spec) => {
  ok(spec, 'The specification is not provided.')
  validateVersion(spec)
  await validateSpec(spec)
}

exports.validate = validate

const getVersion = (spec) => {
  let version = (spec.openapi || spec.swagger || '').trim()

  ok(version, 'Cannot determine version of specification.')

  if (!semver.valid(version) && MIN_ALLOWED_VERSION.startsWith(version)) {
    version = MIN_ALLOWED_VERSION
  }
  return version
}

const validateVersion = (spec) => {
  const version = getVersion(spec)

  if (!semver.gte(version, MIN_ALLOWED_VERSION)) {
    throw new Error(
      'Swagger v1 are not supported. If you are using an older format, convert it to v2 and try again.'
    )
  }
}

const validateSpec = async (spec) => {
  const version = getVersion(spec)

  const schemaNotFound = 'Cannot determine version of schema. Schema ID is missed.'
  const major = semver.major(version)
  const schemaId = VERSION_SCHEMA_MAP[major]

  ok(schemaId, schemaNotFound)

  const validate = ajv.getSchema(schemaId)
  ok(validate, schemaNotFound)

  if (!(await validate(spec))) {
    throw new Error(`The specification file is corrupted. ${ajv.errorsText(validate.errors)}`)
  }
}
