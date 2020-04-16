const { encodePayload } = require('../src/converter');

test('Test encodePayload for text/plain', () => {
  const primitiveSample = 'primitive';
  const primitiveEncoded = encodePayload(primitiveSample, '*/*');
  expect(primitiveEncoded.text).toEqual(primitiveSample);
});
