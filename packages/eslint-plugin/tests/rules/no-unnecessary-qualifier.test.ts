import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-unnecessary-qualifier';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('no-unnecessary-qualifier', rule, {
  valid: [
    `
namespace X {
  export type T = number;
}

namespace Y {
  export const x: X.T = 3;
}
    `,
    `
namespace A {}
namespace A.B {
  export type Z = 1;
}
    `,
    `
enum A {
  X,
  Y,
}

enum B {
  Z = A.X,
}
    `,
    `
namespace X {
  export type T = number;
  namespace Y {
    type T = string;
    const x: X.T = 0;
  }
}
    `,
    'const x: A.B = 3;',
    `
namespace X {
  const z = X.y;
}
    `,
    `
enum Foo {
  One,
}

namespace Foo {
  export function bar() {
    return Foo.One;
  }
}
    `,
    `
namespace Foo {
  export enum Foo {
    One,
  }
}

namespace Foo {
  export function bar() {
    return Foo.One;
  }
}
    `,
  ],

  invalid: [
    {
      code: `
namespace A {
  export type B = number;
  const x: A.B = 3;
}
      `,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      output: `
namespace A {
  export type B = number;
  const x: B = 3;
}
      `,
    },
    {
      code: `
namespace A {
  export const x = 3;
  export const y = A.x;
}
      `,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      output: `
namespace A {
  export const x = 3;
  export const y = x;
}
      `,
    },
    {
      code: `
namespace A {
  export type T = number;
  export namespace B {
    const x: A.T = 3;
  }
}
      `,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      output: `
namespace A {
  export type T = number;
  export namespace B {
    const x: T = 3;
  }
}
      `,
    },
    {
      code: `
namespace A {
  export namespace B {
    export type T = number;
    const x: A.B.T = 3;
  }
}
      `,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: AST_NODE_TYPES.TSQualifiedName,
        },
      ],
      output: `
namespace A {
  export namespace B {
    export type T = number;
    const x: T = 3;
  }
}
      `,
    },
    {
      code: `
namespace A {
  export namespace B.C {
    export type D = number;
    const x: A.B.C.D = 3;
  }
}
      `,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: AST_NODE_TYPES.TSQualifiedName,
        },
      ],
      output: `
namespace A {
  export namespace B.C {
    export type D = number;
    const x: D = 3;
  }
}
      `,
    },
    {
      code: `
namespace A {
  export namespace B {
    export const x = 3;
    const y = A.B.x;
  }
}
      `,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      output: `
namespace A {
  export namespace B {
    export const x = 3;
    const y = x;
  }
}
      `,
    },
    {
      code: `
enum A {
  B,
  C = A.B,
}
      `,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      output: `
enum A {
  B,
  C = B,
}
      `,
    },
    {
      code: `
namespace Foo {
  export enum A {
    B,
    C = Foo.A.B,
  }
}
      `,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      output: `
namespace Foo {
  export enum A {
    B,
    C = B,
  }
}
      `,
    },
    {
      code: `
import * as Foo from './foo';
declare module './foo' {
  const x: Foo.T = 3;
}
      `,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      output: `
import * as Foo from './foo';
declare module './foo' {
  const x: T = 3;
}
      `,
    },
  ],
});
