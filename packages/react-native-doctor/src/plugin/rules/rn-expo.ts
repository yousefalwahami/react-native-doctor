import {
  EXPO_LIGHT_DARK_COLORS,
  SECRET_MIN_LENGTH_CHARS,
  SECRET_PATTERNS,
} from "../constants.js";
import { walkAst } from "../helpers.js";
import type { EsTreeNode, Rule, RuleContext } from "../types.js";

const resolveJsxElementName = (openingElement: EsTreeNode): string | null => {
  const elementName = openingElement?.name;
  if (!elementName) return null;
  if (elementName.type === "JSXIdentifier") return elementName.name;
  if (elementName.type === "JSXMemberExpression")
    return elementName.property?.name ?? null;
  return null;
};

export const expoMissingDarkModeSupport: Rule = {
  create: (context: RuleContext) => {
    let hasColorSchemeUsage = false;
    let hasHardcodedBwColor = false;
    let firstColorNode: EsTreeNode | null = null;

    return {
      ImportDeclaration(node: EsTreeNode) {
        for (const specifier of node.specifiers ?? []) {
          if (
            specifier.type === "ImportSpecifier" &&
            specifier.imported?.name === "useColorScheme"
          ) {
            hasColorSchemeUsage = true;
          }
        }
      },
      CallExpression(node: EsTreeNode) {
        if (
          node.callee?.type === "Identifier" &&
          node.callee.name === "useColorScheme"
        ) {
          hasColorSchemeUsage = true;
        }
      },
      Literal(node: EsTreeNode) {
        if (typeof node.value !== "string") return;
        if (!EXPO_LIGHT_DARK_COLORS.has(node.value.toLowerCase())) return;
        if (!firstColorNode) firstColorNode = node;
        hasHardcodedBwColor = true;
      },
      "Program:exit"() {
        if (!hasColorSchemeUsage && hasHardcodedBwColor && firstColorNode) {
          context.report({
            node: firstColorNode,
            message:
              "Hardcoded light/dark color without useColorScheme — use useColorScheme() or a theme system to support dark mode",
          });
        }
      },
    };
  },
};

export const expoConstantsMisuse: Rule = {
  create: (context: RuleContext) => ({
    MemberExpression(node: EsTreeNode) {
      if (
        node.object?.type !== "Identifier" ||
        node.object.name !== "Constants"
      )
        return;
      if (
        node.property?.type !== "Identifier" ||
        node.property.name !== "manifest"
      )
        return;

      context.report({
        node,
        message:
          "Constants.manifest is deprecated since Expo SDK 46 — use Constants.expoConfig instead",
      });
    },
  }),
};

export const expoRouterLayoutMissingErrorBoundary: Rule = {
  create: (context: RuleContext) => {
    const filename = context.getFilename?.() ?? "";
    const basename = filename.split("/").pop()?.split("\\").pop() ?? "";
    const isLayoutFile =
      basename === "_layout.tsx" ||
      basename === "_layout.jsx" ||
      basename === "_layout.ts" ||
      basename === "_layout.js";

    if (!isLayoutFile) return {};

    return {
      Program(node: EsTreeNode) {
        let hasErrorBoundary = false;

        walkAst(node, (child) => {
          if (hasErrorBoundary) return;

          if (child.type === "JSXOpeningElement") {
            const name = resolveJsxElementName(child);
            if (name === "ErrorBoundary") hasErrorBoundary = true;
          }

          if (
            child.type === "ExportNamedDeclaration" ||
            child.type === "ExportDefaultDeclaration"
          ) {
            if (child.declaration?.type === "FunctionDeclaration") {
              if (child.declaration.id?.name === "ErrorBoundary")
                hasErrorBoundary = true;
            }
          }
        });

        if (!hasErrorBoundary) {
          context.report({
            node,
            message:
              "Root _layout.tsx has no error boundary — export an ErrorBoundary component to catch runtime errors gracefully",
          });
        }
      },
    };
  },
};

export const expoHardcodedApiKeys: Rule = {
  create: (context: RuleContext) => ({
    Literal(node: EsTreeNode) {
      if (typeof node.value !== "string") return;
      if (node.value.length < SECRET_MIN_LENGTH_CHARS) return;

      const isSecretPattern = SECRET_PATTERNS.some((pattern) =>
        pattern.test(node.value as string),
      );
      if (!isSecretPattern) return;

      context.report({
        node,
        message:
          "API key hardcoded in source — use EAS Secrets or expo-constants with app.config.js to keep keys out of your codebase",
      });
    },
  }),
};

export const expoRouterMissingNotFound: Rule = {
  create: (context: RuleContext) => {
    const filename = context.getFilename?.() ?? "";
    const isAppIndex =
      filename.endsWith("app/index.tsx") ||
      filename.endsWith("app/index.jsx") ||
      filename.endsWith("app/index.ts") ||
      filename.endsWith("app/(index).tsx");

    if (!isAppIndex) return {};

    return {
      Program(node: EsTreeNode) {
        let hasNotFoundImport = false;

        walkAst(node, (child) => {
          if (child.type !== "ImportDeclaration") return;
          if (typeof child.source?.value !== "string") return;
          if (child.source.value.includes("+not-found"))
            hasNotFoundImport = true;
        });

        if (!hasNotFoundImport) {
          context.report({
            node,
            message:
              "Expo Router project is missing a +not-found route — create app/+not-found.tsx to handle unknown routes",
          });
        }
      },
    };
  },
};
