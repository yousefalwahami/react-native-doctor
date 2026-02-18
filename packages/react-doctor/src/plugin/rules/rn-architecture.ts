import {
  COMMON_SCREEN_HEIGHTS,
  COMMON_SCREEN_WIDTHS,
  GIANT_COMPONENT_LINE_THRESHOLD,
  GOD_COMPONENT_EFFECT_THRESHOLD,
  GOD_COMPONENT_STATE_THRESHOLD,
  HARDCODED_COLOR_PROPERTY_NAMES,
  HARDCODED_COLOR_THRESHOLD,
  HEX_COLOR_PATTERN,
  PLATFORM_OS_BRANCH_THRESHOLD,
} from "../constants.js";
import {
  isComponentAssignment,
  isComponentDeclaration,
  walkAst,
} from "../helpers.js";
import type { EsTreeNode, Rule, RuleContext } from "../types.js";

const isHardcodedColor = (value: string): boolean =>
  HEX_COLOR_PATTERN.test(value.trim()) ||
  value.trim().startsWith("rgb(") ||
  value.trim().startsWith("rgba(") ||
  value.trim().startsWith("hsl(");

export const rnHardcodedColors: Rule = {
  create: (context: RuleContext) => {
    const uniqueColorValues = new Set<string>();
    let firstColorNode: EsTreeNode | null = null;

    return {
      Property(node: EsTreeNode) {
        const propName = node.key?.type === "Identifier" ? node.key.name : null;
        if (!propName || !HARDCODED_COLOR_PROPERTY_NAMES.has(propName)) return;
        if (
          node.value?.type !== "Literal" ||
          typeof node.value.value !== "string"
        )
          return;
        if (!isHardcodedColor(node.value.value)) return;

        if (!firstColorNode) firstColorNode = node.value;
        uniqueColorValues.add(node.value.value.toLowerCase());
      },
      "Program:exit"() {
        if (
          uniqueColorValues.size >= HARDCODED_COLOR_THRESHOLD &&
          firstColorNode
        ) {
          context.report({
            node: firstColorNode,
            message: `${uniqueColorValues.size} hardcoded color values found — extract to a colors.ts or theme.ts constants file`,
          });
        }
      },
    };
  },
};

export const rnPlatformOsBranching: Rule = {
  create: (context: RuleContext) => {
    let platformOsCheckCount = 0;
    let firstNode: EsTreeNode | null = null;

    return {
      MemberExpression(node: EsTreeNode) {
        if (
          node.object?.type !== "Identifier" ||
          node.object.name !== "Platform"
        )
          return;
        if (node.property?.type !== "Identifier" || node.property.name !== "OS")
          return;

        platformOsCheckCount++;
        if (!firstNode) firstNode = node;
      },
      "Program:exit"() {
        if (platformOsCheckCount >= PLATFORM_OS_BRANCH_THRESHOLD && firstNode) {
          context.report({
            node: firstNode,
            message: `${platformOsCheckCount} Platform.OS checks in one file — split into platform-specific files (Component.ios.tsx / Component.android.tsx) instead`,
          });
        }
      },
    };
  },
};

export const rnUseWindowDimensions: Rule = {
  create: (context: RuleContext) => ({
    Property(node: EsTreeNode) {
      const propName = node.key?.type === "Identifier" ? node.key.name : null;
      if (!propName || (propName !== "width" && propName !== "height")) return;
      if (
        node.value?.type !== "Literal" ||
        typeof node.value.value !== "number"
      )
        return;

      const dimensionValue = node.value.value;
      const isScreenDimension =
        (propName === "width" && COMMON_SCREEN_WIDTHS.has(dimensionValue)) ||
        (propName === "height" && COMMON_SCREEN_HEIGHTS.has(dimensionValue));

      if (!isScreenDimension) return;

      context.report({
        node: node.value,
        message: `Hardcoded ${propName}: ${dimensionValue} looks like a device screen dimension — use useWindowDimensions() hook for responsive layout`,
      });
    },
  }),
};

export const rnPropDrillingDepth: Rule = {
  create: (context: RuleContext) => ({
    JSXSpreadAttribute(node: EsTreeNode) {
      const argument = node.argument;
      if (argument?.type !== "Identifier") return;

      const spreadName = argument.name;
      if (
        spreadName !== "props" &&
        spreadName !== "rest" &&
        !spreadName.endsWith("Props") &&
        !spreadName.endsWith("Rest")
      )
        return;

      context.report({
        node,
        message: `Spreading "${spreadName}" into a child component may indicate prop drilling — consider using Context, composition, or lifting state to avoid deep prop chains`,
      });
    },
  }),
};

const checkGodComponent = (
  functionNode: EsTreeNode,
  context: RuleContext,
  reportNode: EsTreeNode,
): void => {
  const startLine = functionNode.loc?.start?.line ?? 0;
  const endLine = functionNode.loc?.end?.line ?? 0;
  const lineCount = endLine - startLine;

  if (lineCount < GIANT_COMPONENT_LINE_THRESHOLD) return;

  let stateCount = 0;
  let effectCount = 0;

  walkAst(functionNode, (child) => {
    if (child.type !== "CallExpression" || child.callee?.type !== "Identifier")
      return;
    if (child.callee.name === "useState") stateCount++;
    if (
      child.callee.name === "useEffect" ||
      child.callee.name === "useLayoutEffect"
    ) {
      effectCount++;
    }
  });

  if (
    stateCount < GOD_COMPONENT_STATE_THRESHOLD &&
    effectCount < GOD_COMPONENT_EFFECT_THRESHOLD
  ) {
    return;
  }

  context.report({
    node: reportNode,
    message: `God component: ${lineCount} lines, ${stateCount} useState calls, ${effectCount} effects — decompose into smaller focused components`,
  });
};

export const rnGodComponent: Rule = {
  create: (context: RuleContext) => ({
    FunctionDeclaration(node: EsTreeNode) {
      if (!isComponentDeclaration(node)) return;
      checkGodComponent(node, context, node);
    },
    VariableDeclarator(node: EsTreeNode) {
      if (!isComponentAssignment(node)) return;
      checkGodComponent(node.init, context, node);
    },
  }),
};

export const rnUnnecessaryUseEffect: Rule = {
  create: (context: RuleContext) => ({
    CallExpression(node: EsTreeNode) {
      if (
        node.callee?.type !== "Identifier" ||
        node.callee.name !== "useEffect"
      )
        return;

      const callback = node.arguments?.[0];
      if (!callback || callback.type !== "ArrowFunctionExpression") return;

      if (callback.body?.type !== "BlockStatement") return;

      const statements = callback.body.body ?? [];
      if (statements.length !== 1) return;

      const statement = statements[0];
      if (statement.type !== "ExpressionStatement") return;

      const expression = statement.expression;
      if (expression.type !== "CallExpression") return;
      if (expression.callee?.type !== "Identifier") return;

      const calleeName = expression.callee.name;
      if (!calleeName.startsWith("set") || !/^set[A-Z]/.test(calleeName))
        return;

      const depsArray = node.arguments?.[1];
      if (!depsArray || depsArray.type !== "ArrayExpression") return;

      context.report({
        node,
        message:
          "useEffect that only calls a setter is likely unnecessary — derive the value directly or use an event handler instead",
      });
    },
  }),
};
