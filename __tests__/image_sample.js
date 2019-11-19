const { encodeSample } = require('../src');

test('Test encodeSample for image/*', function() {
  const pngSample = encodeSample({}, 'image/png', {});
  const jpgSample = encodeSample({}, 'image/jpg', {});

  expect(atob(pngSample).includes('PNG')).toEqual(true);
  expect(atob(jpgSample).includes('ÿØÿÛ')).toEqual(true);
});
