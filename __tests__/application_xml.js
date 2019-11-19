const { encodePayload } = require('../src');
const { toXML } = require('jstoxml');

test('Test encodePayload for application/xml', function() {
  const xmlSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22
  };

  const xmlOptions = {
    header: true,
    indent: '  '
  };

  const xmlEncoded = encodePayload(xmlSample, 'application/xml', {});
  expect(xmlEncoded.text).toEqual(toXML(xmlSample, xmlOptions));
});
