const { encodeSample } = require('../src');
const { toXML } = require('jstoxml');

test('Test encodeSample for application/xml', function() {
  const xmlSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22
  };

  const xmlOptions = {
    header: true,
    indent: '  '
  };

  const xmlEncoded = encodeSample(xmlSample, 'application/xml', {});
  expect(xmlEncoded).toEqual(toXML(xmlSample, xmlOptions));
});
