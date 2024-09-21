require('dotenv').config();
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { loadCSS, extractCSS } = require('./webpack.parts');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');

const pageTitles = {
  index: 'Welcome',
  signin: 'Sign In',
  signup: 'Sign Up'
};

// Page-specific stylesheets and scripts
const pageAssets = {
  index: {
    styles: [],
    scripts: []
  },
  signin: {
    styles: [
      'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
    ],
    scripts: [
      'https://code.jquery.com/jquery-3.5.1.slim.min.js',
      'https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js',
      'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'
    ]
  },
  signup: {
    styles: ['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'],
    scripts: []
  }
};

const pages = Object.keys(pageTitles);

// Create an array to store HtmlWebpackPlugin instances
const htmlPlugins = pages.map((page) => {
  // Construct the file path
  const filePath = path.resolve(__dirname, 'src/views', `${page}-body-content.html`);
  // Read the content of each file
  const bodyContent = fs.readFileSync(filePath, 'utf-8');

  // Get styles and scripts for the page
  const styles = pageAssets[page]?.styles || [];
  const scripts = pageAssets[page]?.scripts || [];

  const chunks = [page];

  return new HtmlWebpackPlugin({
    template: './src/views/template.ejs', // Template for all HTML pages
    filename: `./${page}.html`, // Output file for each page
    domain: 'badminton-app-sooty.vercel.app',
    bodyContent, // Inject the body content dynamically
    inject: 'body',
    title: pageTitles[page], // Inject title
    styles, // Pass styles to inject into the template
    scripts, // Pass scripts to inject into the template
    chunks, // Specify the chunk for this page
    minify: {
      collapseWhitespace: true,
      removeComments: true
    }
  });
});

module.exports = (env, argv) => {
  const commonConfig = {
    mode: env.mode,
    devtool: env.mode === 'production' ? false : 'source-map',
    entry: {
      index: './src/js/index.js',
      signin: './src/js/signIn.js',
      signup: './src/js/signUp.js'
    },
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'build'),
      assetModuleFilename: '[path][name][ext]',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.ejs$/i,
          use: [{ loader: 'ejs-easy-loader' }]
        },
        {
          test: /\.(png|jpg|gif|svg|ico)$/, // Images
          type: 'asset/resource' // Asset modules for images
        },
        {
          test: /\.json$/,
          type: 'asset/resource'
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    plugins: [
      new FileManagerPlugin({
        events: {
          onStart: {
            delete: [
              {
                source: path.join(__dirname, 'build/').replaceAll('\\', '/'),
                options: {
                  force: true,
                  recursive: true
                }
              }
            ]
          },
          onEnd: {
            copy: [
              // Copy all JavaScript files
              { source: path.join(__dirname, 'build/*.js'), destination: path.join(__dirname, 'public') },
              // Copy all CSS files
              { source: path.join(__dirname, 'build/*.css'), destination: path.join(__dirname, 'public') }
            ]
          }
        },
        runTasksInSeries: false, // Run tasks in parallel
        runOnceInWatchMode: false // Run tasks only once in watch mode
      }),
      new CleanWebpackPlugin({
        protectWebpackAssets: false,
        cleanAfterEveryBuildPatterns: ['*.LICENSE.txt']
      }),

      new NodePolyfillPlugin(),
      ...htmlPlugins
    ],
    resolve: {
      roots: [path.resolve(__dirname, 'public'), path.resolve(__dirname, 'public/assets/images')],
      extensions: ['.json', '.js']
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true
        })
      ],
      splitChunks: {
        chunks: 'all'
      }
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      compress: true,
      port: 3000,
      hot: true,
      proxy: [
        {
          context: ['/signin', '/api'],
          target: 'http://localhost:5000'
        }
      ]
    }
  };
  if (env.mode === 'production') {
    return merge(commonConfig, extractCSS({ use: 'css-loader' }));
  } else {
    return merge(commonConfig, loadCSS());
  }
};
