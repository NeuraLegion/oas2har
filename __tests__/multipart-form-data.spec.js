const {encodePayload} = require('../src/converter');

test('Test encodePayload for multipart/form-data', () => {
  const multiPartFormData = {
    name: 'Tom',
    surname: 'Trailer',
    image: Buffer.from('image').toString('base64')
  };

  const content = {
    image: {
      contentType: 'image/png'
    }
  };

  let encodedMultipart = '--956888039105887155673143\r\n';
  encodedMultipart += 'Content-Disposition: form-data; name="name"\r\n\r\n';
  encodedMultipart += 'Tom\r\n';
  encodedMultipart += '--956888039105887155673143\r\n';
  encodedMultipart += 'Content-Disposition: form-data; name="surname"\r\n\r\n';
  encodedMultipart += 'Trailer\r\n';
  encodedMultipart += '--956888039105887155673143\r\n';

  const encodedMultipartComplexExpected = encodedMultipart +
      'Content-Disposition: form-data; name="image"; filename="image"\r\n' +
      'Content-Type: image/png\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\niVBORw0KGgo=\r\n--956888039105887155673143--';

  const multipartFormDataComplexEncoded = encodePayload(multiPartFormData, 'multipart/form-data', content);

  expect(multipartFormDataComplexEncoded.mimeType).toEqual('multipart/form-data; boundary=956888039105887155673143')
  expect(multipartFormDataComplexEncoded.text).toEqual(encodedMultipartComplexExpected);
});


test('Test encodePayload for multipart/form-data', () => {
  const multiPartFormData = {
    person: {
      name: 'John',
      surname: 'Doe'
    }
  };
  let encodedMultipartExpected = '--956888039105887155673143\r\n';
  encodedMultipartExpected += 'Content-Disposition: form-data; name="person"\r\n';
  encodedMultipartExpected += 'Content-Type: application/json\r\n\r\n';
  encodedMultipartExpected += '{"name":"John","surname":"Doe"}\r\n--956888039105887155673143--';

  const multipartFormDataEncoded = encodePayload(multiPartFormData, 'multipart/form-data');
  expect(multipartFormDataEncoded.mimeType).toEqual('multipart/form-data; boundary=956888039105887155673143')
  expect(multipartFormDataEncoded.text).toEqual(encodedMultipartExpected);

});
