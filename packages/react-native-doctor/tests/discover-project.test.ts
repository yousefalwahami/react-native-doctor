import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectProject } from "../src/utils/detect-project.js";
import {
  discoverProject,
  formatFrameworkName,
} from "../src/utils/discover-project.js";

const FIXTURES_DIRECTORY = path.resolve(import.meta.dirname, "fixtures");
const VALID_FRAMEWORKS = [
  "nextjs",
  "vite",
  "cra",
  "remix",
  "gatsby",
  "unknown",
];

describe("discoverProject", () => {
  it("detects React version from package.json", () => {
    const projectInfo = discoverProject(
      path.join(FIXTURES_DIRECTORY, "basic-react"),
    );
    expect(projectInfo.reactVersion).toBe("^19.0.0");
  });

  it("returns a valid framework", () => {
    const projectInfo = discoverProject(
      path.join(FIXTURES_DIRECTORY, "basic-react"),
    );
    expect(VALID_FRAMEWORKS).toContain(projectInfo.framework);
  });

  it("detects TypeScript when tsconfig.json exists", () => {
    const projectInfo = discoverProject(
      path.join(FIXTURES_DIRECTORY, "basic-react"),
    );
    expect(projectInfo.hasTypeScript).toBe(true);
  });

  it("detects React version from peerDependencies", () => {
    const projectInfo = discoverProject(
      path.join(FIXTURES_DIRECTORY, "component-library"),
    );
    expect(projectInfo.reactVersion).toBe("^18.0.0 || ^19.0.0");
  });

  it("throws when package.json is missing", () => {
    expect(() => discoverProject("/nonexistent/path")).toThrow(
      "No package.json found",
    );
  });
});

describe("detectProject", () => {
  it("detects isReactNative for react-native-app fixture", () => {
    const context = detectProject(
      path.join(FIXTURES_DIRECTORY, "react-native-app"),
    );
    expect(context.isReactNative).toBe(true);
  });

  it("detects isExpo for expo-app fixture", () => {
    const context = detectProject(path.join(FIXTURES_DIRECTORY, "expo-app"));
    expect(context.isExpo).toBe(true);
  });

  it("detects isExpoRouter for expo-app fixture", () => {
    const context = detectProject(path.join(FIXTURES_DIRECTORY, "expo-app"));
    expect(context.isExpoRouter).toBe(true);
  });

  it("returns isReactNative false for basic-react fixture", () => {
    const context = detectProject(path.join(FIXTURES_DIRECTORY, "basic-react"));
    expect(context.isReactNative).toBe(false);
  });

  it("returns correct rnVersion from package.json", () => {
    const context = detectProject(
      path.join(FIXTURES_DIRECTORY, "react-native-app"),
    );
    expect(context.rnVersion).toBe("0.73.0");
  });

  it("returns correct expoSdkVersion from package.json", () => {
    const context = detectProject(path.join(FIXTURES_DIRECTORY, "expo-app"));
    expect(context.expoSdkVersion).toBe("~52.0.0");
  });
});

describe("formatFrameworkName", () => {
  it("formats known frameworks", () => {
    expect(formatFrameworkName("nextjs")).toBe("Next.js");
    expect(formatFrameworkName("vite")).toBe("Vite");
    expect(formatFrameworkName("cra")).toBe("Create React App");
    expect(formatFrameworkName("remix")).toBe("Remix");
    expect(formatFrameworkName("gatsby")).toBe("Gatsby");
  });

  it("formats unknown framework as React", () => {
    expect(formatFrameworkName("unknown")).toBe("React");
  });
});
