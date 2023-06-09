const path = require('path');

module.exports = {
	publicPath: './',
	productionSourceMap: false, // 打包时不生成.map文件
	lintOnSave: false,
	devServer: {
		open: true,
		port: '2997',
		overlay: {
			warnings: false,
			errors: true
		},
		proxy: {
			"/api": {
				// target: 'http://192.168.60.62:8082',
				target: 'http://tmmysql.netiler.com/netdisk/ndk_apis',
				// target: 'http://192.168.40.80:32067',
				// target: 'http://11.7.1.71:18080', // 测试环境
				// target: 'http://11.7.1.12:8081',
				// target: 'http://11.7.1.26:8081', // 旭丰
				changeOrigin: true,
				// withCredentials: true,
				pathRewrite: {
				    '^/api': ''
				}
			}
		},
		// before: require('./mock/mock-server.js')
	},
	css: {
		extract: false,
		sourceMap: false
	},
	configureWebpack: {
		resolve: {
			alias: {
				'@': resolve('src')
			}
		},
		externals: {
			"crypto": 'CryptoJS'
		}
	},
	transpileDependencies: ['vue-agile'], // babel默认不编译node_modules下的依赖，这里指明要编译的依赖包
	chainWebpack: config => {
		//设置全局sass
		const oneOfsMap = config.module.rule('scss').oneOfs.store
		oneOfsMap.forEach(item => {
			item.use('sass-resources-loader')
				.loader('sass-resources-loader')
				.options({
					resources: [
						'./src/assets/scss/variable.scss',
						'./src/assets/scss/base.scss',
						'./src/assets/scss/global.scss',
						'./src/assets/scss/mixin.scss',

						'./src/assets/scss/reset.scss',
					],
				})
				.end()
		})
		// set svg-sprite-loader
		config.module
			.rule('svg')
			.exclude.add(resolve('src/icons'))
			.end()
		config.module
			.rule('icons')
			.test(/\.svg$/)
			.include.add(resolve('src/icons'))
			.end()
			.use('svg-sprite-loader')
			.loader('svg-sprite-loader')
			.options({
				symbolId: 'icon-[name]'
			})
			.end()
	}
}
function resolve(dir) {
	return path.join(__dirname, dir)
}
