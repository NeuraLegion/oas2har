const { encodePayload } = require('../src/converter')

test('Test encodePayload for multipart/form-data', () => {
  const multipartMixin = {
    user: {
      username: 'john',
      password: 'password',
    },
    token: 'user_token',
    amount: 100,
    buffer: Buffer.from('base65').toString('base64'),
  }

  const content = {
    user: {
      contentType: 'application/json',
    },
    buffer: {
      contentType: 'application/octet-stream',
    },
  }

  const multipartMixinExpected =
    '--956888039105887155673143\r\n' +
    'Content-Disposition: form-data; name="user"\r\n' +
    'Content-Type: application/json\r\n\r\n' +
    '{"username":"john","password":"password"}\r\n' +
    '--956888039105887155673143\r\n' +
    'Content-Disposition: form-data; name="token"\r\n\r\n' +
    'user_token\r\n' +
    '--956888039105887155673143\r\n' +
    'Content-Disposition: form-data; name="amount"\r\n\r\n' +
    '100\r\n' +
    '--956888039105887155673143\r\n' +
    'Content-Disposition: form-data; name="buffer"; filename="buffer"\r\n' +
    'Content-Type: application/octet-stream\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    'YmFzZTY1\r\n' +
    '--956888039105887155673143--'
  const multipartMixinEncoded = encodePayload(multipartMixin, 'multipart/mixin', content)

  expect(multipartMixinEncoded.text).toEqual(multipartMixinExpected)
  expect(multipartMixinEncoded.mimeType).toEqual(
    'multipart/mixin; boundary=956888039105887155673143'
  )
})
