const { encodePayload } = require('../src/converter')

test('Test encodePayload for image/*', () => {
  const pngSample = encodePayload({}, 'image/png', {})
  const jpgSample = encodePayload({}, 'image/jpg', {})

  expect(atob(pngSample.text).includes('PNG')).toEqual(true)
  expect(atob(jpgSample.text).includes('ÿØÿÛ')).toEqual(true)
})
