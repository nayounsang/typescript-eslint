import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

import * as eslintVisitorKeys from 'eslint-visitor-keys';

export type VisitorKeys = Record<string, readonly string[] | undefined>;

type GetNodeTypeKeys<T extends AST_NODE_TYPES> = Exclude<
  keyof Extract<TSESTree.Node, { type: T }>,
  'loc' | 'parent' | 'range' | 'type'
>;

type KeysDefinedInESLintVisitorKeysCore =
  | AST_NODE_TYPES.ArrayExpression
  | AST_NODE_TYPES.ArrayPattern
  | AST_NODE_TYPES.ArrowFunctionExpression
  | AST_NODE_TYPES.AssignmentExpression
  | AST_NODE_TYPES.AssignmentPattern
  | AST_NODE_TYPES.AwaitExpression
  | AST_NODE_TYPES.BinaryExpression
  | AST_NODE_TYPES.BlockStatement
  | AST_NODE_TYPES.BreakStatement
  | AST_NODE_TYPES.CallExpression
  | AST_NODE_TYPES.CatchClause
  | AST_NODE_TYPES.ChainExpression
  | AST_NODE_TYPES.ClassBody
  | AST_NODE_TYPES.ClassDeclaration
  | AST_NODE_TYPES.ClassExpression
  | AST_NODE_TYPES.ConditionalExpression
  | AST_NODE_TYPES.ContinueStatement
  | AST_NODE_TYPES.DebuggerStatement
  | AST_NODE_TYPES.DoWhileStatement
  | AST_NODE_TYPES.EmptyStatement
  | AST_NODE_TYPES.ExportAllDeclaration
  | AST_NODE_TYPES.ExportDefaultDeclaration
  | AST_NODE_TYPES.ExportNamedDeclaration
  | AST_NODE_TYPES.ExportSpecifier
  | AST_NODE_TYPES.ExpressionStatement
  | AST_NODE_TYPES.ForInStatement
  | AST_NODE_TYPES.ForOfStatement
  | AST_NODE_TYPES.ForStatement
  | AST_NODE_TYPES.FunctionDeclaration
  | AST_NODE_TYPES.FunctionExpression
  | AST_NODE_TYPES.Identifier
  | AST_NODE_TYPES.IfStatement
  | AST_NODE_TYPES.ImportDeclaration
  | AST_NODE_TYPES.ImportDefaultSpecifier
  | AST_NODE_TYPES.ImportExpression
  | AST_NODE_TYPES.ImportNamespaceSpecifier
  | AST_NODE_TYPES.ImportSpecifier
  | AST_NODE_TYPES.JSXAttribute
  | AST_NODE_TYPES.JSXClosingElement
  | AST_NODE_TYPES.JSXClosingFragment
  | AST_NODE_TYPES.JSXElement
  | AST_NODE_TYPES.JSXEmptyExpression
  | AST_NODE_TYPES.JSXExpressionContainer
  | AST_NODE_TYPES.JSXFragment
  | AST_NODE_TYPES.JSXIdentifier
  | AST_NODE_TYPES.JSXMemberExpression
  | AST_NODE_TYPES.JSXNamespacedName
  | AST_NODE_TYPES.JSXOpeningElement
  | AST_NODE_TYPES.JSXOpeningFragment
  | AST_NODE_TYPES.JSXSpreadAttribute
  | AST_NODE_TYPES.JSXText
  | AST_NODE_TYPES.LabeledStatement
  | AST_NODE_TYPES.Literal
  | AST_NODE_TYPES.LogicalExpression
  | AST_NODE_TYPES.MemberExpression
  | AST_NODE_TYPES.MetaProperty
  | AST_NODE_TYPES.MethodDefinition
  | AST_NODE_TYPES.NewExpression
  | AST_NODE_TYPES.ObjectExpression
  | AST_NODE_TYPES.ObjectPattern
  | AST_NODE_TYPES.PrivateIdentifier
  | AST_NODE_TYPES.Program
  | AST_NODE_TYPES.Property
  | AST_NODE_TYPES.PropertyDefinition
  | AST_NODE_TYPES.RestElement
  | AST_NODE_TYPES.ReturnStatement
  | AST_NODE_TYPES.SequenceExpression
  | AST_NODE_TYPES.SpreadElement
  | AST_NODE_TYPES.StaticBlock
  | AST_NODE_TYPES.Super
  | AST_NODE_TYPES.SwitchCase
  | AST_NODE_TYPES.SwitchStatement
  | AST_NODE_TYPES.TaggedTemplateExpression
  | AST_NODE_TYPES.TemplateElement
  | AST_NODE_TYPES.TemplateLiteral
  | AST_NODE_TYPES.ThisExpression
  | AST_NODE_TYPES.ThrowStatement
  | AST_NODE_TYPES.TryStatement
  | AST_NODE_TYPES.UnaryExpression
  | AST_NODE_TYPES.UpdateExpression
  | AST_NODE_TYPES.VariableDeclaration
  | AST_NODE_TYPES.VariableDeclarator
  | AST_NODE_TYPES.WhileStatement
  | AST_NODE_TYPES.WithStatement
  | AST_NODE_TYPES.YieldExpression;

// strictly type the arrays of keys provided to make sure we keep this config in sync with the type defs
type AdditionalKeys = {
  // optionally allow keys for all nodes defined in `eslint-visitor-keys`
  readonly [T in KeysDefinedInESLintVisitorKeysCore]?: readonly GetNodeTypeKeys<T>[];
} & {
  // require keys for all nodes NOT defined in `eslint-visitor-keys`
  readonly [T in Exclude<
    AST_NODE_TYPES,
    KeysDefinedInESLintVisitorKeysCore
  >]: readonly GetNodeTypeKeys<T>[];
};

/*
 ********************************** IMPORTANT NOTE ********************************
 *                                                                                *
 * The key arrays should be sorted in the order in which you would want to visit  *
 * the child keys.                                                                *
 *                                                                                *
 *                        DO NOT SORT THEM ALPHABETICALLY!                        *
 *                                                                                *
 * They should be sorted in the order that they appear in the source code.        *
 * For example:                                                                   *
 *                                                                                *
 * class Foo extends Bar { prop: 1 }                                              *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ClassDeclaration                             *
 *       ^^^ id      ^^^ superClass                                               *
 *                       ^^^^^^^^^^^ body                                         *
 *                                                                                *
 * It would be incorrect to provide the visitor keys ['body', 'id', 'superClass'] *
 * because the body comes AFTER everything else in the source code.               *
 * Instead the correct ordering would be ['id', 'superClass', 'body'].            *
 *                                                                                *
 **********************************************************************************
 */

const SharedVisitorKeys = (() => {
  const FunctionType = ['typeParameters', 'params', 'returnType'] as const;
  const AnonymousFunction = [...FunctionType, 'body'] as const;
  const AbstractPropertyDefinition = [
    'decorators',
    'key',
    'typeAnnotation',
  ] as const;

  return {
    AbstractPropertyDefinition: ['decorators', 'key', 'typeAnnotation'],
    AnonymousFunction,
    AsExpression: ['expression', 'typeAnnotation'],
    ClassDeclaration: [
      'decorators',
      'id',
      'typeParameters',
      'superClass',
      'superTypeArguments',
      'implements',
      'body',
    ],
    Function: ['id', ...AnonymousFunction],
    FunctionType,
    PropertyDefinition: [...AbstractPropertyDefinition, 'value'],
  } as const;
})();

const additionalKeys: AdditionalKeys = {
  AccessorProperty: SharedVisitorKeys.PropertyDefinition,
  ArrayPattern: ['decorators', 'elements', 'typeAnnotation'],
  ArrowFunctionExpression: SharedVisitorKeys.AnonymousFunction,
  AssignmentPattern: ['decorators', 'left', 'right', 'typeAnnotation'],
  CallExpression: ['callee', 'typeArguments', 'arguments'],
  ClassDeclaration: SharedVisitorKeys.ClassDeclaration,
  ClassExpression: SharedVisitorKeys.ClassDeclaration,
  Decorator: ['expression'],
  ExportAllDeclaration: ['exported', 'source', 'attributes'],
  ExportNamedDeclaration: ['declaration', 'specifiers', 'source', 'attributes'],
  FunctionDeclaration: SharedVisitorKeys.Function,
  FunctionExpression: SharedVisitorKeys.Function,
  Identifier: ['decorators', 'typeAnnotation'],
  ImportAttribute: ['key', 'value'],
  ImportDeclaration: ['specifiers', 'source', 'attributes'],
  ImportExpression: ['source', 'options'],
  JSXClosingFragment: [],
  JSXOpeningElement: ['name', 'typeArguments', 'attributes'],
  JSXOpeningFragment: [],
  JSXSpreadChild: ['expression'],
  MethodDefinition: ['decorators', 'key', 'value'],
  NewExpression: ['callee', 'typeArguments', 'arguments'],
  ObjectPattern: ['decorators', 'properties', 'typeAnnotation'],
  PropertyDefinition: SharedVisitorKeys.PropertyDefinition,
  RestElement: ['decorators', 'argument', 'typeAnnotation'],
  StaticBlock: ['body'],
  TaggedTemplateExpression: ['tag', 'typeArguments', 'quasi'],
  TSAbstractAccessorProperty: SharedVisitorKeys.AbstractPropertyDefinition,
  TSAbstractKeyword: [],
  TSAbstractMethodDefinition: ['key', 'value'],
  TSAbstractPropertyDefinition: SharedVisitorKeys.AbstractPropertyDefinition,
  TSAnyKeyword: [],
  TSArrayType: ['elementType'],
  TSAsExpression: SharedVisitorKeys.AsExpression,
  TSAsyncKeyword: [],
  TSBigIntKeyword: [],
  TSBooleanKeyword: [],
  TSCallSignatureDeclaration: SharedVisitorKeys.FunctionType,
  TSClassImplements: ['expression', 'typeArguments'],
  TSConditionalType: ['checkType', 'extendsType', 'trueType', 'falseType'],
  TSConstructorType: SharedVisitorKeys.FunctionType,
  TSConstructSignatureDeclaration: SharedVisitorKeys.FunctionType,
  TSDeclareFunction: SharedVisitorKeys.Function,
  TSDeclareKeyword: [],
  TSEmptyBodyFunctionExpression: ['id', ...SharedVisitorKeys.FunctionType],
  TSEnumBody: ['members'],
  TSEnumDeclaration: ['id', 'body'],
  TSEnumMember: ['id', 'initializer'],
  TSExportAssignment: ['expression'],
  TSExportKeyword: [],
  TSExternalModuleReference: ['expression'],
  TSFunctionType: SharedVisitorKeys.FunctionType,
  TSImportEqualsDeclaration: ['id', 'moduleReference'],
  TSImportType: ['argument', 'options', 'qualifier', 'typeArguments'],
  TSIndexedAccessType: ['objectType', 'indexType'],
  TSIndexSignature: ['parameters', 'typeAnnotation'],
  TSInferType: ['typeParameter'],
  TSInstantiationExpression: ['expression', 'typeArguments'],
  TSInterfaceBody: ['body'],
  TSInterfaceDeclaration: ['id', 'typeParameters', 'extends', 'body'],
  TSInterfaceHeritage: ['expression', 'typeArguments'],
  TSIntersectionType: ['types'],
  TSIntrinsicKeyword: [],
  TSLiteralType: ['literal'],
  TSMappedType: ['key', 'constraint', 'nameType', 'typeAnnotation'],
  TSMethodSignature: ['key', 'typeParameters', 'params', 'returnType'],
  TSModuleBlock: ['body'],
  TSModuleDeclaration: ['id', 'body'],
  TSNamedTupleMember: ['label', 'elementType'],
  TSNamespaceExportDeclaration: ['id'],
  TSNeverKeyword: [],
  TSNonNullExpression: ['expression'],
  TSNullKeyword: [],
  TSNumberKeyword: [],
  TSObjectKeyword: [],
  TSOptionalType: ['typeAnnotation'],
  TSParameterProperty: ['decorators', 'parameter'],
  TSPrivateKeyword: [],
  TSPropertySignature: ['key', 'typeAnnotation'],
  TSProtectedKeyword: [],
  TSPublicKeyword: [],
  TSQualifiedName: ['left', 'right'],
  TSReadonlyKeyword: [],
  TSRestType: ['typeAnnotation'],
  TSSatisfiesExpression: SharedVisitorKeys.AsExpression,
  TSStaticKeyword: [],
  TSStringKeyword: [],
  TSSymbolKeyword: [],
  TSTemplateLiteralType: ['quasis', 'types'],
  TSThisType: [],
  TSTupleType: ['elementTypes'],
  TSTypeAliasDeclaration: ['id', 'typeParameters', 'typeAnnotation'],
  TSTypeAnnotation: ['typeAnnotation'],
  TSTypeAssertion: ['typeAnnotation', 'expression'],
  TSTypeLiteral: ['members'],
  TSTypeOperator: ['typeAnnotation'],
  TSTypeParameter: ['name', 'constraint', 'default'],
  TSTypeParameterDeclaration: ['params'],
  TSTypeParameterInstantiation: ['params'],
  TSTypePredicate: ['parameterName', 'typeAnnotation'],
  TSTypeQuery: ['exprName', 'typeArguments'],
  TSTypeReference: ['typeName', 'typeArguments'],
  TSUndefinedKeyword: [],
  TSUnionType: ['types'],
  TSUnknownKeyword: [],
  TSVoidKeyword: [],
};

export const visitorKeys: VisitorKeys =
  eslintVisitorKeys.unionWith(additionalKeys);
