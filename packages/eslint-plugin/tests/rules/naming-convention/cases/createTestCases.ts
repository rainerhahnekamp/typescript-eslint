import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import { RuleTester } from '@typescript-eslint/rule-tester';

import type {
  MessageIds,
  Options,
} from '../../../../src/rules/naming-convention';
import rule from '../../../../src/rules/naming-convention';
import type {
  PredefinedFormatsString,
  Selector,
} from '../../../../src/rules/naming-convention-utils';
import { selectorTypeToMessageString } from '../../../../src/rules/naming-convention-utils';

export const formatTestNames: Readonly<
  Record<PredefinedFormatsString, Record<'invalid' | 'valid', string[]>>
> = {
  camelCase: {
    valid: ['strictCamelCase', 'lower', 'camelCaseUNSTRICT'],
    invalid: ['snake_case', 'UPPER_CASE', 'UPPER', 'StrictPascalCase'],
  },
  strictCamelCase: {
    valid: ['strictCamelCase', 'lower'],
    invalid: [
      'snake_case',
      'UPPER_CASE',
      'UPPER',
      'StrictPascalCase',
      'camelCaseUNSTRICT',
    ],
  },
  PascalCase: {
    valid: [
      'StrictPascalCase',
      'Pascal',
      'I18n',
      'PascalCaseUNSTRICT',
      'UPPER',
    ],
    invalid: ['snake_case', 'UPPER_CASE', 'strictCamelCase'],
  },
  StrictPascalCase: {
    valid: ['StrictPascalCase', 'Pascal', 'I18n'],
    invalid: [
      'snake_case',
      'UPPER_CASE',
      'UPPER',
      'strictCamelCase',
      'PascalCaseUNSTRICT',
    ],
  },
  UPPER_CASE: {
    valid: ['UPPER_CASE', 'UPPER'],
    invalid: [
      'lower',
      'snake_case',
      'SNAKE_case_UNSTRICT',
      'strictCamelCase',
      'StrictPascalCase',
    ],
  },
  snake_case: {
    valid: ['snake_case', 'lower'],
    invalid: [
      'UPPER_CASE',
      'SNAKE_case_UNSTRICT',
      'strictCamelCase',
      'StrictPascalCase',
    ],
  },
};

const REPLACE_REGEX = /%/g;
// filter to not match `[iI]gnored`
const IGNORED_FILTER = {
  match: false,
  regex: /.gnored/.source,
};

type Cases = { code: string[]; options: Omit<Options[0], 'format'> }[];

export function createTestCases(cases: Cases): void {
  const createValidTestCases = (): ValidTestCase<Options>[] =>
    cases.flatMap(test =>
      Object.entries(formatTestNames).flatMap(([formatLoose, names]) =>
        names.valid.flatMap(name => {
          const format = [formatLoose as PredefinedFormatsString];
          const createCase = (
            preparedName: string,
            options: Selector,
          ): ValidTestCase<Options> => ({
            options: [{ ...options, filter: IGNORED_FILTER }],
            code: `// ${JSON.stringify(options)}\n${test.code
              .map(code => code.replaceAll(REPLACE_REGEX, preparedName))
              .join('\n')}`,
          });

          return [
            createCase(name, { ...test.options, format }),

            // leadingUnderscore
            createCase(name, {
              ...test.options,
              format,
              leadingUnderscore: 'forbid',
            }),
            createCase(`_${name}`, {
              ...test.options,
              format,
              leadingUnderscore: 'require',
            }),
            createCase(`__${name}`, {
              ...test.options,
              format,
              leadingUnderscore: 'requireDouble',
            }),
            createCase(`_${name}`, {
              ...test.options,
              format,
              leadingUnderscore: 'allow',
            }),
            createCase(name, {
              ...test.options,
              format,
              leadingUnderscore: 'allow',
            }),
            createCase(`__${name}`, {
              ...test.options,
              format,
              leadingUnderscore: 'allowDouble',
            }),
            createCase(name, {
              ...test.options,
              format,
              leadingUnderscore: 'allowDouble',
            }),
            createCase(`_${name}`, {
              ...test.options,
              format,
              leadingUnderscore: 'allowSingleOrDouble',
            }),
            createCase(name, {
              ...test.options,
              format,
              leadingUnderscore: 'allowSingleOrDouble',
            }),
            createCase(`__${name}`, {
              ...test.options,
              format,
              leadingUnderscore: 'allowSingleOrDouble',
            }),

            // trailingUnderscore
            createCase(name, {
              ...test.options,
              format,
              trailingUnderscore: 'forbid',
            }),
            createCase(`${name}_`, {
              ...test.options,
              format,
              trailingUnderscore: 'require',
            }),
            createCase(`${name}__`, {
              ...test.options,
              format,
              trailingUnderscore: 'requireDouble',
            }),
            createCase(`${name}_`, {
              ...test.options,
              format,
              trailingUnderscore: 'allow',
            }),
            createCase(name, {
              ...test.options,
              format,
              trailingUnderscore: 'allow',
            }),
            createCase(`${name}__`, {
              ...test.options,
              format,
              trailingUnderscore: 'allowDouble',
            }),
            createCase(name, {
              ...test.options,
              format,
              trailingUnderscore: 'allowDouble',
            }),
            createCase(`${name}_`, {
              ...test.options,
              format,
              trailingUnderscore: 'allowSingleOrDouble',
            }),
            createCase(name, {
              ...test.options,
              format,
              trailingUnderscore: 'allowSingleOrDouble',
            }),
            createCase(`${name}__`, {
              ...test.options,
              format,
              trailingUnderscore: 'allowSingleOrDouble',
            }),

            // prefix
            createCase(`MyPrefix${name}`, {
              ...test.options,
              format,
              prefix: ['MyPrefix'],
            }),
            createCase(`MyPrefix2${name}`, {
              ...test.options,
              format,
              prefix: ['MyPrefix1', 'MyPrefix2'],
            }),

            // suffix
            createCase(`${name}MySuffix`, {
              ...test.options,
              format,
              suffix: ['MySuffix'],
            }),
            createCase(`${name}MySuffix2`, {
              ...test.options,
              format,
              suffix: ['MySuffix1', 'MySuffix2'],
            }),
          ];
        }),
      ),
    );

  function createInvalidTestCases(): InvalidTestCase<MessageIds, Options>[] {
    const newCases: InvalidTestCase<MessageIds, Options>[] = [];

    for (const test of cases) {
      for (const [formatLoose, names] of Object.entries(formatTestNames)) {
        const format = [formatLoose as PredefinedFormatsString];
        for (const name of names.invalid) {
          const createCase = (
            preparedName: string,
            options: Selector,
            messageId: MessageIds,
            data: Record<string, unknown> = {},
          ): InvalidTestCase<MessageIds, Options> => {
            const selectors = Array.isArray(test.options.selector)
              ? test.options.selector
              : [test.options.selector];
            const errorsTemplate = selectors.map(selector => ({
              messageId,
              ...(selector !== 'default' &&
              selector !== 'variableLike' &&
              selector !== 'memberLike' &&
              selector !== 'typeLike' &&
              selector !== 'property' &&
              selector !== 'method' &&
              selector !== 'accessor'
                ? {
                    data: {
                      type: selectorTypeToMessageString(selector),
                      name: preparedName,
                      ...data,
                    },
                  }
                : // meta-types will use the correct selector, so don't assert on data shape
                  {}),
            }));

            const errors: {
              data?: { type: string; name: string };
              messageId: MessageIds;
            }[] = [];
            test.code.forEach(() => errors.push(...errorsTemplate));

            return {
              options: [
                {
                  ...options,
                  filter: IGNORED_FILTER,
                },
              ],
              code: `// ${JSON.stringify(options)}\n${test.code
                .map(code => code.replaceAll(REPLACE_REGEX, preparedName))
                .join('\n')}`,
              errors: errors,
            };
          };

          const prefixSingle = ['MyPrefix'];
          const prefixMulti = ['MyPrefix1', 'MyPrefix2'];
          const suffixSingle = ['MySuffix'];
          const suffixMulti = ['MySuffix1', 'MySuffix2'];

          newCases.push(
            createCase(
              name,
              {
                ...test.options,
                format,
              },
              'doesNotMatchFormat',
              { formats: format.join(', ') },
            ),

            // leadingUnderscore
            createCase(
              `_${name}`,
              {
                ...test.options,
                format,
                leadingUnderscore: 'forbid',
              },
              'unexpectedUnderscore',
              { position: 'leading' },
            ),
            createCase(
              name,
              {
                ...test.options,
                format,
                leadingUnderscore: 'require',
              },
              'missingUnderscore',
              { position: 'leading', count: 'one' },
            ),
            createCase(
              name,
              {
                ...test.options,
                format,
                leadingUnderscore: 'requireDouble',
              },
              'missingUnderscore',
              { position: 'leading', count: 'two' },
            ),
            createCase(
              `_${name}`,
              {
                ...test.options,
                format,
                leadingUnderscore: 'requireDouble',
              },
              'missingUnderscore',
              { position: 'leading', count: 'two' },
            ),

            // trailingUnderscore
            createCase(
              `${name}_`,
              {
                ...test.options,
                format,
                trailingUnderscore: 'forbid',
              },
              'unexpectedUnderscore',
              { position: 'trailing' },
            ),
            createCase(
              name,
              {
                ...test.options,
                format,
                trailingUnderscore: 'require',
              },
              'missingUnderscore',
              { position: 'trailing', count: 'one' },
            ),
            createCase(
              name,
              {
                ...test.options,
                format,
                trailingUnderscore: 'requireDouble',
              },
              'missingUnderscore',
              { position: 'trailing', count: 'two' },
            ),
            createCase(
              `${name}_`,
              {
                ...test.options,
                format,
                trailingUnderscore: 'requireDouble',
              },
              'missingUnderscore',
              { position: 'trailing', count: 'two' },
            ),

            // prefix
            createCase(
              name,
              {
                ...test.options,
                format,
                prefix: prefixSingle,
              },
              'missingAffix',
              { position: 'prefix', affixes: prefixSingle.join(', ') },
            ),
            createCase(
              name,
              {
                ...test.options,
                format,
                prefix: prefixMulti,
              },
              'missingAffix',
              {
                position: 'prefix',
                affixes: prefixMulti.join(', '),
              },
            ),

            // suffix
            createCase(
              name,
              {
                ...test.options,
                format,
                suffix: suffixSingle,
              },
              'missingAffix',
              { position: 'suffix', affixes: suffixSingle.join(', ') },
            ),
            createCase(
              name,
              {
                ...test.options,
                format,
                suffix: suffixMulti,
              },
              'missingAffix',
              {
                position: 'suffix',
                affixes: suffixMulti.join(', '),
              },
            ),
          );
        }
      }
    }

    return newCases;
  }

  const ruleTester = new RuleTester();

  ruleTester.run('naming-convention', rule, {
    invalid: createInvalidTestCases(),
    valid: createValidTestCases(),
  });
}
