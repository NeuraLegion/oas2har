const { encodePayload } = require('../src');

test('Test encodePayload for text/plain', function() {
  const primitiveSample = 'primitive';
  const primitiveEncoded = encodePayload(primitiveSample, '*/*');
  expect(primitiveEncoded.text).toEqual(primitiveSample);
});
