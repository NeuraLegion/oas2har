const fs = require("fs")
const { promisify } = require("util")
const { extname } = require("path")

const readFile = promisify(fs.readFile)

function load(path) {
  if (!path) {
    return Promise.reject(new TypeError("Path is invalid."))
  }

  var ext = extname(path.toLowerCase())

  return readFile(path, "utf8")
    .then(function(content) {
      if (ext === ".yml" || ext === ".yaml") {
        return require("js-yaml").safeLoad(content)
      } else {
        return JSON.parse(content)
      }
    })
    .catch(function(err) {
      if (err.code === "ENOENT") {
        throw new Error("File not found!")
      } else {
        throw err
      }
    })
}

module.exports = load;
