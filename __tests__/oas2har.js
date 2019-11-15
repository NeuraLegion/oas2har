const { encodeSample, oasToHarList } = require('../src')
const githubSwagger = require('./github_swagger')
const { toXML } = require('jstoxml');
const querystring = require('querystring');

test('GitHub swagger v2 JSON to HAR', async function() {
  const [firstRequest] = await oasToHarList(githubSwagger)
  const { har } = firstRequest

  expect(har.method).toEqual('GET')
  expect(har.url).toEqual('https://api.github.com/emojis')
  expect(har.httpVersion).toEqual('HTTP/1.1')
})


test('Petstore OpenApi v3 YAML to JSON converts to HAR', async function() {
  const [firstRequest] = await oasToHarList(process.cwd() + '/__tests__/petstore_oas.yaml')
  const { har } = firstRequest

  expect(har.method).toEqual('PUT')
  expect(har.url).toEqual('https://petstore.swagger.io/v2/pet')
  expect(har.httpVersion).toEqual('HTTP/1.1')
})

test('Test encodignSample method', async function() {
  const jsonSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22
  };
  const jsonEncoded = encodeSample(jsonSample, 'application/json', {});

  const querystringSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22
  };
  const queryStringEncoded = encodeSample(querystringSample, 'application/x-www-form-urlencoded', {});

  const xmlSample = {
    name: 'Tom',
    surname: 'Trailer',
    age: 22
  };
  const xmlOptions = {
    header: true,
    indent: '  '
  }
  const xmlEncoded = encodeSample(xmlSample, 'application/xml', {});

  const primitiveSample = 'primitive';
  const primitiveEncoded = encodeSample(primitiveSample, '*/*', {});

  const multiPartFormData = {
    name: 'Tom',
    surname: 'Trailer',
    image: 'image'
  };
  const multiPartFormDataEncoded = encodeSample(multiPartFormData, 'multipart/form-data', {
    encoding: {
      image: {
        contentType: 'image/png'
      }
    }
  });

  let encodedMultipartExpected = '--956888039105887155673143\r\n';
  encodedMultipartExpected += 'Content-Disposition: form-data; name="name"; filename="name"\r\n';
  encodedMultipartExpected += 'Content-Type: text/plain\r\n\r\n';
  encodedMultipartExpected +=  'Tom\r\n';
  encodedMultipartExpected +=  '--956888039105887155673143\r\n';
  encodedMultipartExpected +=  'Content-Disposition: form-data; name="surname"; filename="surname"\r\n';
  encodedMultipartExpected +=  'Content-Type: text/plain\r\n\r\n';
  encodedMultipartExpected +=  'Trailer\r\n';
  encodedMultipartExpected +=  '--956888039105887155673143\r\n';
  encodedMultipartExpected +=  'Content-Disposition: form-data; name="image"; filename="image"\r\n';
  encodedMultipartExpected +=  'Content-Type: image/png\r\n\r\n';
  encodedMultipartExpected +=  'iVBORw0KGgo=\r\n';
  encodedMultipartExpected +=  '--956888039105887155673143--';

  const pngSample = encodeSample({}, 'image/png', {})
  const jpgSample = encodeSample({}, 'image/jpg', {})

  expect(jsonEncoded).toEqual(JSON.stringify(jsonSample));
  expect(xmlEncoded).toEqual(toXML(xmlSample, xmlOptions));
  expect(queryStringEncoded).toEqual(querystring.stringify(querystringSample));
  expect(multiPartFormDataEncoded).toEqual(encodedMultipartExpected);
  expect(primitiveEncoded).toEqual(Buffer.from(primitiveSample).toString('base64'));
  expect(atob(pngSample).includes('PNG')).toEqual(true);
  expect(atob(jpgSample).includes('ÿØÿÛ')).toEqual(true);
})
