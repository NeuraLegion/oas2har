const { encodeSample } = require('../src');

test('Test encodeSample for text/plain', function() {
  const primitiveSample = 'primitive';
  const primitiveEncoded = encodeSample(primitiveSample, '*/*', {});
  expect(primitiveEncoded).toEqual(Buffer.from(primitiveSample).toString('base64'));
});
