export default {
  dirname: function (_p: string) {
    return '';
  },
  join: function (...paths: string[]) {
    return paths.join('/');
  },
};
