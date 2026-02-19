import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ERROR_PREVIEW_LENGTH_CHARS, JSX_FILE_PATTERN } from "../constants.js";
import { createOxlintConfig } from "../oxlint-config.js";
import type {
  CleanedDiagnostic,
  Diagnostic,
  Framework,
  OxlintOutput,
} from "../types.js";
import { neutralizeDisableDirectives } from "./neutralize-disable-directives.js";

const esmRequire = createRequire(import.meta.url);

const PLUGIN_CATEGORY_MAP: Record<string, string> = {
  react: "Correctness",
  "react-hooks": "Correctness",
  "react-hooks-js": "React Compiler",
  "react-perf": "Performance",
  "jsx-a11y": "Accessibility",
};

const RULE_CATEGORY_MAP: Record<string, string> = {
  "react-native-doctor/no-derived-state-effect": "State & Effects",
  "react-native-doctor/no-fetch-in-effect": "State & Effects",
  "react-native-doctor/no-cascading-set-state": "State & Effects",
  "react-native-doctor/no-effect-event-handler": "State & Effects",
  "react-native-doctor/no-derived-useState": "State & Effects",
  "react-native-doctor/prefer-useReducer": "State & Effects",
  "react-native-doctor/rerender-lazy-state-init": "Performance",
  "react-native-doctor/rerender-functional-setstate": "Performance",
  "react-native-doctor/rerender-dependencies": "State & Effects",

  "react-native-doctor/no-generic-handler-names": "Architecture",
  "react-native-doctor/no-giant-component": "Architecture",
  "react-native-doctor/no-render-in-render": "Architecture",
  "react-native-doctor/no-nested-component-definition": "Correctness",

  "react-native-doctor/no-usememo-simple-expression": "Performance",
  "react-native-doctor/no-layout-property-animation": "Performance",
  "react-native-doctor/rerender-memo-with-default-value": "Performance",
  "react-native-doctor/rendering-animate-svg-wrapper": "Performance",
  "react-native-doctor/rendering-usetransition-loading": "Performance",
  "react-native-doctor/rendering-hydration-no-flicker": "Performance",

  "react-native-doctor/no-transition-all": "Performance",
  "react-native-doctor/no-global-css-variable-animation": "Performance",
  "react-native-doctor/no-large-animated-blur": "Performance",
  "react-native-doctor/no-scale-from-zero": "Performance",
  "react-native-doctor/no-permanent-will-change": "Performance",

  "react-native-doctor/no-secrets-in-client-code": "Security",

  "react-native-doctor/no-barrel-import": "Bundle Size",
  "react-native-doctor/no-full-lodash-import": "Bundle Size",
  "react-native-doctor/no-moment": "Bundle Size",
  "react-native-doctor/prefer-dynamic-import": "Bundle Size",
  "react-native-doctor/use-lazy-motion": "Bundle Size",
  "react-native-doctor/no-undeferred-third-party": "Bundle Size",

  "react-native-doctor/no-array-index-as-key": "Correctness",
  "react-native-doctor/rendering-conditional-render": "Correctness",
  "react-native-doctor/no-prevent-default": "Correctness",
  "react-native-doctor/nextjs-no-img-element": "Next.js",
  "react-native-doctor/nextjs-async-client-component": "Next.js",
  "react-native-doctor/nextjs-no-a-element": "Next.js",
  "react-native-doctor/nextjs-no-use-search-params-without-suspense": "Next.js",
  "react-native-doctor/nextjs-no-client-fetch-for-server-data": "Next.js",
  "react-native-doctor/nextjs-missing-metadata": "Next.js",
  "react-native-doctor/nextjs-no-client-side-redirect": "Next.js",
  "react-native-doctor/nextjs-no-redirect-in-try-catch": "Next.js",
  "react-native-doctor/nextjs-image-missing-sizes": "Next.js",
  "react-native-doctor/nextjs-no-native-script": "Next.js",
  "react-native-doctor/nextjs-inline-script-missing-id": "Next.js",
  "react-native-doctor/nextjs-no-font-link": "Next.js",
  "react-native-doctor/nextjs-no-css-link": "Next.js",
  "react-native-doctor/nextjs-no-polyfill-script": "Next.js",
  "react-native-doctor/nextjs-no-head-import": "Next.js",
  "react-native-doctor/nextjs-no-side-effect-in-get-handler": "Security",

  "react-native-doctor/server-auth-actions": "Server",
  "react-native-doctor/server-after-nonblocking": "Server",

  "react-native-doctor/client-passive-event-listeners": "Performance",

  "react-native-doctor/async-parallel": "Performance",

  "react-native-doctor/rn-no-raw-text": "React Native",
  "react-native-doctor/rn-no-deprecated-modules": "React Native",
  "react-native-doctor/rn-no-legacy-expo-packages": "React Native",
  "react-native-doctor/rn-no-dimensions-get": "React Native",
  "react-native-doctor/rn-no-inline-flatlist-renderitem": "Performance",
  "react-native-doctor/rn-no-legacy-shadow-styles": "React Native",
  "react-native-doctor/rn-prefer-reanimated": "Performance",
  "react-native-doctor/rn-no-single-element-style-array": "Performance",
  "react-native-doctor/rn-flatlist-inline-style": "Performance",
  "react-native-doctor/rn-flatlist-missing-keyextractor": "Performance",
  "react-native-doctor/rn-scrollview-for-long-lists": "Performance",
  "react-native-doctor/rn-image-missing-dimensions": "React Native",
  "react-native-doctor/rn-inline-style-in-render": "Performance",
  "react-native-doctor/rn-missing-memo-on-list-item": "Performance",
  "react-native-doctor/rn-heavy-computation-in-render": "Performance",
  "react-native-doctor/rn-avoid-anonymous-functions-in-jsx": "Performance",
  "react-native-doctor/rn-touchable-missing-accessibility-label":
    "Accessibility",
  "react-native-doctor/rn-missing-accessibility-role": "Accessibility",
  "react-native-doctor/rn-non-descriptive-accessibility-label": "Accessibility",
  "react-native-doctor/rn-image-missing-accessible": "Accessibility",
  "react-native-doctor/rn-touchable-hitslop-missing": "Accessibility",
  "react-native-doctor/rn-hardcoded-colors": "Architecture",
  "react-native-doctor/rn-platform-os-branching": "Architecture",
  "react-native-doctor/rn-use-window-dimensions": "Architecture",
  "react-native-doctor/rn-prop-drilling-depth": "Architecture",
  "react-native-doctor/rn-god-component": "Architecture",
  "react-native-doctor/rn-unnecessary-useeffect": "State & Effects",
  "react-native-doctor/rn-navigator-inline-component": "React Native",
  "react-native-doctor/rn-missing-screen-options-defaults": "React Native",
  "react-native-doctor/expo-missing-dark-mode-support": "Expo",
  "react-native-doctor/expo-constants-misuse": "Expo",
  "react-native-doctor/expo-router-layout-missing-error-boundary": "Expo",
  "react-native-doctor/expo-hardcoded-api-keys": "Security",
  "react-native-doctor/expo-router-missing-not-found": "Expo",
};

const RULE_HELP_MAP: Record<string, string> = {
  "no-derived-state-effect":
    "For derived state, compute inline: `const x = fn(dep)`. For state resets on prop change, use a key prop: `<Component key={prop} />`",
  "no-fetch-in-effect":
    "Use `useQuery()` from @tanstack/react-query, `useSWR()`, or fetch in a Server Component instead",
  "no-cascading-set-state":
    "Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`",
  "no-effect-event-handler":
    "Move the conditional logic into onClick, onChange, or onSubmit handlers directly",
  "no-derived-useState":
    "Remove useState and compute the value inline: `const value = transform(propName)`",
  "prefer-useReducer":
    "Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`",
  "rerender-lazy-state-init":
    "Wrap in an arrow function so it only runs once: `useState(() => expensiveComputation())`",
  "rerender-functional-setstate":
    "Use the callback form: `setState(prev => prev + 1)` to always read the latest value",
  "rerender-dependencies":
    "Extract to a useMemo, useRef, or module-level constant so the reference is stable",

  "no-generic-handler-names":
    "Rename to describe the action: e.g. `handleSubmit` → `saveUserProfile`, `handleClick` → `toggleSidebar`",
  "no-giant-component":
    "Extract logical sections into focused components: `<UserHeader />`, `<UserActions />`, etc.",
  "no-render-in-render":
    "Extract to a named component: `const ListItem = ({ item }) => <div>{item.name}</div>`",
  "no-nested-component-definition":
    "Move to a separate file or to module scope above the parent component",

  "no-usememo-simple-expression":
    "Remove useMemo — property access, math, and ternaries are already cheap without memoization",
  "no-layout-property-animation":
    "Use `transform: translateX()` or `scale()` instead — they run on the compositor and skip layout/paint",
  "rerender-memo-with-default-value":
    "Move to module scope: `const EMPTY_ITEMS: Item[] = []` then use as the default value",
  "rendering-animate-svg-wrapper":
    "Wrap the SVG: `<motion.div animate={...}><svg>...</svg></motion.div>`",
  "rendering-usetransition-loading":
    "Replace with `const [isPending, startTransition] = useTransition()` — avoids a re-render for the loading state",
  "rendering-hydration-no-flicker":
    "Use `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` or add `suppressHydrationWarning` to the element",

  "no-transition-all":
    'List specific properties: `transition: "opacity 200ms, transform 200ms"` — or in Tailwind use `transition-colors`, `transition-opacity`, or `transition-transform`',
  "no-global-css-variable-animation":
    "Set the variable on the nearest element instead of a parent, or use `@property` with `inherits: false` to prevent cascade. Better yet, use targeted `element.style.transform` updates",
  "no-large-animated-blur":
    "Keep blur radius under 10px, or apply blur to a smaller element. Large blurs multiply GPU memory usage with layer size",
  "no-scale-from-zero":
    "Use `initial={{ scale: 0.95, opacity: 0 }}` — elements should deflate like a balloon, not vanish into a point",
  "no-permanent-will-change":
    "Add will-change on animation start (`onMouseEnter`) and remove on end (`onAnimationEnd`). Permanent promotion wastes GPU memory and can degrade performance",

  "no-secrets-in-client-code":
    "Move to server-side `process.env.SECRET_NAME`. Only `NEXT_PUBLIC_*` vars are safe for the client (and should not contain secrets)",

  "no-barrel-import":
    "Import from the direct path: `import { Button } from './components/Button'` instead of `./components`",
  "no-full-lodash-import":
    "Import the specific function: `import debounce from 'lodash/debounce'` — saves ~70kb",
  "no-moment":
    "Replace with `import { format } from 'date-fns'` (tree-shakeable) or `import dayjs from 'dayjs'` (2kb)",
  "prefer-dynamic-import":
    "Use `const Component = dynamic(() => import('library'), { ssr: false })` from next/dynamic or React.lazy()",
  "use-lazy-motion":
    'Use `import { LazyMotion, m } from "framer-motion"` with `domAnimation` features — saves ~30kb',
  "no-undeferred-third-party":
    'Use `next/script` with `strategy="lazyOnload"` or add the `defer` attribute',

  "no-array-index-as-key":
    "Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter",
  "rendering-conditional-render":
    "Change to `{items.length > 0 && <List />}` or use a ternary: `{items.length ? <List /> : null}`",
  "no-prevent-default":
    "Use `<form action={serverAction}>` (works without JS) or `<button>` instead of `<a>` with preventDefault",

  "nextjs-no-img-element":
    "`import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset",
  "nextjs-async-client-component":
    "Fetch data in a parent Server Component and pass it as props, or use useQuery/useSWR in the client component",
  "nextjs-no-a-element":
    "`import Link from 'next/link'` — enables client-side navigation, prefetching, and preserves scroll position",
  "nextjs-no-use-search-params-without-suspense":
    "Wrap the component using useSearchParams: `<Suspense fallback={<Skeleton />}><SearchComponent /></Suspense>`",
  "nextjs-no-client-fetch-for-server-data":
    "Remove 'use client' and fetch directly in the Server Component — no API round-trip, secrets stay on server",
  "nextjs-missing-metadata":
    "Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`",
  "nextjs-no-client-side-redirect":
    "Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware",
  "nextjs-no-redirect-in-try-catch":
    "Move the redirect/notFound call outside the try block, or add `unstable_rethrow(error)` in the catch",
  "nextjs-image-missing-sizes":
    'Add sizes for responsive behavior: `sizes="(max-width: 768px) 100vw, 50vw"` matching your layout breakpoints',
  "nextjs-no-native-script":
    '`import Script from "next/script"` — use `strategy="afterInteractive"` for analytics or `"lazyOnload"` for widgets',
  "nextjs-inline-script-missing-id":
    'Add `id="descriptive-name"` so Next.js can track, deduplicate, and re-execute the script correctly',
  "nextjs-no-font-link":
    '`import { Inter } from "next/font/google"` — self-hosted, zero layout shift, no render-blocking requests',
  "nextjs-no-css-link":
    "Import CSS directly: `import './styles.css'` or use CSS Modules: `import styles from './Button.module.css'`",
  "nextjs-no-polyfill-script":
    "Next.js includes polyfills for fetch, Promise, Object.assign, Array.from, and 50+ others automatically",
  "nextjs-no-head-import":
    "Use the Metadata API instead: `export const metadata = { title: '...' }` or `export async function generateMetadata()`",
  "nextjs-no-side-effect-in-get-handler":
    "Move the side effect to a POST handler and use a <form> or fetch with method POST — GET requests can be triggered by prefetching and are vulnerable to CSRF",

  "server-auth-actions":
    "Add `const session = await auth()` at the top and throw/redirect if unauthorized before any data access",
  "server-after-nonblocking":
    "`import { after } from 'next/server'` then wrap: `after(() => analytics.track(...))` — response isn't blocked",

  "client-passive-event-listeners":
    "Add `{ passive: true }` as the third argument: `addEventListener('scroll', handler, { passive: true })`",

  "async-parallel":
    "Use `const [a, b] = await Promise.all([fetchA(), fetchB()])` to run independent operations concurrently",

  "rn-no-raw-text":
    "Wrap the text in a <Text> component: `<Text>{value}</Text>` — React Native crashes when text appears outside <Text>",
  "rn-no-deprecated-modules":
    "Check the React Native upgrade guide for the replacement module path",
  "rn-no-legacy-expo-packages":
    "Run `npx expo install` to install the recommended replacement package",
  "rn-no-dimensions-get":
    "Replace with `const { width, height } = useWindowDimensions()` — updates automatically on rotation",
  "rn-no-inline-flatlist-renderitem":
    "Extract to a named function: `const renderItem = ({ item }) => <Item data={item} />` or wrap in `useCallback`",
  "rn-no-legacy-shadow-styles":
    "Replace with `boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'` for cross-platform shadow support",
  "rn-prefer-reanimated":
    "`import Animated from 'react-native-reanimated'` — runs on the UI thread, no JS bridge overhead",
  "rn-no-single-element-style-array":
    "Remove the array wrapper: `style={styles.container}` instead of `style={[styles.container]}`",
  "rn-flatlist-inline-style":
    "Extract to `StyleSheet.create()` outside the component: `const styles = StyleSheet.create({ item: { ... } })`",
  "rn-flatlist-missing-keyextractor":
    "Add `keyExtractor={(item) => item.id.toString()}` to prevent unnecessary re-renders on list updates",
  "rn-scrollview-for-long-lists":
    "Replace `<ScrollView>` + `.map()` with `<FlatList data={items} renderItem={...} />` for virtualized rendering",
  "rn-image-missing-dimensions":
    "Add `style={{ width: 100, height: 100 }}` or `width={100} height={100}` props to prevent layout shifts",
  "rn-inline-style-in-render":
    "Move to `StyleSheet.create()` outside the component: creates the object once instead of on every render",
  "rn-missing-memo-on-list-item":
    "Wrap with `export default React.memo(ComponentName)` to prevent re-renders when the parent FlatList updates",
  "rn-heavy-computation-in-render":
    "Wrap in `useMemo`: `const result = useMemo(() => data.filter(...).sort(...), [data])`",
  "rn-avoid-anonymous-functions-in-jsx":
    "Extract to a named handler: `const handlePress = useCallback(() => { ... }, [deps])` then use `onPress={handlePress}`",
  "rn-touchable-missing-accessibility-label":
    'Add `accessibilityLabel="Descriptive action"` so screen readers can announce the button purpose',
  "rn-missing-accessibility-role":
    'Add `accessibilityRole="button"` or the appropriate role — helps screen readers announce the element type',
  "rn-non-descriptive-accessibility-label":
    'Use a specific label: `accessibilityLabel="Submit order"` instead of generic words like "button" or "tap here"',
  "rn-image-missing-accessible":
    'Add `accessible={true} accessibilityLabel="Description of image"` so screen readers describe the image',
  "rn-touchable-hitslop-missing":
    "Add `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}` to meet the 44pt minimum tap target size",
  "rn-hardcoded-colors":
    "Extract to a theme: `import { colors } from '@/theme'` and add `colors.primary`, `colors.background`, etc.",
  "rn-platform-os-branching":
    "Split into platform files: `Button.ios.tsx` and `Button.android.tsx` — Metro picks the right one automatically",
  "rn-use-window-dimensions":
    "Replace hardcoded pixel values with `const { width, height } = useWindowDimensions()`",
  "rn-prop-drilling-depth":
    "Extract shared state to a React context or a state management store to avoid passing props through multiple layers",
  "rn-god-component":
    "Split into focused sub-components and custom hooks — e.g. `useFormState`, `<FormHeader />`, `<FormFields />`",
  "rn-unnecessary-useeffect":
    "Compute the derived value inline or in a `useMemo` — no effect needed for pure state derivations",
  "rn-navigator-inline-component":
    "Extract to a named component: `const HomeScreen = () => <Screen />` then use `component={HomeScreen}`",
  "rn-missing-screen-options-defaults":
    "Add `<Stack.Navigator screenOptions={{ headerShown: false }}>` to set consistent defaults for all screens",
  "expo-missing-dark-mode-support":
    "Use `const colorScheme = useColorScheme()` and branch: `colorScheme === 'dark' ? darkColor : lightColor`",
  "expo-constants-misuse":
    "Replace `Constants.manifest` with `Constants.expoConfig` — `manifest` was removed in SDK 50",
  "expo-router-layout-missing-error-boundary":
    "Add `export { default as ErrorBoundary } from 'expo-router'` to your `_layout.tsx` for unhandled route errors",
  "expo-hardcoded-api-keys":
    "Move to `app.config.js` `extra` field and access via `Constants.expoConfig.extra.apiKey` — never commit keys to source",
  "expo-router-missing-not-found":
    "Create `app/+not-found.tsx` with a `<Link href='/'>Go home</Link>` to handle unknown deep link routes",
};

const FILEPATH_WITH_LOCATION_PATTERN = /\S+\.\w+:\d+:\d+[\s\S]*$/;

const REACT_COMPILER_MESSAGE = "React Compiler can't optimize this code";

const cleanDiagnosticMessage = (
  message: string,
  help: string,
  plugin: string,
  rule: string,
): CleanedDiagnostic => {
  if (plugin === "react-hooks-js") {
    const rawMessage = message
      .replace(FILEPATH_WITH_LOCATION_PATTERN, "")
      .trim();
    return { message: REACT_COMPILER_MESSAGE, help: rawMessage || help };
  }
  const cleaned = message.replace(FILEPATH_WITH_LOCATION_PATTERN, "").trim();
  return {
    message: cleaned || message,
    help: help || RULE_HELP_MAP[rule] || "",
  };
};

const parseRuleCode = (code: string): { plugin: string; rule: string } => {
  const match = code.match(/^(.+)\((.+)\)$/);
  if (!match) return { plugin: "unknown", rule: code };
  return { plugin: match[1].replace(/^eslint-plugin-/, ""), rule: match[2] };
};

const resolveOxlintBinary = (): string => {
  const oxlintMainPath = esmRequire.resolve("oxlint");
  const oxlintPackageDirectory = path.resolve(
    path.dirname(oxlintMainPath),
    "..",
  );
  return path.join(oxlintPackageDirectory, "bin", "oxlint");
};

const resolvePluginPath = (): string => {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const pluginPath = path.join(
    currentDirectory,
    "react-native-doctor-plugin.js",
  );
  if (fs.existsSync(pluginPath)) return pluginPath;

  const distPluginPath = path.resolve(
    currentDirectory,
    "../../dist/react-native-doctor-plugin.js",
  );
  if (fs.existsSync(distPluginPath)) return distPluginPath;

  return pluginPath;
};

const resolveDiagnosticCategory = (plugin: string, rule: string): string => {
  const ruleKey = `${plugin}/${rule}`;
  return RULE_CATEGORY_MAP[ruleKey] ?? PLUGIN_CATEGORY_MAP[plugin] ?? "Other";
};

export const runOxlint = async (
  rootDirectory: string,
  hasTypeScript: boolean,
  framework: Framework,
  hasReactCompiler: boolean,
  isReactNative: boolean,
  isExpo: boolean,
  includePaths?: string[],
): Promise<Diagnostic[]> => {
  if (includePaths !== undefined && includePaths.length === 0) {
    return [];
  }

  const configPath = path.join(
    os.tmpdir(),
    `react-native-doctor-oxlintrc-${process.pid}.json`,
  );
  const pluginPath = resolvePluginPath();
  const config = createOxlintConfig({
    pluginPath,
    framework,
    hasReactCompiler,
    isReactNative,
    isExpo,
  });
  const restoreDisableDirectives = neutralizeDisableDirectives(rootDirectory);

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const oxlintBinary = resolveOxlintBinary();
    const args = [oxlintBinary, "-c", configPath, "--format", "json"];

    if (hasTypeScript) {
      args.push("--tsconfig", "./tsconfig.json");
    }

    if (includePaths !== undefined) {
      args.push(...includePaths);
    } else {
      args.push(".");
    }

    const stdout = await new Promise<string>((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        cwd: rootDirectory,
      });

      const stdoutBuffers: Buffer[] = [];
      const stderrBuffers: Buffer[] = [];

      child.stdout.on("data", (buffer: Buffer) => stdoutBuffers.push(buffer));
      child.stderr.on("data", (buffer: Buffer) => stderrBuffers.push(buffer));

      child.on("error", (error) =>
        reject(new Error(`Failed to run oxlint: ${error.message}`)),
      );
      child.on("close", () => {
        const output = Buffer.concat(stdoutBuffers).toString("utf-8").trim();
        if (!output) {
          const stderrOutput = Buffer.concat(stderrBuffers)
            .toString("utf-8")
            .trim();
          if (stderrOutput) {
            reject(new Error(`Failed to run oxlint: ${stderrOutput}`));
            return;
          }
        }
        resolve(output);
      });
    });

    if (!stdout) {
      return [];
    }

    let output: OxlintOutput;
    try {
      output = JSON.parse(stdout) as OxlintOutput;
    } catch {
      throw new Error(
        `Failed to parse oxlint output: ${stdout.slice(
          0,
          ERROR_PREVIEW_LENGTH_CHARS,
        )}`,
      );
    }

    return output.diagnostics
      .filter(
        (diagnostic) =>
          diagnostic.code && JSX_FILE_PATTERN.test(diagnostic.filename),
      )
      .map((diagnostic) => {
        const { plugin, rule } = parseRuleCode(diagnostic.code);
        const primaryLabel = diagnostic.labels[0];

        const cleaned = cleanDiagnosticMessage(
          diagnostic.message,
          diagnostic.help,
          plugin,
          rule,
        );

        return {
          filePath: diagnostic.filename,
          plugin,
          rule,
          severity: diagnostic.severity,
          message: cleaned.message,
          help: cleaned.help,
          line: primaryLabel?.span.line ?? 0,
          column: primaryLabel?.span.column ?? 0,
          category: resolveDiagnosticCategory(plugin, rule),
        };
      });
  } finally {
    restoreDisableDirectives();
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
};
