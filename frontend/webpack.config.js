const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.js', // Ponto de entrada do seu aplicativo
  output: {
    path: path.resolve(__dirname, 'dist'), // Pasta de saída
    filename: 'bundle.js' // Nome do arquivo de saída
  },
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Regra para processar arquivos .js e .jsx
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Transpilar o código com Babel
        },
      },
      {
        test: /\.css$/, // Regra para processar arquivos .css
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // Regra para processar arquivos de imagem
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new Dotenv({
      path: './.env', // Caminho para o arquivo .env
    }),
  ],
  devServer: {
    static: './dist', // Pasta para servir arquivos no modo de desenvolvimento
    port: 3000, // Porta para o servidor de desenvolvimento
  },
};
