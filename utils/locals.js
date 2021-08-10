const moment = require("moment");
module.exports = {
  formatDate: (date, format) => {
    return moment(date).format(format);
  },
};
