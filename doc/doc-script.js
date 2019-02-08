import * as path from 'path';

const fs = require("fs")
const raml2html = require('raml2html');
const configWithDefaultTheme = raml2html.getConfigForTheme();

// source can either be a filename, url, or parsed RAML object
exports.doc = raml2html.render(process.env.RAML_FILE_NAME, configWithDefaultTheme).then(function(result) {
   fs.writeFile(path.join(__dirname, '../public/apidoc/index.html'), result, err => {}) 
}, function(error) {
  // Output error
});

