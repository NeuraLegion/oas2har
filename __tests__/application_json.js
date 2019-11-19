const { encodePayload } = require('../src');

test('Test encodePayload for application/json', function() {
  const jsonSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22
  };

  const jsonEncoded = encodePayload(jsonSample, 'application/json', {});
  expect(jsonEncoded.text).toEqual(JSON.stringify(jsonSample));
});
