import { join } from 'node:path';

import * as parser from '../../src';

const PROJECT_DIR = join(__dirname, '..', 'fixtures', 'projectTrue');

const config = {
  project: true,
  tsconfigRootDir: PROJECT_DIR,
} satisfies Partial<parser.TSESTreeOptions>;

describe(parser.parseAndGenerateServices, () => {
  describe('when project is true', () => {
    it('finds a parent project when it exists in the project', () => {
      const result = parser.parseAndGenerateServices('const a = true', {
        ...config,
        filePath: join(PROJECT_DIR, 'nested', 'deep', 'included.ts'),
      });

      expect(result).toStrictEqual({
        ast: expect.any(Object),
        services: expect.any(Object),
      });
    });

    it('finds a sibling project when it exists in the project', () => {
      const result = parser.parseAndGenerateServices('const a = true', {
        ...config,
        filePath: join(PROJECT_DIR, 'nested', 'included.ts'),
      });

      expect(result).toStrictEqual({
        ast: expect.any(Object),
        services: expect.any(Object),
      });
    });

    it('throws an error when a parent project does not exist', () => {
      expect(() =>
        parser.parseAndGenerateServices('const a = true', {
          ...config,
          filePath: join(PROJECT_DIR, 'notIncluded.ts'),
        }),
      ).toThrow(
        /project was set to `true` but couldn't find any tsconfig.json relative to '.+[/\\]tests[/\\]fixtures[/\\]projectTrue[/\\]notIncluded.ts' within '.+[/\\]tests[/\\]fixtures[/\\]projectTrue'./,
      );
    });
  });
});
