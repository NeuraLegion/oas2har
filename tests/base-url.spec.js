const { getBaseUrl } = require('../src/converter')

describe('OAS3', () => {
  test('should return https url', () => {
    const url = getBaseUrl({
      servers: [
        { url: 'https://example.com' },
        { url: 'https://sub.example.com' },
        { url: 'http://example.com' },
      ],
    })

    expect(url).toContain('https://')
  })

  test('should return http url for backward compatibility', () => {
    const url = getBaseUrl({
      servers: [{ url: 'http://example.com' }, { url: 'http://sub.example.com' }],
    })

    expect(url).toContain('http://')
  })

  test('should return url without trailing slash', () => {
    const url = getBaseUrl({
      servers: [{ url: 'https://example.com/' }, { url: 'http://example.com' }],
    })

    expect(url).toContain('https://')
  })
})

describe('OAS2', () => {
  test('should return https url', () => {
    const url = getBaseUrl({
      schemes: ['https', 'http'],
      host: 'example.com',
    })

    expect(url).toEqual('https://example.com')
  })

  test('should return http url for backward compatibility', () => {
    const url = getBaseUrl({
      schemes: ['http'],
      host: 'example.com',
    })

    expect(url).toContain('http://example.com')
  })

  test('should return url with path', () => {
    const url = getBaseUrl({
      schemes: ['http', 'https'],
      host: 'example.com',
      basePath: '/api/v1',
    })

    expect(url).toContain('https://example.com/api/v1')
  })
})
