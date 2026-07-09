const { authenticate, authorize } = require("./auth");
const upload = require("./upload");
const validate = require("./validate");

module.exports = {
  authenticate,
  authorize,
  upload,
  validate
};
