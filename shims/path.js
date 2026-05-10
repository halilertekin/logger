const path = {
  dirname: function() { return ''; },
  join: function() { return Array.prototype.slice.call(arguments).join('/'); },
  resolve: function() { return Array.prototype.slice.call(arguments).join('/'); },
  basename: function() { return ''; },
  extname: function() { return ''; }
};

module.exports = path;
