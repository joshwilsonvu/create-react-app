// This loader transforms MM2 modules into react components.
'use strict';
const path = require('path');
module.exports = function(content) {
  this.cacheable(true);
  this.addDependency('@mm/mm2');

  // if this is a mm2-style module,
  if (/^\s*Module\.register\(/m.test(content)) {
    // extract the name of the directory
    const resourceName = path.basename(path.dirname(this.resourcePath));
    this.getLogger().log(
      `Loading mm2-style module ${resourceName} from ${this.resourcePath}`
    );
    // export the result of calling mm2() with js source and name
    return `import mm2 from "@mm/mm2";\nimport config from "config/config";\nexport default mm2(${JSON.stringify(
      content
    )}, ${JSON.stringify(resourceName)}, config);\nexport const _path = ${
      this.resourePath
    }`;
  } else {
    return content;
  }
};
