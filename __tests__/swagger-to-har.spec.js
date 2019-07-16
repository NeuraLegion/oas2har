const { oasToHarList } = require("../src")
const nexploitSwagger = require("./nexploit_swagger")
const githubSwagger = require("./github_swagger")

test("NexPloit swagger v2 JSON to HAR", async function() {
  const [firstRequest] = await oasToHarList(nexploitSwagger)
  const { har } = firstRequest

  expect(har.method).toEqual("GET")
  expect(har.url).toEqual("https://nexploit.app/api/v1/agents")
  expect(har.httpVersion).toEqual("HTTP/1.1")
})

test("GitHub swagger v2 JSON to HAR", async function() {
  const [firstRequest] = await oasToHarList(githubSwagger)
  const { har } = firstRequest

  expect(har.method).toEqual("GET")
  expect(har.url).toEqual("https://api.github.com/emojis")
  expect(har.httpVersion).toEqual("HTTP/1.1")
})


test("Petstore OpenApi v3 YAML to JSON converts to HAR", async function() {
  const [firstRequest] = await oasToHarList(process.cwd() + "/__tests__/petstore_oas.yaml")
  const { har } = firstRequest

  expect(har.method).toEqual("PUT")
  expect(har.url).toEqual("https://petstore.swagger.io/v2/pet")
  expect(har.httpVersion).toEqual("HTTP/1.1")
})
