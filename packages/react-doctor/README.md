# react-native-doctor

[![version](https://img.shields.io/npm/v/react-native-doctor?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/react-native-doctor)

Diagnose and fix performance, accessibility, and architecture issues in your React Native & Expo app.

One command scans your codebase across **75+ rules** and outputs a **0–100 score** with actionable diagnostics.

## Install

Run this at your project root:

```bash
npx -y react-native-doctor@latest .
```

Use `--verbose` to see affected files and line numbers:

```bash
npx -y react-native-doctor@latest . --verbose
```

## Install as a skill

Add react-native-doctor's rules as a [skill](https://skills.sh) for your coding agent:

```bash
npx skills add yousefalwahami/react-native-doctor
```

This gives agents like Cursor, Claude Code, Copilot, and others access to all 75+ React Native best practice rules. The CLI will also prompt to install the skill on first run.

## Options

```
Usage: react-native-doctor [directory] [options]

Options:
  -v, --version      display the version number
  --no-lint          skip linting
  --no-dead-code     skip dead code detection
  --verbose          show file details per rule
  --score            output only the score
  -y, --yes          skip prompts, scan all workspace projects
  --project <name>   select workspace project (comma-separated for multiple)
  --diff [base]      scan only files changed vs base branch
  --fix              open Ami to auto-fix all issues
  --prompt           copy latest scan output to clipboard
  --expo-only        force-enable Expo rules even if expo is not detected
  --rn-only          force-enable React Native rules even if react-native is not detected
  -h, --help         display help for command
```

## Rules

Rules are automatically enabled based on your project dependencies (`react-native`, `expo`, `expo-router`).

### React Native

| Rule                                  | Severity | Description                                                                   |
| ------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `rn-no-raw-text`                      | error    | Raw text outside `<Text>` crashes React Native                                |
| `rn-no-deprecated-modules`            | error    | Removed APIs (AlertIOS, DatePickerIOS, etc.)                                  |
| `rn-no-dimensions-get`                | warn     | `Dimensions.get()` doesn't update on rotation — use `useWindowDimensions()`   |
| `rn-no-inline-flatlist-renderitem`    | warn     | Inline `renderItem` creates a new function reference every render             |
| `rn-flatlist-missing-keyextractor`    | warn     | Missing `keyExtractor` causes unnecessary re-renders                          |
| `rn-scrollview-for-long-lists`        | warn     | `ScrollView` + `.map()` renders all items — use `FlatList` for virtualization |
| `rn-image-missing-dimensions`         | warn     | `<Image>` without explicit dimensions causes layout shifts                    |
| `rn-inline-style-in-render`           | warn     | Inline style objects are recreated on every render                            |
| `rn-missing-memo-on-list-item`        | warn     | List item components should be wrapped in `React.memo()`                      |
| `rn-heavy-computation-in-render`      | warn     | Long array chains (filter/sort/map) in render body                            |
| `rn-avoid-anonymous-functions-in-jsx` | warn     | Anonymous functions on event props create new references every render         |
| `rn-prefer-reanimated`                | warn     | `Animated` from react-native runs on the JS thread                            |
| `rn-no-legacy-shadow-styles`          | warn     | iOS-only shadow properties — use `boxShadow` instead                          |
| `rn-no-single-element-style-array`    | warn     | Single-element style array — unwrap to avoid unnecessary allocation           |
| `rn-no-legacy-expo-packages`          | warn     | Deprecated expo-\* packages with newer replacements                           |

### Accessibility

| Rule                                       | Severity | Description                                                          |
| ------------------------------------------ | -------- | -------------------------------------------------------------------- |
| `rn-touchable-missing-accessibility-label` | error    | Touchable elements must have `accessibilityLabel`                    |
| `rn-missing-accessibility-role`            | warn     | Interactive elements should have `accessibilityRole`                 |
| `rn-non-descriptive-accessibility-label`   | warn     | Generic labels ("button", "tap here") don't help screen reader users |
| `rn-image-missing-accessible`              | warn     | Images should have `accessible` + `accessibilityLabel`               |
| `rn-touchable-hitslop-missing`             | warn     | Small tap targets (< 44pt) should add `hitSlop`                      |

### Architecture

| Rule                       | Severity | Description                                                      |
| -------------------------- | -------- | ---------------------------------------------------------------- |
| `rn-hardcoded-colors`      | warn     | 3+ hardcoded hex colors — extract to a theme                     |
| `rn-platform-os-branching` | warn     | 3+ `Platform.OS` checks — split into `.ios.tsx` / `.android.tsx` |
| `rn-use-window-dimensions` | warn     | Hardcoded screen dimensions — use `useWindowDimensions()`        |
| `rn-prop-drilling-depth`   | warn     | `{...props}` spread into children — use context or a store       |
| `rn-god-component`         | warn     | Large components with many `useState`/`useEffect` hooks          |
| `rn-unnecessary-useeffect` | warn     | `useEffect` that only sets derived state — compute inline        |

### Navigation (React Navigation)

| Rule                                 | Severity | Description                                                      |
| ------------------------------------ | -------- | ---------------------------------------------------------------- |
| `rn-navigator-inline-component`      | warn     | Inline component on `Stack.Screen` remounts on every render      |
| `rn-missing-screen-options-defaults` | warn     | Navigator without `screenOptions` — inconsistent screen defaults |

### Expo

| Rule                                        | Severity | Description                                                             |
| ------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `expo-hardcoded-api-keys`                   | error    | API keys in source code should be in `app.config.js`                    |
| `expo-missing-dark-mode-support`            | warn     | Hardcoded colors without `useColorScheme()` dark mode support           |
| `expo-constants-misuse`                     | warn     | `Constants.manifest` was removed in SDK 50 — use `Constants.expoConfig` |
| `expo-router-layout-missing-error-boundary` | warn     | `_layout.tsx` missing `ErrorBoundary` export                            |
| `expo-router-missing-not-found`             | warn     | Missing `app/+not-found.tsx` for unhandled deep link routes             |

## Configuration

Create a `react-native-doctor.config.json` in your project root to customize behavior:

```json
{
  "ignore": {
    "rules": ["react/no-danger", "jsx-a11y/no-autofocus", "knip/exports"],
    "files": ["src/generated/**"]
  }
}
```

You can also use the `"reactNativeDoctor"` key in your `package.json` instead:

```json
{
  "reactNativeDoctor": {
    "ignore": {
      "rules": ["react/no-danger"]
    }
  }
}
```

### Config options

| Key            | Type                | Default | Description                                                                                                                         |
| -------------- | ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ignore.rules` | `string[]`          | `[]`    | Rules to suppress, using the `plugin/rule` format shown in diagnostic output (e.g. `react/no-danger`, `knip/exports`, `knip/types`) |
| `ignore.files` | `string[]`          | `[]`    | File paths to exclude, supports glob patterns (`src/generated/**`, `**/*.test.tsx`)                                                 |
| `lint`         | `boolean`           | `true`  | Enable/disable lint checks (same as `--no-lint`)                                                                                    |
| `deadCode`     | `boolean`           | `true`  | Enable/disable dead code detection (same as `--no-dead-code`)                                                                       |
| `verbose`      | `boolean`           | `false` | Show file details per rule (same as `--verbose`)                                                                                    |
| `diff`         | `boolean \| string` | —       | Force diff mode (`true`) or pin a base branch (`"main"`). Set to `false` to disable auto-detection.                                 |

CLI flags always override config values.

## Node.js API

You can also use react-native-doctor programmatically:

```js
import { diagnose } from "react-native-doctor/api";

const result = await diagnose("./path/to/your/react-native-project");

console.log(result.score); // { score: 82, label: "Good" } or null
console.log(result.diagnostics); // Array of Diagnostic objects
console.log(result.project); // Detected framework, React version, etc.
```

Each diagnostic has the following shape:

```ts
interface Diagnostic {
  filePath: string;
  plugin: string;
  rule: string;
  severity: "error" | "warning";
  message: string;
  help: string;
  line: number;
  column: number;
  category: string;
}
```

## Score

- **75+**: Great
- **50–74**: Needs work
- **0–49**: Critical

## Contributing

```bash
git clone https://github.com/yousefalwahami/react-native-doctor
cd react-native-doctor
pnpm install
pnpm -r run build
```

Run locally:

```bash
node packages/react-doctor/dist/cli.js /path/to/your/react-native-project
```

### License

react-native-doctor is MIT-licensed open-source software.
