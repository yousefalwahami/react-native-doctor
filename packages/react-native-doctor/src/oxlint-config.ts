import { createRequire } from "node:module";
import type { Framework } from "./types.js";

const esmRequire = createRequire(import.meta.url);

const RN_RULES: Record<string, string> = {
  "react-native-doctor/rn-no-raw-text": "error",
  "react-native-doctor/rn-no-deprecated-modules": "error",
  "react-native-doctor/rn-no-legacy-expo-packages": "warn",
  "react-native-doctor/rn-no-dimensions-get": "warn",
  "react-native-doctor/rn-no-inline-flatlist-renderitem": "warn",
  "react-native-doctor/rn-no-legacy-shadow-styles": "warn",
  "react-native-doctor/rn-prefer-reanimated": "warn",
  "react-native-doctor/rn-no-single-element-style-array": "warn",
  "react-native-doctor/rn-flatlist-inline-style": "warn",
  "react-native-doctor/rn-flatlist-missing-keyextractor": "warn",
  "react-native-doctor/rn-scrollview-for-long-lists": "warn",
  "react-native-doctor/rn-image-missing-dimensions": "warn",
  "react-native-doctor/rn-inline-style-in-render": "warn",
  "react-native-doctor/rn-missing-memo-on-list-item": "warn",
  "react-native-doctor/rn-heavy-computation-in-render": "warn",
  "react-native-doctor/rn-avoid-anonymous-functions-in-jsx": "warn",
  "react-native-doctor/rn-touchable-missing-accessibility-label": "error",
  "react-native-doctor/rn-missing-accessibility-role": "warn",
  "react-native-doctor/rn-non-descriptive-accessibility-label": "warn",
  "react-native-doctor/rn-image-missing-accessible": "warn",
  "react-native-doctor/rn-touchable-hitslop-missing": "warn",
  "react-native-doctor/rn-hardcoded-colors": "warn",
  "react-native-doctor/rn-platform-os-branching": "warn",
  "react-native-doctor/rn-use-window-dimensions": "warn",
  "react-native-doctor/rn-prop-drilling-depth": "warn",
  "react-native-doctor/rn-god-component": "warn",
  "react-native-doctor/rn-unnecessary-useeffect": "warn",
  "react-native-doctor/rn-navigator-inline-component": "warn",
  "react-native-doctor/rn-missing-screen-options-defaults": "warn",
};

const EXPO_RULES: Record<string, string> = {
  "react-native-doctor/expo-missing-dark-mode-support": "warn",
  "react-native-doctor/expo-constants-misuse": "warn",
  "react-native-doctor/expo-router-layout-missing-error-boundary": "warn",
  "react-native-doctor/expo-hardcoded-api-keys": "error",
  "react-native-doctor/expo-router-missing-not-found": "warn",
};

const NEXTJS_RULES: Record<string, string> = {
  "react-native-doctor/nextjs-no-img-element": "warn",
  "react-native-doctor/nextjs-async-client-component": "error",
  "react-native-doctor/nextjs-no-a-element": "warn",
  "react-native-doctor/nextjs-no-use-search-params-without-suspense": "warn",
  "react-native-doctor/nextjs-no-client-fetch-for-server-data": "warn",
  "react-native-doctor/nextjs-missing-metadata": "warn",
  "react-native-doctor/nextjs-no-client-side-redirect": "warn",
  "react-native-doctor/nextjs-no-redirect-in-try-catch": "warn",
  "react-native-doctor/nextjs-image-missing-sizes": "warn",
  "react-native-doctor/nextjs-no-native-script": "warn",
  "react-native-doctor/nextjs-inline-script-missing-id": "warn",
  "react-native-doctor/nextjs-no-font-link": "warn",
  "react-native-doctor/nextjs-no-css-link": "warn",
  "react-native-doctor/nextjs-no-polyfill-script": "warn",
  "react-native-doctor/nextjs-no-head-import": "error",
  "react-native-doctor/nextjs-no-side-effect-in-get-handler": "error",
};

const REACT_COMPILER_RULES: Record<string, string> = {
  "react-hooks-js/set-state-in-render": "error",
  "react-hooks-js/immutability": "error",
  "react-hooks-js/refs": "error",
  "react-hooks-js/purity": "error",
  "react-hooks-js/hooks": "error",
  "react-hooks-js/set-state-in-effect": "error",
  "react-hooks-js/globals": "error",
  "react-hooks-js/error-boundaries": "error",
  "react-hooks-js/preserve-manual-memoization": "error",
  "react-hooks-js/unsupported-syntax": "error",
  "react-hooks-js/component-hook-factories": "error",
  "react-hooks-js/static-components": "error",
  "react-hooks-js/use-memo": "error",
  "react-hooks-js/void-use-memo": "error",
  "react-hooks-js/incompatible-library": "error",
  "react-hooks-js/todo": "error",
};

interface OxlintConfigOptions {
  pluginPath: string;
  framework: Framework;
  hasReactCompiler: boolean;
  isReactNative: boolean;
  isExpo: boolean;
}

export const createOxlintConfig = ({
  pluginPath,
  framework,
  hasReactCompiler,
  isReactNative,
  isExpo,
}: OxlintConfigOptions) => ({
  categories: {
    correctness: "off",
    suspicious: "off",
    pedantic: "off",
    perf: "off",
    restriction: "off",
    style: "off",
    nursery: "off",
  },
  plugins: ["react", "jsx-a11y", ...(hasReactCompiler ? [] : ["react-perf"])],
  jsPlugins: [
    ...(hasReactCompiler
      ? [
          {
            name: "react-hooks-js",
            specifier: esmRequire.resolve("eslint-plugin-react-hooks"),
          },
        ]
      : []),
    pluginPath,
  ],
  rules: {
    "react/rules-of-hooks": "error",
    "react/no-direct-mutation-state": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-key": "error",
    "react/no-children-prop": "warn",
    "react/no-danger": "warn",
    "react/jsx-no-script-url": "error",
    "react/no-render-return-value": "warn",
    "react/no-string-refs": "warn",
    "react/no-is-mounted": "warn",
    "react/require-render-return": "error",
    "react/no-unknown-property": "warn",

    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "warn",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",
    "jsx-a11y/no-noninteractive-element-interactions": "warn",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/no-autofocus": "warn",
    "jsx-a11y/heading-has-content": "warn",
    "jsx-a11y/html-has-lang": "warn",
    "jsx-a11y/no-redundant-roles": "warn",
    "jsx-a11y/scope": "warn",
    "jsx-a11y/tabindex-no-positive": "warn",
    "jsx-a11y/label-has-associated-control": "warn",
    "jsx-a11y/no-distracting-elements": "error",
    "jsx-a11y/iframe-has-title": "warn",

    ...(hasReactCompiler ? REACT_COMPILER_RULES : {}),

    "react-native-doctor/no-derived-state-effect": "error",
    "react-native-doctor/no-fetch-in-effect": "error",
    "react-native-doctor/no-cascading-set-state": "warn",
    "react-native-doctor/no-effect-event-handler": "warn",
    "react-native-doctor/no-derived-useState": "warn",
    "react-native-doctor/prefer-useReducer": "warn",
    "react-native-doctor/rerender-lazy-state-init": "warn",
    "react-native-doctor/rerender-functional-setstate": "warn",
    "react-native-doctor/rerender-dependencies": "error",

    "react-native-doctor/no-giant-component": "warn",
    "react-native-doctor/no-render-in-render": "warn",
    "react-native-doctor/no-nested-component-definition": "error",

    "react-native-doctor/no-usememo-simple-expression": "warn",
    "react-native-doctor/no-layout-property-animation": "error",
    "react-native-doctor/rerender-memo-with-default-value": "warn",
    "react-native-doctor/rendering-animate-svg-wrapper": "warn",
    "react-native-doctor/no-inline-prop-on-memo-component": "warn",
    "react-native-doctor/rendering-hydration-no-flicker": "warn",

    "react-native-doctor/no-transition-all": "warn",
    "react-native-doctor/no-global-css-variable-animation": "error",
    "react-native-doctor/no-large-animated-blur": "warn",
    "react-native-doctor/no-scale-from-zero": "warn",
    "react-native-doctor/no-permanent-will-change": "warn",

    "react-native-doctor/no-secrets-in-client-code": "error",

    "react-native-doctor/no-barrel-import": "warn",
    "react-native-doctor/no-full-lodash-import": "warn",
    "react-native-doctor/no-moment": "warn",
    "react-native-doctor/prefer-dynamic-import": "warn",
    "react-native-doctor/use-lazy-motion": "warn",
    "react-native-doctor/no-undeferred-third-party": "warn",

    "react-native-doctor/no-array-index-as-key": "warn",
    "react-native-doctor/rendering-conditional-render": "warn",
    "react-native-doctor/no-prevent-default": "warn",

    "react-native-doctor/server-auth-actions": "error",
    "react-native-doctor/server-after-nonblocking": "warn",

    "react-native-doctor/client-passive-event-listeners": "warn",

    "react-native-doctor/async-parallel": "warn",
    ...(framework === "nextjs" ? NEXTJS_RULES : {}),
    ...(isReactNative ? RN_RULES : {}),
    ...(isExpo ? EXPO_RULES : {}),
  },
});
