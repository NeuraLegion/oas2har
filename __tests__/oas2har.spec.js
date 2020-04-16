const { oasToHarList } = require('../src/converter');
const githubSwagger = require('./fixtures/github_swagger.json');

test('GitHub swagger v2 JSON to HAR', async () => {
  const [firstRequest] = await oasToHarList(githubSwagger);
  const { har } = firstRequest;

  expect(har.method).toEqual('GET');
  expect(har.url).toEqual('https://api.github.com/emojis');
  expect(har.httpVersion).toEqual('HTTP/1.1');
});

test('Petstore OpenApi v3 YAML to JSON converts to HAR', async () => {
  const [firstRequest] = await oasToHarList(process.cwd() + '/__tests__/fixtures/petstore_oas.yaml');
  const { har } = firstRequest;

  expect(har.method).toEqual('PUT');
  expect(har.url).toEqual('https://petstore.swagger.io/v2/pet');
  expect(har.httpVersion).toEqual('HTTP/1.1');
});
