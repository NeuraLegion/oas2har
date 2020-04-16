/**
 * Translates given Swagger 2.0 file to an array of HTTP Archive (HAR) 1.2 Request Object.
 * See more:
 *  - http://swagger.io/specification/
 *  - http://www.softwareishard.com/blog/har-12-spec/#request
 *
 * Example HAR Request Object:
 * "request": {
 *   "method": "GET",
 *   "url": "http://www.example.com/path/?param=value",
 *   "httpVersion": "HTTP/1.1",
 *   "cookies": [],
 *   "headers": [],
 *   "queryString" : [],
 *   "postData" : {},
 *   "headersSize" : 150,
 *   "bodySize" : 0,
 *   "comment" : ""
 * }
 *
 * Source code initially pulled from: https://github.com/ErikWittern/swagger-snippet/blob/master/swagger-to-har.js
 */

const { sample } = require('@neuralegion/openapi-sampler')
const load = require('./loader')
const template = require('url-template')
const { toXML } = require('jstoxml')
const querystring = require('querystring')

/**
 * Create HAR Request object for path and method pair described in given swagger.
 *
 * @param  {Object} swagger           Swagger document
 * @param  {string} path              Key clear
 * of the path
 * @param  {string} method            Key of the method
 * @param  {Object} queryParamValues  Optional: Values for the query parameters if present
 * @return {Object}                   HAR Request object
 */
const createHar = function (swagger, path, method, queryParamValues) {
  // if the operational parameter is not provided, set it to empty object
  if (typeof queryParamValues === 'undefined') {
    queryParamValues = {}
  }

  const baseUrl = getBaseUrl(swagger)

  const har = {
    method: method.toUpperCase(),
    url: baseUrl + serializePath(swagger, path, method),
    headers: getHeadersArray(swagger, path, method),
    queryString: getQueryStrings(swagger, path, method, queryParamValues),
    httpVersion: 'HTTP/1.1',
    cookies: [],
    headersSize: 0,
    bodySize: 0,
  }

  // get payload data, if available:
  const postData = getPayload(swagger, path, method)

  if (postData) har.postData = postData

  return har
}

/**
 * Get the payload definition for the given endpoint (path + method) from the
 * given OAI specification. References within the payload definition are
 * resolved.
 *
 * @param  {object} swagger
 * @param  {string} path
 * @param  {string} method
 * @return {object}
 */
const getPayload = function (swagger, path, method) {
  const pathObj = swagger.paths[path][method]

  if (typeof pathObj.parameters !== 'undefined') {
    for (let i in pathObj.parameters) {
      const param = pathObj.parameters[i]
      if (
        typeof param.in !== 'undefined' &&
        param.in.toLowerCase() === 'body' &&
        typeof param.schema !== 'undefined'
      ) {
        try {
          const data = sample(param.schema, { skipReadOnly: true }, swagger)

          let consumes

          if (pathObj.consumes && pathObj.consumes.length) {
            consumes = pathObj.consumes
          } else if (swagger.consumes && swagger.consumes.length) {
            consumes = swagger.consumes
          }

          const paramContentType = sample({
            type: 'array',
            examples: consumes ? consumes : ['application/json'],
          })

          return encodePayload(data, paramContentType)
        } catch (err) {
          return null
        }
      }
    }
  }

  let content = swagger.paths[path][method].requestBody
    ? swagger.paths[path][method].requestBody.content
    : null

  const keys = Object.keys(content || {})
  if (!keys.length) {
    return null
  }

  const contentType = sample({
    type: 'array',
    examples: keys,
  })

  if (content[contentType] && content[contentType].schema) {
    const sampleContent = content[contentType]
    const data = sample(content[contentType].schema, { skipReadOnly: true }, swagger)
    return encodePayload(data, contentType, sampleContent.encoding)
  }
  return null
}

/**
 * Gets the base URL constructed from the given swagger.
 *
 * @param  {Object} swagger Swagger document
 * @return {string}         Base URL
 */
const getBaseUrl = function (swagger) {
  if (swagger.servers) return swagger.servers[0].url

  let baseUrl = ''

  baseUrl += typeof swagger.schemes !== 'undefined' ? swagger.schemes[0] : 'http'

  baseUrl += '://' + swagger.host

  if (typeof swagger.basePath !== 'undefined' && swagger.basePath !== '/') {
    baseUrl += swagger.basePath
  }

  return baseUrl
}

/**
 * Get array of objects describing the query parameters for a path and method pair
 * described in the given swagger.
 *
 * @param  {Object} swagger Swagger document
 * @param  {string} path    Key of the path
 * @param  {string} method  Key of the method
 * @param  {Object} values  Optional: query parameter values to use in the snippet if present
 * @return {array}          List of objects describing the query strings
 */
const getQueryStrings = function (swagger, path, method, values) {
  // Set the optional parameter if it's not provided
  if (typeof values === 'undefined') {
    values = {}
  }

  const queryStrings = []

  if (typeof swagger.paths[path][method].parameters !== 'undefined') {
    for (let i in swagger.paths[path][method].parameters) {
      let param = swagger.paths[path][method].parameters[i]
      if (typeof param['$ref'] === 'string' && !/^http/.test(param['$ref'])) {
        param = resolveRef(swagger, param['$ref'])
      }
      if (typeof param.in !== 'undefined' && param.in.toLowerCase() === 'query') {
        const data = sample(param.schema || param, {}, swagger)
        queryStrings.push({
          name: param.name,
          value:
            typeof values[param.name] === 'undefined'
              ? typeof param.default === 'undefined'
                ? encodeURIComponent(typeof data === 'object' ? JSON.stringify(data) : data)
                : param.default + ''
              : values[param.name] + '' /* adding a empty string to convert to string */,
        })
      }
    }
  }

  return queryStrings
}

/**
 * Get an array of objects describing the header for a path and method pair
 * described in the given swagger.
 *
 * @param  {Object} swagger Swagger document
 * @param  {string} path    Key of the path
 * @param  {string} method  Key of the method
 * @return {array}          List of objects describing the header
 */
const getHeadersArray = function (swagger, path, method) {
  const headers = []

  const pathObj = swagger.paths[path][method]

  // 'accept' header:
  if (typeof pathObj.consumes !== 'undefined') {
    for (const i in pathObj.consumes) {
      const type = pathObj.consumes[i]
      headers.push({
        name: 'accept',
        value: type,
      })
    }
  }

  // 'content-type' header:
  if (typeof pathObj.produces !== 'undefined') {
    for (const j in pathObj.produces) {
      const type2 = pathObj.produces[j]
      headers.push({
        name: 'content-type',
        value: type2,
      })
    }
  }

  // v3 'content-type' header:
  if (pathObj.requestBody && pathObj.requestBody.content) {
    for (const type3 of Object.keys(pathObj.requestBody.content)) {
      headers.push({
        name: 'content-type',
        value: type3,
      })
    }
  }

  // headers defined in path object:
  if (typeof pathObj.parameters !== 'undefined') {
    for (const k in pathObj.parameters) {
      const param = pathObj.parameters[k]
      if (typeof param.in !== 'undefined' && param.in.toLowerCase() === 'header') {
        const data = sample(param.schema || param, {}, swagger)
        headers.push({
          name: param.name,
          value: typeof data === 'object' ? JSON.stringify(data) : data,
        })
      }
    }
  }

  // security:
  let securityObj

  if (typeof pathObj.security !== 'undefined') {
    securityObj = pathObj.security
  } else if (typeof swagger.security !== 'undefined') {
    securityObj = swagger.security
  }

  if (!securityObj) {
    return headers
  }

  let definedSchemes
  if (swagger.securityDefinitions) {
    definedSchemes = swagger.securityDefinitions
  } else if (swagger.components) {
    definedSchemes = swagger.components.securitySchemes
  }

  if (!definedSchemes) {
    return headers
  }

  let basicAuthDef
  let apiKeyAuthDef
  let oauthDef

  for (const m in securityObj) {
    const secScheme = Object.keys(securityObj[m])[0]
    const secDefinition = definedSchemes[secScheme]
    const authType = secDefinition.type.toLowerCase()
    switch (authType) {
      case 'http':
        const authScheme = secDefinition.scheme.toLowerCase()
        switch (authScheme) {
          case 'bearer':
            oauthDef = secScheme
            break
          case 'basic':
            basicAuthDef = secScheme
            break
        }
        break
      case 'basic':
        basicAuthDef = secScheme
        break
      case 'apikey':
        if (secDefinition.in === 'header') {
          apiKeyAuthDef = secDefinition
        }
        break
      case 'oauth2':
        oauthDef = secScheme
        break
    }
  }

  if (basicAuthDef) {
    headers.push({
      name: 'Authorization',
      value: 'Basic ' + 'REPLACE_BASIC_AUTH',
    })
  } else if (apiKeyAuthDef) {
    headers.push({
      name: apiKeyAuthDef.name,
      value: 'REPLACE_KEY_VALUE',
    })
  } else if (oauthDef) {
    headers.push({
      name: 'Authorization',
      value: 'Bearer ' + 'REPLACE_BEARER_TOKEN',
    })
  }

  return headers
}

/**
 * Produces array of HAR files for given Swagger document or path to the document
 *
 * @param  {object}   swagger          A swagger document or path to doc
 * @returns  {Promise}                 Array of HAR files
 */
const oasToHarList = function (swagger) {
  const docAsyncTask = typeof swagger === 'string' ? load(swagger) : Promise.resolve(swagger)

  return docAsyncTask
    .then(function (docs) {
      const baseUrl = getBaseUrl(docs)
      return parseSwaggerDoc(docs, baseUrl)
    })
    .catch(function (err) {
      throw new Error('Document is invalid. ' + err.message)
    })
}

/**
 * Produces array of HAR files for given Swagger document
 *
 * @param swagger         A swagger document or path to doc
 * @param baseUrl         Base URL
 * @returns {Array}       Array of HAR files
 */
const parseSwaggerDoc = function (swagger, baseUrl) {
  const harList = []
  for (const path in swagger.paths) {
    for (const method in swagger.paths[path]) {
      const url = baseUrl + path
      const har = createHar(swagger, path, method)
      harList.push({
        method: method.toUpperCase(),
        url: url,
        description: swagger.paths[path][method].description || 'No description available',
        har: har,
      })
    }
  }

  return harList
}

/**
 * Returns the value referenced in the given reference string
 *
 * @param  {object} oai
 * @param  {string} ref A reference string
 * @return {any}
 */
const resolveRef = function (oai, ref) {
  const parts = ref.split('/')

  if (parts.length <= 1) return {}

  const recursive = function (obj, index) {
    if (index + 1 < parts.length) {
      const newCount = index + 1
      return recursive(obj[parts[index]], newCount)
    }

    return obj[parts[index]]
  }

  return recursive(oai, 1)
}

/**
 * Iterate over all defined keys under encoding and apply encoding for them
 *
 * @param  {string[]} keys Array of keys referencing properties and how to encode them
 * @param  {any} data The data whose properties are encoded
 * @param  {object} [encoding] The encoding options
 * @return {object}
 */
const encodeProperties = function (keys, data, encoding) {
  const encodedSample = keys.reduce((encodedSample, encodingKey) => {
    encodedSample[encodingKey] = encodeValue(data[encodingKey], encoding[encodingKey].contentType)
    return encodedSample
  }, {})
  return Object.assign({}, data, encodedSample)
}

const BASE64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/
/**
 * Infer which content type is used from type of object. If encoding is defined use the encoding type.
 *
 * @param  {any} value Value for which the content type os determined
 * @param  {string} paramKey Key of the param, that is the param name
 * @param  {object} [encoding] The content options
 * @return {string}
 */
const getMultipartContentType = function (value, paramKey, encoding) {
  if (encoding && encoding[paramKey] && encoding[paramKey].contentType) {
    return encoding[paramKey].contentType
  }

  switch (typeof value) {
    case 'object':
      return 'application/json'
    case 'string':
      return BASE64.test(value) ? 'application/octet-stream' : 'text/plain'
    case 'number':
    case 'boolean':
      return 'text/plain'
    default:
      return 'application/octet-stream'
  }
}

/**
 *
 * @param  {Object} swagger Swagger document
 * @param  {string} path    Key of the path
 * @param  {string} method  Key of the method
 * @return {string}         Serialized URL
 */
const serializePath = function (swagger, path, method) {
  const templateUrl = template.parse(path)
  const params = {}

  if (typeof swagger.paths[path][method].parameters !== 'undefined') {
    for (const i in swagger.paths[path][method].parameters) {
      const param = swagger.paths[path][method].parameters[i]
      if (typeof param.in !== 'undefined' && param.in.toLowerCase() === 'path') {
        const data = sample(param.schema || param, {}, swagger)
        Object.assign(params, { [param.name]: data })
      }
    }
  }
  return templateUrl.expand(params)
}

const BOUNDARY = '956888039105887155673143'

/*
 * Returns the encoded value for defined content
 *
 * @param  {any} value The sampled value to encode
 * @param  {string} contentType The content-type of the value
 * @param  {object} [encoding] The encoding options
 * @return {any}
 */
const encodeValue = function (value, contentType, encoding) {
  switch (contentType) {
    case 'application/json':
      return JSON.stringify(value)

    case 'application/x-www-form-urlencoded':
      return querystring.stringify(value)

    case 'application/xml':
      const xmlOptions = {
        header: true,
        indent: '  ',
      }
      return toXML(value, xmlOptions)

    case 'multipart/form-data':
    case 'multipart/mixin':
      const EOL = '\r\n'

      let rawData = Object.keys(value)
        .reduce((params, key) => {
          const multipartContentType = getMultipartContentType(value[key], key, encoding)

          let param = `--${BOUNDARY}${EOL}`
          switch (multipartContentType) {
            case 'text/plain':
              param += `Content-Disposition: form-data; name="${key}"${EOL + EOL}`
              break
            case 'application/json':
              param += `Content-Disposition: form-data; name="${key}"${EOL}`
              param += `Content-Type: ${multipartContentType}${EOL + EOL}`
              break
            default: {
              param += `Content-Disposition: form-data; name="${key}"; filename="${key}"${EOL}`
              param += `Content-Type: ${multipartContentType}${EOL}`
              param += `Content-Transfer-Encoding: base64${EOL + EOL}`
            }
          }

          param += typeof value[key] === 'object' ? JSON.stringify(value[key]) : value[key]

          params.push(param)

          return params
        }, [])
        .join(EOL)
      rawData += EOL
      rawData += `--${BOUNDARY}--`
      return rawData

    case 'image/jpg':
    case 'image/jpeg':
      return Buffer.from([0xff, 0xd8, 0xff, 0xdb], 'hex').toString('base64')

    case 'image/png':
    case 'image/*':
      return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'hex').toString('base64')

    default:
      return typeof value === 'object' ? JSON.stringify(value) : value
  }
}

/**
 * Encode the data
 *
 * @param  {any} data Sample object to encode
 * @param  {string} contentType The content-type of the value
 * @param  {object} [encoding] The encoding options
 * @return {any}
 */
const encodePayload = function (data, contentType, encoding) {
  let encodedData = data

  if (encoding) {
    encodedData = encodeProperties(Object.keys(encoding), data, encoding)
  }

  return {
    mimeType: contentType.includes('multipart')
      ? contentType + `; boundary=${BOUNDARY}`
      : contentType,
    text: encodeValue(encodedData, contentType, encoding),
  }
}

module.exports = {
  oasToHarList: oasToHarList,
  encodePayload: encodePayload,
}
