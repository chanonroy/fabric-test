var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var path = require('path');

var BASE_DIR = path.resolve(__dirname, '../');
var SRC_DIR = path.join(BASE_DIR, './src');
var DIST_DIR = path.join(BASE_DIR, './dist');

module.exports = {
    entry: {
      main: path.join(SRC_DIR, './index.js'),
    },

    output: {
      path: path.join(BASE_DIR, 'dist'),
      filename: '[name].js',
      publicPath: '/'
    },

    module: {
      loaders: [
        {
          // JavaScript Loaders
          test: /\.js?$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.vue$/, 
          loader: "vue-loader"
        },
        {
          // Style Loaders (Sass, PostCSS)
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
              use: [
                { loader: "css-loader?minimize" }, // css-loader?minimize
                { loader: "postcss-loader",
                  options: { plugins() { return [require('autoprefixer')({
                      browsers: ['last 3 versions']
                    })]; }
                  }
                },
                { loader: "sass-loader" }
              ],
              fallback: "style-loader"
          }),
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: "css-loader"
            }
          ],
        },
        {
          // Image Assets
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          loader: 'file-loader',
          options: {
            name: 'assets/[name].[ext]'
          },
        },
        {
          test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',    // where the fonts will go
              publicPath: '../'       // override the default path
            }
          }]
        },
      ]
    },

    resolve: {
      alias: {
        vue: 'vue/dist/vue.js'
      }
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new ExtractTextPlugin({
        filename: "css/[name].css",
      }),
      // new UglifyJSPlugin()
    ],

};