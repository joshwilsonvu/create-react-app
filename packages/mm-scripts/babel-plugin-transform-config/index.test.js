'use strict';

const babel = require('@babel/core');
const plugin = require('./index');

describe('transform', () => {
  let original, transformed, expected;
  beforeAll(() => {
    original = `
      const config = {
        port: 8080,
        modules: [
          {
            module: "helloworld",
            position: "top_left",
            config: {
              text: "Hello world"
            }
          },
          {
            module: "MMM-clock",
            position: "top_right"
          }
        ]
      };
      export default config;
    `;
    transformed = babel.transformSync(original, {
      plugins: [plugin],
      compact: false,
    }).code;
    expected = babel.transformSync(
      `
      const config = {
        port: 8080,
        modules: [
          {
            module: "helloworld",
            _import: () => import("modules/default/helloworld"),
            position: "top_left",
            config: {
              text: "Hello world"
            }
          },
          {
            module: "MMM-clock",
            _import: () => import("modules/MMM-clock"),
            position: "top_right"
          }
        ]
      };
      export default config;
      `,
      {
        plugins: [require('@babel/plugin-syntax-dynamic-import')],
        compact: false,
      }
    ).code;
  });

  it('contains _import', () => {
    expect(transformed).toContain('_import');
  });

  it('matches', () => {
    expect(transformed).toStrictEqual(expected);
  });
});
