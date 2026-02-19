import { hasJsxAttribute } from "../helpers.js";
import type { EsTreeNode, Rule, RuleContext } from "../types.js";

const resolveJsxElementName = (openingElement: EsTreeNode): string | null => {
  const elementName = openingElement?.name;
  if (!elementName) return null;
  if (elementName.type === "JSXIdentifier") return elementName.name;
  if (elementName.type === "JSXMemberExpression")
    return elementName.property?.name ?? null;
  return null;
};

export const rnNavigatorInlineComponent: Rule = {
  create: (context: RuleContext) => ({
    JSXAttribute(node: EsTreeNode) {
      if (node.name?.type !== "JSXIdentifier" || node.name.name !== "component")
        return;
      if (node.value?.type !== "JSXExpressionContainer") return;

      const expression = node.value.expression;
      if (
        expression?.type !== "ArrowFunctionExpression" &&
        expression?.type !== "FunctionExpression"
      )
        return;

      const openingElement = node.parent;
      if (!openingElement || openingElement.type !== "JSXOpeningElement")
        return;

      const componentName = resolveJsxElementName(openingElement);
      if (componentName !== "Screen") return;

      context.report({
        node: expression,
        message:
          "Inline component on navigator Screen breaks component identity and causes remounts on every render — pass a component reference: component={ProfileScreen}",
      });
    },
  }),
};

export const rnMissingScreenOptionsDefaults: Rule = {
  create: (context: RuleContext) => ({
    JSXOpeningElement(node: EsTreeNode) {
      const componentName = resolveJsxElementName(node);
      if (componentName !== "Navigator") return;
      if (hasJsxAttribute(node.attributes ?? [], "screenOptions")) return;

      context.report({
        node,
        message:
          "Navigator without screenOptions defaults causes flash of unstyled headers and inconsistent behavior — add screenOptions={{ ... }} at the navigator level",
      });
    },
  }),
};
