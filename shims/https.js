const https = {
  request: function() {
    return {
      write: function() {},
      end: function() {},
      on: function() {}
    };
  }
};

module.exports = https;
