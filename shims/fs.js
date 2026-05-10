const fs = {
  existsSync: function() { return false; },
  mkdirSync: function() {},
  statSync: function() { return { size: 0 }; },
  createWriteStream: function() {
    return {
      on: function() {},
      write: function() {},
      end: function() {}
    };
  },
  unlinkSync: function() {},
  renameSync: function() {}
};

module.exports = fs;
