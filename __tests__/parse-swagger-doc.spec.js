const { parseSwaggerDoc } = require('../src/converter')

test('should return empty entries', () => {
  const swagger = {
    paths: {
      'x-swagger-router-controller': 'health',
    },
  }
  const entries = parseSwaggerDoc(swagger, 'https://example.com')
  expect(entries.length).toEqual(0)
})

test('should skip x-swagger-router-controller from paths', () => {
  const swagger = {
    paths: {
      'x-swagger-router-controller': 'health',
      '/emojis': {
        get: {
          parameters: [
            {
              description: 'You can check the current version of media type in responses.',
              in: 'header',
              name: 'X-Media-Type',
              type: 'string',
            },
          ],
        },
      },
    },
  }
  const entries = parseSwaggerDoc(swagger, 'https://example.com')
  expect(entries.length).toEqual(1)
  expect(entries).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ url: 'https://example.com/emojis' })
    ])
  )
})
