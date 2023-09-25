// import { ParsedUrlQuery, parse } from 'querystring'
const qs = require('querystring')
module.exports = function (
  content
) {
  if (this.version && this.version >= 2) {
    try {
      let value = typeof content === 'string'
        ? JSON.parse(content)
        : content
      value = JSON.stringify(value)
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
      // const code = `module.exports = function (Component) { Component.options.__i18n = '${value.replace(/\u0027/g, '\\u0027')}' }`
      this.callback(null, value)
    } catch (err) {
      this.emitError(err.message)
      this.callback(err)
    }
  } else {
    const message = 'support webpack 2 later'
    this.emitError(message)
    this.callback(new Error(message))
  }
}
/**
 * 将i18n标签生成代码
 * @param {string | Buffer} source
 * @param {ParsedUrlQuery} query
 * @returns {string} code
 */
function generateCode(source, query) {
  const data = convert(source, query.lang )
  let value = JSON.parse(data)

  if (query.locale && typeof query.locale === 'string') {
    value = Object.assign({}, { [query.locale]: value })
  }

  // 特殊字符转义，\u2028 -> 行分隔符，\u2029 -> 段落分隔符，\\ 反斜杠
  value = JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
    .replace(/\\/g, '\\\\')

  let code = ''
  code += `function (Component) {
  Component.options.__i18n = Component.options.__i18n || []
  Component.options.__i18n.push('${value.replace(/\u0027/g, '\\u0027')}')
  delete Component.options._Ctor
}\n`
  return code
}

/**
 * 转换各种用法为json字符串
 */
function convert(source,lang){
  const value = Buffer.isBuffer(source) ? source.toString() : source

  switch (lang) {
    case 'yaml':
    case 'yml':
      const data = yaml.safeLoad(value)
      return JSON.stringify(data, undefined, '\t')
    case 'json5':
      return JSON.stringify(JSON5.parse(value))
    default:
      return value
  }
}

