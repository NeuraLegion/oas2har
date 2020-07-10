const { encodePayload } = require('../src/converter')
const querystring = require('querystring')

test('Test encodePayload for application/x-www-form-urlencoded', () => {
  const querystringSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22,
  }
  const queryStringEncoded = encodePayload(
    querystringSample,
    'application/x-www-form-urlencoded',
    {}
  )
  expect(queryStringEncoded.text).toEqual(querystring.stringify(querystringSample))
})
