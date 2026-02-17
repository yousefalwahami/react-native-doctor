export const GIANT_COMPONENT_LINE_THRESHOLD = 300;
export const CASCADING_SET_STATE_THRESHOLD = 3;
export const RELATED_USE_STATE_THRESHOLD = 5;
export const DEEP_NESTING_THRESHOLD = 3;
export const DUPLICATE_STORAGE_READ_THRESHOLD = 2;
export const SEQUENTIAL_AWAIT_THRESHOLD = 3;
export const SECRET_MIN_LENGTH_CHARS = 8;
export const AUTH_CHECK_LOOKAHEAD_STATEMENTS = 3;

export const LAYOUT_PROPERTIES = new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "borderWidth",
  "fontSize",
  "lineHeight",
  "gap",
]);

export const MOTION_ANIMATE_PROPS = new Set([
  "animate",
  "initial",
  "exit",
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileDrag",
  "whileInView",
]);

export const HEAVY_LIBRARIES = new Set([
  "@monaco-editor/react",
  "monaco-editor",
  "recharts",
  "@react-pdf/renderer",
  "react-quill",
  "@codemirror/view",
  "@codemirror/state",
  "chart.js",
  "react-chartjs-2",
  "@toast-ui/editor",
  "draft-js",
]);

export const FETCH_CALLEE_NAMES = new Set(["fetch"]);
export const FETCH_MEMBER_OBJECTS = new Set(["axios", "ky", "got"]);
export const INDEX_PARAMETER_NAMES = new Set(["index", "idx", "i"]);
export const BARREL_INDEX_SUFFIXES = [
  "/index",
  "/index.js",
  "/index.ts",
  "/index.tsx",
  "/index.mjs",
];
export const PASSIVE_EVENT_NAMES = new Set([
  "scroll",
  "wheel",
  "touchstart",
  "touchmove",
  "touchend",
]);

export const LOOP_TYPES = [
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "WhileStatement",
  "DoWhileStatement",
];

export const AUTH_FUNCTION_NAMES = new Set([
  "auth",
  "getSession",
  "getServerSession",
  "getUser",
  "requireAuth",
  "checkAuth",
  "verifyAuth",
  "authenticate",
  "currentUser",
  "getAuth",
  "validateSession",
]);

export const SECRET_PATTERNS = [
  /^sk_live_/,
  /^sk_test_/,
  /^AKIA[0-9A-Z]{16}$/,
  /^ghp_[a-zA-Z0-9]{36}$/,
  /^gho_[a-zA-Z0-9]{36}$/,
  /^github_pat_/,
  /^glpat-/,
  /^xox[bporas]-/,
  /^sk-[a-zA-Z0-9]{32,}$/,
];

export const SECRET_VARIABLE_PATTERN = /(?:api_?key|secret|token|password|credential|auth)/i;

export const SECRET_FALSE_POSITIVE_SUFFIXES = new Set([
  "modal",
  "label",
  "text",
  "title",
  "name",
  "id",
  "key",
  "url",
  "path",
  "route",
  "page",
  "param",
  "field",
  "column",
  "header",
  "placeholder",
  "description",
  "type",
  "icon",
  "class",
  "style",
  "variant",
  "event",
  "action",
  "status",
  "state",
  "mode",
  "flag",
  "option",
  "config",
  "message",
  "error",
  "display",
  "view",
  "component",
  "element",
  "container",
  "wrapper",
  "button",
  "link",
  "input",
  "select",
  "dialog",
  "menu",
  "form",
  "step",
  "index",
  "count",
  "length",
  "role",
  "scope",
  "context",
  "provider",
  "ref",
  "handler",
  "query",
  "schema",
  "constant",
]);

export const LOADING_STATE_PATTERN = /^(?:isLoading|isPending)$/;

export const GENERIC_EVENT_SUFFIXES = new Set(["Click", "Change", "Input", "Blur", "Focus"]);

export const TRIVIAL_INITIALIZER_NAMES = new Set([
  "Boolean",
  "String",
  "Number",
  "Array",
  "Object",
  "parseInt",
  "parseFloat",
]);

export const SETTER_PATTERN = /^set[A-Z]/;
export const RENDER_FUNCTION_PATTERN = /^render[A-Z]/;
export const UPPERCASE_PATTERN = /^[A-Z]/;
export const PAGE_FILE_PATTERN = /\/page\.(tsx?|jsx?)$/;
export const PAGE_OR_LAYOUT_FILE_PATTERN = /\/(page|layout)\.(tsx?|jsx?)$/;

export const INTERNAL_PAGE_PATH_PATTERN =
  /\/(?:(?:\((?:dashboard|admin|settings|account|internal|manage|console|portal|auth|onboarding|app|ee|protected)\))|(?:dashboard|admin|settings|account|internal|manage|console|portal))\//i;

export const TEST_FILE_PATTERN = /\.(?:test|spec|stories)\.[tj]sx?$/;
export const OG_ROUTE_PATTERN = /\/og\b/i;

export const PAGES_DIRECTORY_PATTERN = /\/pages\//;
export const SERVER_ACTION_FILE_PATTERN = /actions?\.(tsx?|jsx?)$/;
export const SERVER_ACTION_DIRECTORY_PATTERN = /\/actions\//;

export const NEXTJS_NAVIGATION_FUNCTIONS = new Set([
  "redirect",
  "permanentRedirect",
  "notFound",
  "forbidden",
  "unauthorized",
]);

export const GOOGLE_FONTS_PATTERN = /fonts\.googleapis\.com/;

export const POLYFILL_SCRIPT_PATTERN = /polyfill\.io|polyfill\.min\.js|cdn\.polyfill/;

export const APP_DIRECTORY_PATTERN = /\/app\//;

export const ROUTE_HANDLER_FILE_PATTERN = /\/route\.(tsx?|jsx?)$/;

export const MUTATION_METHOD_NAMES = new Set([
  "create",
  "insert",
  "insertInto",
  "update",
  "upsert",
  "delete",
  "remove",
  "destroy",
  "set",
  "append",
]);

export const MUTATING_HTTP_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

export const MUTATING_ROUTE_SEGMENTS = new Set([
  "logout",
  "log-out",
  "signout",
  "sign-out",
  "unsubscribe",
  "delete",
  "remove",
  "revoke",
  "cancel",
  "deactivate",
]);

export const EFFECT_HOOK_NAMES = new Set(["useEffect", "useLayoutEffect"]);
export const HOOKS_WITH_DEPS = new Set(["useEffect", "useLayoutEffect", "useMemo", "useCallback"]);
export const CHAINABLE_ITERATION_METHODS = new Set(["map", "filter", "forEach", "flatMap"]);
export const STORAGE_OBJECTS = new Set(["localStorage", "sessionStorage"]);

export const LARGE_BLUR_THRESHOLD_PX = 10;
export const BLUR_VALUE_PATTERN = /blur\((\d+(?:\.\d+)?)px\)/;
export const ANIMATION_CALLBACK_NAMES = new Set(["requestAnimationFrame", "setInterval"]);
export const MOTION_LIBRARY_PACKAGES = new Set(["framer-motion", "motion"]);
