import {
  NON_DESCRIPTIVE_A11Y_LABEL_STRINGS,
  RN_TOUCHABLE_COMPONENTS,
  TAP_TARGET_MIN_SIZE_PT,
} from "../constants.js";
import { findJsxAttribute, hasJsxAttribute } from "../helpers.js";
import type { EsTreeNode, Rule, RuleContext } from "../types.js";

const resolveJsxElementName = (openingElement: EsTreeNode): string | null => {
  const elementName = openingElement?.name;
  if (!elementName) return null;
  if (elementName.type === "JSXIdentifier") return elementName.name;
  if (elementName.type === "JSXMemberExpression")
    return elementName.property?.name ?? null;
  return null;
};

const getLiteralStringValue = (node: EsTreeNode): string | null => {
  if (node.type === "Literal" && typeof node.value === "string")
    return node.value;
  if (
    node.type === "JSXExpressionContainer" &&
    node.expression?.type === "Literal" &&
    typeof node.expression.value === "string"
  ) {
    return node.expression.value;
  }
  return null;
};

const getNumericStyleProperty = (
  objectExpression: EsTreeNode,
  propertyName: string,
): number | null => {
  for (const property of objectExpression.properties ?? []) {
    if (property.type !== "Property") continue;
    if (
      property.key?.type !== "Identifier" ||
      property.key.name !== propertyName
    )
      continue;
    if (
      property.value?.type !== "Literal" ||
      typeof property.value.value !== "number"
    )
      continue;
    return property.value.value;
  }
  return null;
};

export const rnTouchableMissingAccessibilityLabel: Rule = {
  create: (context: RuleContext) => ({
    JSXOpeningElement(node: EsTreeNode) {
      const componentName = resolveJsxElementName(node);
      if (!componentName || !RN_TOUCHABLE_COMPONENTS.has(componentName)) return;
      if (hasJsxAttribute(node.attributes ?? [], "accessibilityLabel")) return;

      context.report({
        node,
        message: `<${componentName}> is missing an accessibilityLabel — screen readers will announce the element without context`,
      });
    },
  }),
};

export const rnMissingAccessibilityRole: Rule = {
  create: (context: RuleContext) => ({
    JSXOpeningElement(node: EsTreeNode) {
      const componentName = resolveJsxElementName(node);
      if (!componentName || !RN_TOUCHABLE_COMPONENTS.has(componentName)) return;
      if (hasJsxAttribute(node.attributes ?? [], "accessibilityRole")) return;

      context.report({
        node,
        message: `<${componentName}> is missing an accessibilityRole — add accessibilityRole="button" or the appropriate role`,
      });
    },
  }),
};

export const rnNonDescriptiveAccessibilityLabel: Rule = {
  create: (context: RuleContext) => ({
    JSXAttribute(node: EsTreeNode) {
      if (
        node.name?.type !== "JSXIdentifier" ||
        node.name.name !== "accessibilityLabel"
      )
        return;
      if (!node.value) return;

      const labelValue = getLiteralStringValue(node.value);
      if (!labelValue) return;

      if (
        !NON_DESCRIPTIVE_A11Y_LABEL_STRINGS.has(labelValue.toLowerCase().trim())
      )
        return;

      context.report({
        node: node.value,
        message: `accessibilityLabel "${labelValue}" is non-descriptive — use specific text that describes the action or content`,
      });
    },
  }),
};

export const rnImageMissingAccessible: Rule = {
  create: (context: RuleContext) => ({
    JSXOpeningElement(node: EsTreeNode) {
      const componentName = resolveJsxElementName(node);
      if (componentName !== "Image") return;

      const attributes = node.attributes ?? [];
      const hasAccessible = hasJsxAttribute(attributes, "accessible");
      const hasAccessibilityLabel = hasJsxAttribute(
        attributes,
        "accessibilityLabel",
      );

      if (hasAccessible && hasAccessibilityLabel) return;

      context.report({
        node,
        message:
          "<Image> is missing accessible={true} and accessibilityLabel — non-decorative images must be accessible to screen readers",
      });
    },
  }),
};

export const rnTouchableHitslopMissing: Rule = {
  create: (context: RuleContext) => ({
    JSXOpeningElement(node: EsTreeNode) {
      const componentName = resolveJsxElementName(node);
      if (!componentName || !RN_TOUCHABLE_COMPONENTS.has(componentName)) return;

      const attributes = node.attributes ?? [];
      if (hasJsxAttribute(attributes, "hitSlop")) return;

      const styleAttr = findJsxAttribute(attributes, "style");
      if (!styleAttr) return;

      const styleValue = styleAttr.value;
      if (styleValue?.type !== "JSXExpressionContainer") return;

      const styleExpression = styleValue.expression;
      if (styleExpression?.type !== "ObjectExpression") return;

      const width = getNumericStyleProperty(styleExpression, "width");
      const height = getNumericStyleProperty(styleExpression, "height");
      if (width === null && height === null) return;

      const isTooSmall = (value: number | null): boolean =>
        value !== null && value < TAP_TARGET_MIN_SIZE_PT;

      if (!isTooSmall(width) && !isTooSmall(height)) return;

      context.report({
        node,
        message: `<${componentName}> tap target is smaller than ${TAP_TARGET_MIN_SIZE_PT}pt without hitSlop — add hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`,
      });
    },
  }),
};
