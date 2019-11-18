const { encodeSample } = require('../src');
const querystring = require('querystring');

test('Test encodeSample for application/x-www-form-urlencoded', function() {
  const querystringSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22
  };
  const queryStringEncoded = encodeSample(querystringSample, 'application/x-www-form-urlencoded', {});
  expect(queryStringEncoded).toEqual(querystring.stringify(querystringSample));
});
