import {
  DEPRECATED_RN_MODULE_REPLACEMENTS,
  HEAVY_ARRAY_METHODS,
  INTERACTIVE_EVENT_PROP_PATTERN,
  KEYEXTRACTOR_LIST_COMPONENTS,
  LEGACY_EXPO_PACKAGE_REPLACEMENTS,
  LEGACY_SHADOW_STYLE_PROPERTIES,
  LIST_ITEM_NAME_SUFFIXES,
  MINIMUM_CHAIN_DEPTH_FOR_HEAVY_COMPUTATION,
  RAW_TEXT_PREVIEW_MAX_CHARS,
  REACT_NATIVE_LIST_COMPONENTS,
  REACT_NATIVE_TEXT_COMPONENTS,
} from "../constants.js";
import {
  findJsxAttribute,
  hasDirective,
  hasJsxAttribute,
  isMemberProperty,
  walkAst,
} from "../helpers.js";
import type { EsTreeNode, Rule, RuleContext } from "../types.js";

const resolveJsxElementName = (openingElement: EsTreeNode): string | null => {
  const elementName = openingElement?.name;
  if (!elementName) return null;
  if (elementName.type === "JSXIdentifier") return elementName.name;
  if (elementName.type === "JSXMemberExpression")
    return elementName.property?.name ?? null;
  return null;
};

const truncateText = (text: string): string =>
  text.length > RAW_TEXT_PREVIEW_MAX_CHARS
    ? `${text.slice(0, RAW_TEXT_PREVIEW_MAX_CHARS)}...`
    : text;

const isRawTextContent = (child: EsTreeNode): boolean => {
  if (child.type === "JSXText") return Boolean(child.value?.trim());
  if (child.type !== "JSXExpressionContainer" || !child.expression)
    return false;

  const expression = child.expression;
  return (
    (expression.type === "Literal" &&
      (typeof expression.value === "string" ||
        typeof expression.value === "number")) ||
    expression.type === "TemplateLiteral"
  );
};

const getRawTextDescription = (child: EsTreeNode): string => {
  if (child.type === "JSXText") {
    return `"${truncateText(child.value.trim())}"`;
  }

  if (child.type === "JSXExpressionContainer" && child.expression) {
    const expression = child.expression;
    if (expression.type === "Literal" && typeof expression.value === "string") {
      return `"${truncateText(expression.value)}"`;
    }
    if (expression.type === "Literal" && typeof expression.value === "number") {
      return `{${expression.value}}`;
    }
    if (expression.type === "TemplateLiteral") return "template literal";
  }

  return "text content";
};

export const rnNoRawText: Rule = {
  create: (context: RuleContext) => {
    let isDomComponentFile = false;

    return {
      Program(programNode: EsTreeNode) {
        isDomComponentFile = hasDirective(programNode, "use dom");
      },
      JSXElement(node: EsTreeNode) {
        if (isDomComponentFile) return;

        const elementName = resolveJsxElementName(node.openingElement);
        if (elementName && REACT_NATIVE_TEXT_COMPONENTS.has(elementName))
          return;

        for (const child of node.children ?? []) {
          if (!isRawTextContent(child)) continue;

          context.report({
            node: child,
            message: `Raw ${getRawTextDescription(child)} outside a <Text> component — this will crash on React Native`,
          });
        }
      },
    };
  },
};

export const rnNoDeprecatedModules: Rule = {
  create: (context: RuleContext) => ({
    ImportDeclaration(node: EsTreeNode) {
      if (node.source?.value !== "react-native") return;

      for (const specifier of node.specifiers ?? []) {
        if (specifier.type !== "ImportSpecifier") continue;
        const importedName = specifier.imported?.name;
        if (!importedName) continue;

        const replacement = DEPRECATED_RN_MODULE_REPLACEMENTS[importedName];
        if (!replacement) continue;

        context.report({
          node: specifier,
          message: `"${importedName}" was removed from react-native — use ${replacement} instead`,
        });
      }
    },
  }),
};

export const rnNoLegacyExpoPackages: Rule = {
  create: (context: RuleContext) => ({
    ImportDeclaration(node: EsTreeNode) {
      const source = node.source?.value;
      if (typeof source !== "string") return;

      for (const [packageName, replacement] of Object.entries(
        LEGACY_EXPO_PACKAGE_REPLACEMENTS,
      )) {
        if (source === packageName || source.startsWith(`${packageName}/`)) {
          context.report({
            node,
            message: `"${packageName}" is deprecated — use ${replacement}`,
          });
          return;
        }
      }
    },
  }),
};

export const rnNoDimensionsGet: Rule = {
  create: (context: RuleContext) => ({
    CallExpression(node: EsTreeNode) {
      if (node.callee?.type !== "MemberExpression") return;
      if (
        node.callee.object?.type !== "Identifier" ||
        node.callee.object.name !== "Dimensions"
      )
        return;

      if (isMemberProperty(node.callee, "get")) {
        context.report({
          node,
          message:
            "Dimensions.get() does not update on screen rotation or resize — use useWindowDimensions() for reactive layout",
        });
      }

      if (isMemberProperty(node.callee, "addEventListener")) {
        context.report({
          node,
          message:
            "Dimensions.addEventListener() was removed in React Native 0.72 — use useWindowDimensions() instead",
        });
      }
    },
  }),
};

export const rnNoInlineFlatlistRenderitem: Rule = {
  create: (context: RuleContext) => ({
    JSXAttribute(node: EsTreeNode) {
      if (
        node.name?.type !== "JSXIdentifier" ||
        node.name.name !== "renderItem"
      )
        return;
      if (!node.value || node.value.type !== "JSXExpressionContainer") return;

      const openingElement = node.parent;
      if (!openingElement || openingElement.type !== "JSXOpeningElement")
        return;

      const listComponentName = resolveJsxElementName(openingElement);
      if (
        !listComponentName ||
        !REACT_NATIVE_LIST_COMPONENTS.has(listComponentName)
      )
        return;

      const expression = node.value.expression;
      if (
        expression?.type !== "ArrowFunctionExpression" &&
        expression?.type !== "FunctionExpression"
      )
        return;

      context.report({
        node: expression,
        message: `Inline renderItem on <${listComponentName}> creates a new function reference every render — extract to a named function or wrap in useCallback`,
      });
    },
  }),
};

const reportLegacyShadowProperties = (
  objectExpression: EsTreeNode,
  context: RuleContext,
): void => {
  const legacyShadowPropertyNames: string[] = [];

  for (const property of objectExpression.properties ?? []) {
    if (property.type !== "Property") continue;
    const propertyName =
      property.key?.type === "Identifier" ? property.key.name : null;
    if (propertyName && LEGACY_SHADOW_STYLE_PROPERTIES.has(propertyName)) {
      legacyShadowPropertyNames.push(propertyName);
    }
  }

  if (legacyShadowPropertyNames.length === 0) return;

  const quotedPropertyNames = legacyShadowPropertyNames
    .map((name) => `"${name}"`)
    .join(", ");
  context.report({
    node: objectExpression,
    message: `Legacy shadow style${legacyShadowPropertyNames.length > 1 ? "s" : ""} ${quotedPropertyNames} — use boxShadow for cross-platform shadows on the new architecture`,
  });
};

export const rnNoLegacyShadowStyles: Rule = {
  create: (context: RuleContext) => ({
    JSXAttribute(node: EsTreeNode) {
      if (node.name?.type !== "JSXIdentifier" || node.name.name !== "style")
        return;
      if (node.value?.type !== "JSXExpressionContainer") return;

      const expression = node.value.expression;

      if (expression?.type === "ObjectExpression") {
        reportLegacyShadowProperties(expression, context);
      } else if (expression?.type === "ArrayExpression") {
        for (const element of expression.elements ?? []) {
          if (element?.type === "ObjectExpression") {
            reportLegacyShadowProperties(element, context);
          }
        }
      }
    },
    CallExpression(node: EsTreeNode) {
      if (node.callee?.type !== "MemberExpression") return;
      if (
        node.callee.object?.type !== "Identifier" ||
        node.callee.object.name !== "StyleSheet"
      )
        return;
      if (!isMemberProperty(node.callee, "create")) return;

      const stylesArgument = node.arguments?.[0];
      if (stylesArgument?.type !== "ObjectExpression") return;

      for (const styleDefinition of stylesArgument.properties ?? []) {
        if (styleDefinition.type !== "Property") continue;
        if (styleDefinition.value?.type !== "ObjectExpression") continue;
        reportLegacyShadowProperties(styleDefinition.value, context);
      }
    },
  }),
};

export const rnPreferReanimated: Rule = {
  create: (context: RuleContext) => ({
    ImportDeclaration(node: EsTreeNode) {
      if (node.source?.value !== "react-native") return;

      for (const specifier of node.specifiers ?? []) {
        if (specifier.type !== "ImportSpecifier") continue;
        if (specifier.imported?.name !== "Animated") continue;

        context.report({
          node: specifier,
          message:
            "Animated from react-native runs animations on the JS thread — use react-native-reanimated for performant UI-thread animations",
        });
      }
    },
  }),
};

export const rnNoSingleElementStyleArray: Rule = {
  create: (context: RuleContext) => ({
    JSXAttribute(node: EsTreeNode) {
      const propName =
        node.name?.type === "JSXIdentifier" ? node.name.name : null;
      if (!propName) return;
      if (propName !== "style" && !propName.endsWith("Style")) return;
      if (node.value?.type !== "JSXExpressionContainer") return;

      const expression = node.value.expression;
      if (expression?.type !== "ArrayExpression") return;
      if (expression.elements?.length !== 1) return;

      context.report({
        node: expression,
        message: `Single-element style array on "${propName}" — use ${propName}={value} instead of ${propName}={[value]} to avoid unnecessary array allocation`,
      });
    },
  }),
};

export const rnFlatlistInlineStyle: Rule = {
  create: (context: RuleContext) => ({
    JSXAttribute(node: EsTreeNode) {
      if (
        node.name?.type !== "JSXIdentifier" ||
        node.name.name !== "renderItem"
      )
        return;
      if (!node.value || node.value.type !== "JSXExpressionContainer") return;

      const openingElement = node.parent;
      if (!openingElement || openingElement.type !== "JSXOpeningElement")
        return;

      const listComponentName = resolveJsxElementName(openingElement);
      if (
        !listComponentName ||
        !REACT_NATIVE_LIST_COMPONENTS.has(listComponentName)
      )
        return;

      const renderFunction = node.value.expression;
      if (
        renderFunction?.type !== "ArrowFunctionExpression" &&
        renderFunction?.type !== "FunctionExpression"
      )
        return;

      walkAst(renderFunction.body, (child) => {
        if (child.type !== "JSXAttribute") return;
        if (child.name?.type !== "JSXIdentifier" || child.name.name !== "style")
          return;
        if (child.value?.type !== "JSXExpressionContainer") return;
        if (child.value.expression?.type !== "ObjectExpression") return;

        context.report({
          node: child.value.expression,
          message: `Inline style object in <${listComponentName}> renderItem recreates the style on every render — extract to StyleSheet.create() outside the component`,
        });
      });
    },
  }),
};

export const rnFlatlistMissingKeyextractor: Rule = {
  create: (context: RuleContext) => ({
    JSXOpeningElement(node: EsTreeNode) {
      const componentName = resolveJsxElementName(node);
      if (!componentName || !KEYEXTRACTOR_LIST_COMPONENTS.has(componentName))
        return;
      if (hasJsxAttribute(node.attributes ?? [], "keyExtractor")) return;

      context.report({
        node,
        message: `<${componentName}> is missing a keyExtractor prop — add keyExtractor={(item) => item.id.toString()} to prevent unnecessary re-renders`,
      });
    },
  }),
};

export const rnScrollviewForLongLists: Rule = {
  create: (context: RuleContext) => ({
    JSXElement(node: EsTreeNode) {
      const componentName = resolveJsxElementName(node.openingElement);
      if (componentName !== "ScrollView") return;

      for (const child of node.children ?? []) {
        if (child.type !== "JSXExpressionContainer") continue;
        const expression = child.expression;
        if (!expression || expression.type !== "CallExpression") continue;
        if (expression.callee?.type !== "MemberExpression") continue;
        if (!isMemberProperty(expression.callee, "map")) continue;

        const mappedSource = expression.callee.object;
        if (mappedSource?.type === "ArrayExpression") continue;

        context.report({
          node,
          message:
            "ScrollView with .map() renders all items at once — replace with FlatList to enable virtualization and avoid memory issues on long lists",
        });
        return;
      }
    },
  }),
};

const styleAttributeHasDimensions = (attributes: EsTreeNode[]): boolean => {
  const styleAttr = findJsxAttribute(attributes, "style");
  if (!styleAttr) return false;

  const value = styleAttr.value;
  if (value?.type !== "JSXExpressionContainer") return false;

  const expression = value.expression;
  if (!expression) return false;

  if (expression.type === "ObjectExpression") {
    const propertyNames = new Set(
      (expression.properties ?? [])
        .filter((property: EsTreeNode) => property.type === "Property")
        .map((property: EsTreeNode) =>
          property.key?.type === "Identifier" ? property.key.name : null,
        )
        .filter(Boolean),
    );
    return propertyNames.has("width") && propertyNames.has("height");
  }

  if (expression.type === "MemberExpression" || expression.type === "ArrayExpression") {
    return true;
  }

  return false;
};

export const rnImageMissingDimensions: Rule = {
  create: (context: RuleContext) => ({
    JSXOpeningElement(node: EsTreeNode) {
      const componentName = resolveJsxElementName(node);
      if (componentName !== "Image") return;

      const attributes = node.attributes ?? [];
      const hasWidthProp = hasJsxAttribute(attributes, "width");
      const hasHeightProp = hasJsxAttribute(attributes, "height");
      const hasDimensionsInStyle = styleAttributeHasDimensions(attributes);

      if ((hasWidthProp && hasHeightProp) || hasDimensionsInStyle) return;

      context.report({
        node,
        message:
          "<Image> without explicit width and height causes layout shifts — add width and height to the style prop or as direct props",
      });
    },
  }),
};

export const rnInlineStyleInRender: Rule = {
  create: (context: RuleContext) => {
    let importsStyleSheet = false;

    return {
      ImportDeclaration(node: EsTreeNode) {
        if (node.source?.value !== "react-native") return;
        for (const specifier of node.specifiers ?? []) {
          if (specifier.type === "ImportSpecifier" && specifier.imported?.name === "StyleSheet") {
            importsStyleSheet = true;
          }
        }
      },
      JSXAttribute(node: EsTreeNode) {
        if (!importsStyleSheet) return;
        const propName = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (!propName) return;
        if (propName !== "style" && !propName.endsWith("Style")) return;
        if (node.value?.type !== "JSXExpressionContainer") return;
        if (node.value.expression?.type !== "ObjectExpression") return;

        context.report({
          node: node.value.expression,
          message:
            "Inline style object is recreated on every render — extract to StyleSheet.create() outside the component",
        });
      },
    };
  },
};

const isWrappedInMemo = (node: EsTreeNode): boolean => {
  if (node.type !== "CallExpression") return false;
  if (node.callee?.type === "Identifier" && node.callee.name === "memo") return true;
  return (
    node.callee?.type === "MemberExpression" &&
    node.callee.object?.type === "Identifier" &&
    node.callee.object.name === "React" &&
    node.callee.property?.type === "Identifier" &&
    node.callee.property.name === "memo"
  );
};

const hasListItemNameSuffix = (componentName: string): boolean => {
  for (const suffix of LIST_ITEM_NAME_SUFFIXES) {
    if (componentName.endsWith(suffix) && componentName.length > suffix.length) return true;
  }
  return false;
};

export const rnMissingMemoOnListItem: Rule = {
  create: (context: RuleContext) => ({
    ExportNamedDeclaration(node: EsTreeNode) {
      const declaration = node.declaration;
      if (!declaration) return;

      if (declaration.type === "VariableDeclaration") {
        for (const declarator of declaration.declarations ?? []) {
          if (declarator.id?.type !== "Identifier") continue;
          const componentName = declarator.id.name;
          if (!hasListItemNameSuffix(componentName)) continue;

          const initExpression = declarator.init;
          if (!initExpression) continue;
          if (isWrappedInMemo(initExpression)) continue;

          if (
            initExpression.type === "ArrowFunctionExpression" ||
            initExpression.type === "FunctionExpression"
          ) {
            context.report({
              node: declarator,
              message: `${componentName} renders inside lists but is not wrapped in React.memo() — wrap to prevent re-renders when parent updates`,
            });
          }
        }
      }

      if (declaration.type === "FunctionDeclaration") {
        const componentName = declaration.id?.name;
        if (!componentName || !hasListItemNameSuffix(componentName)) return;

        context.report({
          node: declaration,
          message: `${componentName} renders inside lists but is not wrapped in React.memo() — wrap to prevent re-renders when parent updates`,
        });
      }
    },
  }),
};

const countArrayMethodChainDepth = (node: EsTreeNode): number => {
  if (node.type !== "CallExpression") return 0;
  if (node.callee?.type !== "MemberExpression") return 0;
  const methodName =
    node.callee.property?.type === "Identifier" ? node.callee.property.name : null;
  if (!methodName || !HEAVY_ARRAY_METHODS.has(methodName)) return 0;
  return 1 + countArrayMethodChainDepth(node.callee.object);
};

const getArrayMethodChainRoot = (node: EsTreeNode): EsTreeNode | null => {
  if (node.type !== "CallExpression") return null;
  if (node.callee?.type !== "MemberExpression") return null;
  const source = node.callee.object;
  if (source.type === "Identifier" || source.type === "MemberExpression") {
    const deeper = getArrayMethodChainRoot(source);
    return deeper ?? source;
  }
  return getArrayMethodChainRoot(source);
};

export const rnHeavyComputationInRender: Rule = {
  create: (context: RuleContext) => ({
    VariableDeclarator(node: EsTreeNode) {
      const initExpression = node.init;
      if (!initExpression) return;

      const chainDepth = countArrayMethodChainDepth(initExpression);
      if (chainDepth < MINIMUM_CHAIN_DEPTH_FOR_HEAVY_COMPUTATION) return;

      const rootSource = getArrayMethodChainRoot(initExpression);
      if (!rootSource) return;
      if (rootSource.type === "ArrayExpression" || rootSource.type === "Literal") return;

      context.report({
        node: initExpression,
        message: `${chainDepth}-step array chain in render body — wrap in useMemo to avoid recomputing on every render`,
      });
    },
  }),
};

export const rnAvoidAnonymousFunctionsInJsx: Rule = {
  create: (context: RuleContext) => ({
    JSXAttribute(node: EsTreeNode) {
      const propName = node.name?.type === "JSXIdentifier" ? node.name.name : null;
      if (!propName || !INTERACTIVE_EVENT_PROP_PATTERN.test(propName)) return;
      if (node.value?.type !== "JSXExpressionContainer") return;

      const expression = node.value.expression;
      if (
        expression?.type !== "ArrowFunctionExpression" &&
        expression?.type !== "FunctionExpression"
      )
        return;

      context.report({
        node: expression,
        message: `Inline function on "${propName}" creates a new reference every render — extract to useCallback or a named handler outside the JSX`,
      });
    },
  }),
};
