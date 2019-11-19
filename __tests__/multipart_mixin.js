const {encodeSample} = require('../src');

test('Test encodeSample for multipart/form-data', function () {
  const multipartMixin = {
    user: {
      username: 'john',
      password: 'password'
    },
    token: 'user_token',
    amount: 100,
    buffer: 'base65'
  };

  const content = {
    encoding: {
      user: {
        contentType: 'application/json'
      },
      token: {
        contentType: 'text/plain'
      },
      buffer: {
        contentType: 'application/octet-stream'
      }
    }
  };

  const multipartMixinExpected = '--956888039105887155673143\r\n' +
    'Content-Disposition: form-data; name="user"\r\n'+
    'Content-Type: application/json\r\n\r\n'+
    '{"username":"john","password":"password"}\r\n'+
    '--956888039105887155673143\r\n'+
    'Content-Disposition: form-data; name="token"\r\n'+
    'Content-Type: text/plain\r\n\r\n'+
    'dXNlcl90b2tlbg==\r\n'+
    '--956888039105887155673143\r\n'+
    'Content-Disposition: form-data; name="amount"\r\n'+
    'Content-Type: text/plain\r\n\r\n'+
    '100\r\n'+
    '--956888039105887155673143\r\n'+
    'Content-Disposition: form-data; name="buffer"; filename="buffer"\r\n'+
    'Content-Type: application/octet-stream\r\n\r\n'+
    'YmFzZTY1\r\n'+
    '--956888039105887155673143--';
  const multipartMixinEncoded = encodeSample(multipartMixin, 'multipart/mixin', content);

  expect(multipartMixinEncoded).toEqual(multipartMixinExpected);

});
