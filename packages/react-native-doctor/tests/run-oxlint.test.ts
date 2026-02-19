import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Diagnostic } from "../src/types.js";
import { runOxlint } from "../src/utils/run-oxlint.js";

const FIXTURES_DIRECTORY = path.resolve(import.meta.dirname, "fixtures");
const BASIC_REACT_DIRECTORY = path.join(FIXTURES_DIRECTORY, "basic-react");
const RN_APP_DIRECTORY = path.join(FIXTURES_DIRECTORY, "react-native-app");
const EXPO_APP_DIRECTORY = path.join(FIXTURES_DIRECTORY, "expo-app");

const findDiagnosticsByRule = (
  diagnostics: Diagnostic[],
  rule: string,
): Diagnostic[] => diagnostics.filter((diagnostic) => diagnostic.rule === rule);

interface RuleTestCase {
  fixture: string;
  ruleSource: string;
  severity?: "error" | "warning";
  category?: string;
}

const describeRules = (
  groupName: string,
  rules: Record<string, RuleTestCase>,
  getDiagnostics: () => Diagnostic[],
) => {
  describe(groupName, () => {
    for (const [ruleName, testCase] of Object.entries(rules)) {
      it(`${ruleName} (${testCase.fixture} → ${testCase.ruleSource})`, () => {
        const issues = findDiagnosticsByRule(getDiagnostics(), ruleName);
        expect(issues.length).toBeGreaterThan(0);
        if (testCase.severity)
          expect(issues[0].severity).toBe(testCase.severity);
        if (testCase.category)
          expect(issues[0].category).toBe(testCase.category);
      });
    }
  });
};

let basicReactDiagnostics: Diagnostic[];
let rnDiagnostics: Diagnostic[];
let expoDiagnostics: Diagnostic[];

describe("runOxlint", () => {
  it("loads basic-react diagnostics", async () => {
    basicReactDiagnostics = await runOxlint(
      BASIC_REACT_DIRECTORY,
      true,
      "unknown",
      false,
      false,
      false,
    );
    expect(basicReactDiagnostics.length).toBeGreaterThan(0);
  });

  it("loads react-native diagnostics", async () => {
    rnDiagnostics = await runOxlint(
      RN_APP_DIRECTORY,
      true,
      "unknown",
      false,
      true,
      false,
    );
    expect(rnDiagnostics.length).toBeGreaterThan(0);
  });

  it("loads expo diagnostics", async () => {
    expoDiagnostics = await runOxlint(
      EXPO_APP_DIRECTORY,
      true,
      "unknown",
      false,
      true,
      true,
    );
    expect(expoDiagnostics.length).toBeGreaterThan(0);
  });

  it("returns diagnostics with required fields", () => {
    for (const diagnostic of basicReactDiagnostics) {
      expect(diagnostic).toHaveProperty("filePath");
      expect(diagnostic).toHaveProperty("plugin");
      expect(diagnostic).toHaveProperty("rule");
      expect(diagnostic).toHaveProperty("severity");
      expect(diagnostic).toHaveProperty("message");
      expect(diagnostic).toHaveProperty("category");
      expect(["error", "warning"]).toContain(diagnostic.severity);
      expect(diagnostic.message.length).toBeGreaterThan(0);
    }
  });

  it("only reports diagnostics from JSX/TSX files", () => {
    for (const diagnostic of basicReactDiagnostics) {
      expect(diagnostic.filePath).toMatch(/\.(tsx|jsx)$/);
    }
  });

  describeRules(
    "state & effects rules",
    {
      "no-derived-state-effect": {
        fixture: "state-issues.tsx",
        ruleSource: "rules/state-and-effects.ts",
        severity: "error",
        category: "State & Effects",
      },
      "no-fetch-in-effect": {
        fixture: "state-issues.tsx",
        ruleSource: "rules/state-and-effects.ts",
        severity: "error",
      },
      "no-cascading-set-state": {
        fixture: "state-issues.tsx",
        ruleSource: "rules/state-and-effects.ts",
        severity: "warning",
      },
      "no-effect-event-handler": {
        fixture: "state-issues.tsx",
        ruleSource: "rules/state-and-effects.ts",
        severity: "warning",
      },
      "no-derived-useState": {
        fixture: "state-issues.tsx",
        ruleSource: "rules/state-and-effects.ts",
        severity: "warning",
      },
      "prefer-useReducer": {
        fixture: "state-issues.tsx",
        ruleSource: "rules/state-and-effects.ts",
        severity: "warning",
      },
      "rerender-lazy-state-init": {
        fixture: "state-issues.tsx",
        ruleSource: "rules/state-and-effects.ts",
        severity: "warning",
      },
      "rerender-functional-setstate": {
        fixture: "state-issues.tsx",
        ruleSource: "rules/state-and-effects.ts",
        severity: "warning",
      },
      "rerender-dependencies": {
        fixture: "state-issues.tsx",
        ruleSource: "rules/state-and-effects.ts",
        severity: "error",
      },
    },
    () => basicReactDiagnostics,
  );

  describeRules(
    "architecture rules",
    {
      "no-giant-component": {
        fixture: "giant-component.tsx",
        ruleSource: "rules/architecture.ts",
        category: "Architecture",
      },
      "no-render-in-render": {
        fixture: "architecture-issues.tsx",
        ruleSource: "rules/architecture.ts",
        category: "Architecture",
      },
      "no-nested-component-definition": {
        fixture: "architecture-issues.tsx",
        ruleSource: "rules/architecture.ts",
        severity: "error",
      },
    },
    () => basicReactDiagnostics,
  );

  describeRules(
    "performance rules",
    {
      "no-inline-prop-on-memo-component": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
      },
      "no-usememo-simple-expression": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
        category: "Performance",
      },
      "no-layout-property-animation": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
        severity: "error",
      },
      "no-transition-all": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
      },
      "no-large-animated-blur": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
      },
      "no-scale-from-zero": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
      },
      "no-permanent-will-change": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
      },
      "rerender-memo-with-default-value": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
      },
      "rendering-animate-svg-wrapper": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
      },
      "rendering-hydration-no-flicker": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
      },
      "no-global-css-variable-animation": {
        fixture: "performance-issues.tsx",
        ruleSource: "rules/performance.ts",
        severity: "error",
      },
      "client-passive-event-listeners": {
        fixture: "client-issues.tsx",
        ruleSource: "rules/client.ts",
      },
    },
    () => basicReactDiagnostics,
  );

  describeRules(
    "async performance rules",
    {
      "async-parallel": {
        fixture: "js-performance-issues.tsx",
        ruleSource: "rules/js-performance.ts",
      },
    },
    () => basicReactDiagnostics,
  );

  describeRules(
    "bundle size rules",
    {
      "no-full-lodash-import": {
        fixture: "bundle-issues.tsx",
        ruleSource: "rules/bundle-size.ts",
        category: "Bundle Size",
      },
      "no-moment": {
        fixture: "bundle-issues.tsx",
        ruleSource: "rules/bundle-size.ts",
      },
      "use-lazy-motion": {
        fixture: "bundle-issues.tsx",
        ruleSource: "rules/bundle-size.ts",
      },
      "prefer-dynamic-import": {
        fixture: "bundle-issues.tsx",
        ruleSource: "rules/bundle-size.ts",
      },
      "no-undeferred-third-party": {
        fixture: "bundle-issues.tsx",
        ruleSource: "rules/bundle-size.ts",
      },
    },
    () => basicReactDiagnostics,
  );

  describeRules(
    "correctness rules",
    {
      "no-array-index-as-key": {
        fixture: "correctness-issues.tsx",
        ruleSource: "rules/correctness.ts",
        category: "Correctness",
      },
      "rendering-conditional-render": {
        fixture: "correctness-issues.tsx",
        ruleSource: "rules/correctness.ts",
      },
      "no-prevent-default": {
        fixture: "correctness-issues.tsx",
        ruleSource: "rules/correctness.ts",
      },
    },
    () => basicReactDiagnostics,
  );

  describeRules(
    "security rules",
    {
      "no-secrets-in-client-code": {
        fixture: "security-issues.tsx",
        ruleSource: "rules/security.ts",
        severity: "error",
        category: "Security",
      },
    },
    () => basicReactDiagnostics,
  );

  describeRules(
    "react native rules",
    {
      "rn-no-deprecated-modules": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "error",
      },
      "rn-prefer-reanimated": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "warning",
      },
      "rn-no-dimensions-get": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "warning",
      },
      "rn-touchable-missing-accessibility-label": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/rn-accessibility.ts",
        severity: "error",
      },
      "rn-missing-accessibility-role": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/rn-accessibility.ts",
        severity: "warning",
      },
      "rn-image-missing-accessible": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/rn-accessibility.ts",
        severity: "warning",
      },
      "rn-image-missing-dimensions": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "warning",
      },
      "rn-inline-style-in-render": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "warning",
      },
      "rn-no-inline-flatlist-renderitem": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "warning",
      },
      "rn-flatlist-missing-keyextractor": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "warning",
      },
      "rn-scrollview-for-long-lists": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "warning",
      },
      "rn-avoid-anonymous-functions-in-jsx": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/rn-architecture.ts",
        severity: "warning",
      },
      "rn-missing-memo-on-list-item": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "warning",
      },
      "rn-hardcoded-colors": {
        fixture: "rn-issues.tsx",
        ruleSource: "rules/rn-architecture.ts",
        severity: "warning",
      },
    },
    () => rnDiagnostics,
  );

  describeRules(
    "expo rules",
    {
      "rn-no-legacy-expo-packages": {
        fixture: "expo-issues.tsx",
        ruleSource: "rules/react-native.ts",
        severity: "warning",
      },
      "expo-constants-misuse": {
        fixture: "expo-issues.tsx",
        ruleSource: "rules/rn-expo.ts",
        severity: "warning",
      },
      "expo-missing-dark-mode-support": {
        fixture: "expo-issues.tsx",
        ruleSource: "rules/rn-expo.ts",
        severity: "warning",
      },
      "expo-router-layout-missing-error-boundary": {
        fixture: "src/app/_layout.tsx",
        ruleSource: "rules/rn-expo.ts",
        severity: "warning",
      },
      "expo-router-missing-not-found": {
        fixture: "src/app/index.tsx",
        ruleSource: "rules/rn-expo.ts",
        severity: "warning",
      },
    },
    () => expoDiagnostics,
  );
});
