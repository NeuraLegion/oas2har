const { paramsSerialization } = require('../src/converter')
const { toFlattenArray } = require('../src/utils')

describe('Query Parameters', () => {
  const array = [1, 2, 3, 4, 5]
  const object = { role: 'admin', name: { first: 'Jon', last: 'Snow' }, filter: { gt: 1, lte: 10 } }
  const primitive = 1
  const name = 'id'

  test('should serialize primitive with default method', () => {
    const result = paramsSerialization(name, primitive)
    expect(result.queryString).toEqual('id=1')
    expect(result.values).toEqual([{ name, value: primitive + '' }])
  })

  test('should serialize array with default method', () => {
    const result = paramsSerialization(name, array)
    expect(result.queryString).toEqual(`${array.map((x) => `${name}=${x}`).join('&')}`)
    expect(result.values).toEqual(array.map((x) => ({ name, value: x + '' })))
  })

  test('should serialize object with default method', () => {
    const result = paramsSerialization(name, object)
    expect(result.queryString).toEqual(
      'role=admin&name[first]=Jon&name[last]=Snow&filter[gt]=1&filter[lte]=10'
    )
    expect(result.values).toEqual([
      { name: 'role', value: 'admin' },
      { name: 'name[first]', value: 'Jon' },
      { name: 'name[last]', value: 'Snow' },
      { name: 'filter[gt]', value: '1' },
      { name: 'filter[lte]', value: '10' },
    ])
  })

  test('should serialize primitive with style: form and explode: false', () => {
    const result = paramsSerialization(name, primitive, { explode: false })
    expect(result.queryString).toEqual('id=1')
    expect(result.values).toEqual([{ name, value: primitive + '' }])
  })

  test('should serialize array with style: form and explode: false', () => {
    const result = paramsSerialization(name, array, { explode: false })
    expect(result.queryString).toEqual(`${name}=${array.join(',')}`)
    expect(result.values).toEqual([{ name, value: array.join(',') }])
  })

  test('should serialize object with style: form and explode: false', () => {
    const result = paramsSerialization(name, object, { explode: false })
    expect(result.queryString).toEqual(`${name}=${toFlattenArray(object).join(',')}`)
    expect(result.values).toEqual([{ name, value: toFlattenArray(object).join(',') }])
  })

  test('should ignore an object with style: spaceDelimited', () => {
    const result = paramsSerialization(name, object, { explode: true, style: 'pipeDelimited' })
    expect(result.queryString).toEqual('')
  })

  test('should ignore an object with style: pipeDelimited', () => {
    const result = paramsSerialization(name, object, { explode: true, style: 'pipeDelimited' })
    expect(result.queryString).toEqual('')
  })

  test('should serialize array with style: spaceDelimited and explode: true', () => {
    const result = paramsSerialization(name, array, { explode: true, style: 'spaceDelimited' })
    expect(result.queryString).toEqual(`${array.map((x) => `${name}=${x}`).join('&')}`)
    expect(result.values).toEqual(array.map((x) => ({ name, value: x + '' })))
  })

  test('should serialize array with style: spaceDelimited and explode: false', () => {
    const result = paramsSerialization(name, array, { explode: false, style: 'spaceDelimited' })
    expect(result.queryString).toEqual(`${name}=${array.join('%20')}`)
    expect(result.values).toEqual([{ name, value: array.join('%20') }])
  })

  test('should serialize array with style: pipeDelimited and explode: true', () => {
    const result = paramsSerialization(name, array, { explode: true, style: 'pipeDelimited' })
    expect(result.queryString).toEqual(`${array.map((x) => `${name}=${x}`).join('&')}`)
    expect(result.values).toEqual(array.map((x) => ({ name, value: x + '' })))
  })

  test('should serialize array with style: pipeDelimited and explode: false', () => {
    const result = paramsSerialization(name, array, { explode: false, style: 'pipeDelimited' })
    expect(result.queryString).toEqual(`${name}=${array.join('|')}`)
    expect(result.values).toEqual([{ name, value: array.join('|') }])
  })

  test('should serialize object with style: deepObject', () => {
    const result = paramsSerialization(name, object, { style: 'deepObject' })
    expect(result.queryString).toEqual(
      'role=admin&name[first]=Jon&name[last]=Snow&filter[gt]=1&filter[lte]=10'
    )
    expect(result.values).toEqual([
      { name: 'role', value: 'admin' },
      { name: 'name[first]', value: 'Jon' },
      { name: 'name[last]', value: 'Snow' },
      { name: 'filter[gt]', value: '1' },
      { name: 'filter[lte]', value: '10' },
    ])
  })
})
