var pug = require('pug');

module.exports = function (absoluteTemplatePath, data, next) {
    pug.renderFile(absoluteTemplatePath, data, function (err, compiledTemplate) {
        if (err) {
            throw new Error('Problem with compiling template' + absoluteTemplatePath + ": " + err);
        }
        next(null, compiledTemplate);
    })
}