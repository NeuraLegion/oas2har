const { encodeSample } = require('../src');

test('Test encodeSample for multipart/form-data', function() {
  const multiPartFormData = {
    name: 'Tom',
    surname: 'Trailer',
    image: 'image'
  };

  const content = {
    encoding: {
      image: {
        contentType: 'image/png'
      }
    }
  };

  let encodedMultipart = '--956888039105887155673143\r\n';
  encodedMultipart += 'Content-Disposition: form-data; name="name"; filename="name"\r\n';
  encodedMultipart += 'Content-Type: text/plain\r\n\r\n';
  encodedMultipart +=  'Tom\r\n';
  encodedMultipart +=  '--956888039105887155673143\r\n';
  encodedMultipart +=  'Content-Disposition: form-data; name="surname"; filename="surname"\r\n';
  encodedMultipart +=  'Content-Type: text/plain\r\n\r\n';
  encodedMultipart +=  'Trailer\r\n';
  encodedMultipart +=  '--956888039105887155673143\r\n';
  encodedMultipart +=  'Content-Disposition: form-data; name="image"; filename="image"\r\n';

  const encodedMultipartExpected =  encodedMultipart  + 'Content-Type: text/plain\r\n\r\nimage\r\n--956888039105887155673143--';
  const encodedMultipartComplexExpected = encodedMultipart  + 'Content-Type: image/png\r\n\r\niVBORw0KGgo=\r\n--956888039105887155673143--';

  const multipartFormDataEncoded = encodeSample(multiPartFormData, 'multipart/form-data', {});
  const multipartFormDataComplexEncoded = encodeSample(multiPartFormData, 'multipart/form-data', content);

  expect(multipartFormDataEncoded).toEqual(encodedMultipartExpected);
  expect(multipartFormDataComplexEncoded).toEqual(encodedMultipartComplexExpected);
});


test('Test encodeSample for multipart/form-data', function() {
  const multiPartFormData = {
    person: {
      name: 'John',
      surname: 'Doe'
    }
  };
  let encodedMultipartExpected = '--956888039105887155673143\r\n';
  encodedMultipartExpected += 'Content-Disposition: form-data; name="person"; filename="person"\r\n';
  encodedMultipartExpected += 'Content-Type: application/json\r\n\r\n';
  encodedMultipartExpected += '{"name":"John","surname":"Doe"}\r\n--956888039105887155673143--';

  const multipartFormDataEncoded = encodeSample(multiPartFormData, 'multipart/form-data', {});
  expect(multipartFormDataEncoded).toEqual(encodedMultipartExpected);

});
