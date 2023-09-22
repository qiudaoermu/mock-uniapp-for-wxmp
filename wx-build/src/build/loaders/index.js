const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function getRules(context) {
    return [
        {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
            test: /\.vue$/,
            use: [
                {
                    loader: 'vue-loader',
                    options: {
                        compiler: require('./uni-template-compiler'), // 模板预编译 （template => ast => render）
                        compilerOptions: {
                            mp: {
                                platform: "mp-weixin",
                                scopedSlotsCompiler: "auto",
                            },
                            filterModules: {},
                            filterTagName: 'wxs',
                        },
                    }
                },
            ]
        },
        {
            test: /\.m?jsx?$/,
            exclude: function (filepath) {
                return /node_modules/.test(filepath)
            },
            use: [
                {
                    loader: "babel-loader"
                }
                // 为什么不使用 options，options有共享问题
                // https://stackoverflow.com/questions/60288375/when-to-use-babel-config-js-and-babelrc#:~:text=Babel%20has%20two%20parallel%20config,be%20used%20together%2C%20or%20independently.&text=Given%20that%20information-,.,be%20transformed%2Fchanged%20by%20babel.
            ]
        },
        {
            test: `${context}/main.js`,
            use: [
                {
                    loader: path.resolve(__dirname, 'mp/main.js'),
                    options: {
                        bridge: path.resolve(__dirname, '../../runtime/uni-mp-weixin/index')
                    },
                },
            ]
        },
        {
            resourceQuery: /vue&type=script/,
            use: [
                {
                    loader: path.resolve(__dirname, 'mp/script.js')
                }
            ]
        },
        {
            resourceQuery: /vue&type=template/,
            use: [
                {
                    loader: path.resolve(__dirname, 'mp/template.js')
                }
            ]
        },
        {
            // 使用 resourceQuery 来为一个没有 lang 的自定义块匹配一条规则
            // 如果找到了一个自定义块的匹配规则，它将会被处理，否则该自定义块会被默默忽略
            resourceQuery: /blockType=i18n/,
            // Rule.type 设置类型用于匹配模块。它防止了 defaultRules 和它们的默认导入行为发生
            type: 'javascript/auto',
            // 这里指的是 vue-i18n-loader
            use: [path.resolve(__dirname, 'mp/i18n.js')]
        }
    ]
}

/*
// code returned from the main loader for 'source.vue'

// import the <template> block
import render from 'source.vue?vue&type=template'
// import the <script> block
import script from 'source.vue?vue&type=script'
export * from 'source.vue?vue&type=script'
// import <style> blocks
import 'source.vue?vue&type=style&index=1'

script.render = render
export default script
*/


module.exports = function (context) {
    return getRules(context);
}