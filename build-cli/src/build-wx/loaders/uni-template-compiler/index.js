const path = require('path')
const hash = require('hash-sum')
const parser = require('@babel/parser')
const { getAllPages } = require('../../common/utils')

const {
    parseComponent,
    compile,
    compileToFunctions,
    ssrCompile,
    ssrCompileToFunctions
} = require('vue-template-compiler')

const traverseScript = require('./script/traverse')
const generateScript = require('./script/generate')
const traverseTemplate = require('./template/traverse')
const generateTemplate = require('./template/generate')

const compilerModule = require('./module')

const generateCodeFrame = require('./codeframe')

const { isUnaryTag } = require('./util')

module.exports = {
    compile(source, options = {}) {
        // transformAssetUrls
        options.modules.push(require('./asset-url'))
        options.modules.push(require('./bool-attr'))

        options.isUnaryTag = isUnaryTag
        options.preserveWhitespace = false
        options.modules.push(compilerModule)

        // optimize 针对虚拟DOM的，静态节点优化，显然这里不需要
        const res = compile(source, Object.assign(options, { optimize: false }));

        options.mp.platform = require('./mp')();
        options.mp.scopeId = options.scopeId // for scoped css
        options.mp.resourcePath = options.resourcePath
        options.mp.hashId = options.resourcePath ? hash(options.resourcePath) : ''
        options.mp.globalUsingComponents = options.globalUsingComponents || {}
        options.mp.filterModules = Object.keys(options.filterModules || {})
        options.mp.wxComponents = options.wxComponents || Object.create(null)

        const state = {
            ast: {},
            script: '',
            template: '',
            errors: new Set(),
            tips: new Set(),
            options: options.mp
        }

        const ast = parser.parse(`function render(){${res.render}}`)
        let template = '';
        console.log(options.mp.platform,"options.mp.platform")
        try {
            res.render = generateScript(traverseScript(ast, state), state)
            template = generateTemplate(traverseTemplate(ast, state), state)
        } catch (e) {
            console.error(e)
            throw new Error('Compile failed at ' + options.resourcePath.replace(path.extname(options.resourcePath), '.vue'))
        }

        // res.specialMethods
        // res.files
        // res.generic // resolve scoped slots
        // res.componentGenerics // define scoped slots

        if (options.emitFile) {
            // updateSpecialMethods
            console.log(template,"===== template ====")
            options.emitFile(options.resourcePath, template)
            if (res.files) {
                Object.keys(res.files).forEach(name => {
                    options.emitFile(name, res.files[name])
                })
            }
            // console.log('emitFile',options.emitFile.toString())
            console.log(res,'res')
            // TODO usingGlobalComponents
            // TODO generic
            // TODO componentGenerics
        } else {
            res.template = template
        }
        console.log('============= start-uni-template-compiler ============= ')
        console.log(res)
        console.log('============= end-uni-template-compiler ============= ')
        return res
    },
    parseComponent,
    compileToFunctions,
    ssrCompile,
    ssrCompileToFunctions,
    generateCodeFrame
}
