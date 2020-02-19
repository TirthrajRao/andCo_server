const multer = require('multer');
/**
 * Function To FileUpload Using Multer
 * @param {Object} - File Object To Upload
 * @returns {Array} - Return Array Of Files With Details
 */
const upload = (file) => {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now())
        }
    })
    return multer({ storage: storage }).array(file);
}

module.exports = {
    upload
}
