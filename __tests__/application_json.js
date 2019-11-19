const { encodeSample } = require('../src');

test('Test encodeSample for application/json', function() {
  const jsonSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22
  };

  const jsonEncoded = encodeSample(jsonSample, 'application/json', {});
  expect(jsonEncoded).toEqual(JSON.stringify(jsonSample));
});
