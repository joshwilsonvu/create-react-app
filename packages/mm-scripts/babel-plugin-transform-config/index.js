/*
 * This Babel plugin adds imports to the config file, so that the MagicMirror
 * core component can find all of its dependencies correctly.
 * Relies on Webpack "modules" alias and DirectoryNamedWebpackPlugin
 *
 * Transforms this:
 * {
 *   ...
 *   modules: [
 *     {
 *       module: "module-name",
 *       ...otherProperties: "anything"
 *     },
 *     ...
 *   ],
 *   ...
 * }
 * into this:
 * {
 *   ...
 *   modules: [
 *     {
 *       module: "module-name",
 *       ...otherProperties: "anything",
 *   ==> _import: () => import("modules/module-name") <==
 *     },
 *     ...
 *   ],
 *   ...
 * }
 */
'use strict';
module.exports = function(babel) {
  const t = babel.types;
  t.isIdentifierOrLiteral = (node, name) =>
    t.isIdentifier(node, { name }) || t.isStringLiteral(node, { value: name });
  const buildImport = path =>
    t.objectProperty(
      t.identifier('_import'),
      t.arrowFunctionExpression(
        [], // params
        t.callExpression(t.import(), [t.stringLiteral(path)])
      )
    );
  return {
    visitor: {
      ObjectProperty(path) {
        // find the "modules" property of the config object with an array value
        if (
          !path.node.computed &&
          t.isIdentifierOrLiteral(path.node.key, 'modules') &&
          t.isArrayExpression(path.node.value)
        ) {
          const elements = path.get('value.elements'); // get the array elements
          for (const element of elements) {
            // iterate over the objects in the array
            if (element.isObjectExpression()) {
              const properties = element.get('properties');
              for (const property of properties) {
                // find the "module" property of the object
                if (
                  !property.node.computed &&
                  t.isIdentifierOrLiteral(property.node.key, 'module') &&
                  t.isStringLiteral(property.node.value)
                ) {
                  let moduleName = property.node.value.value; // literal value of property value
                  if (defaultModules.indexOf(moduleName) !== -1) {
                    moduleName = `default/${moduleName}`;
                  }
                  moduleName = `modules/${moduleName}`;
                  // insert an _import property with a lazy dynamic import as its value
                  const _import = buildImport(moduleName);
                  property.insertAfter(_import);
                  break; // don't search through other properties
                }
              }
            }
          }
        }
      },
    },
  };
};

// preface default/ if one of these modules is listed
const defaultModules = [
  'alert',
  'calendar',
  'clock',
  'compliments',
  'currentweather',
  'helloworld',
  'newsfeed',
  'weatherforecast',
  'updatenotification',
  'weather',
];
