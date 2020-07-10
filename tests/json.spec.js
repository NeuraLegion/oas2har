const { encodePayload } = require('../src/converter')

test('Test encodePayload for application/json', () => {
  const jsonSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22,
  }

  const jsonEncoded = encodePayload(jsonSample, 'application/json', {})
  expect(jsonEncoded.text).toEqual(JSON.stringify(jsonSample))
})
