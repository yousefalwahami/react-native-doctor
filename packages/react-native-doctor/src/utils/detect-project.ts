import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface ProjectContext {
  isReactNative: boolean;
  isExpo: boolean;
  isExpoRouter: boolean;
  rnVersion: string | null;
  expoSdkVersion: string | null;
}

export const detectProject = (directory: string): ProjectContext => {
  const packageJsonPath = join(directory, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const isReactNative = "react-native" in allDependencies;
  const isExpo = "expo" in allDependencies;
  const isExpoRouter = "expo-router" in allDependencies;

  return {
    isReactNative,
    isExpo,
    isExpoRouter,
    rnVersion: allDependencies["react-native"] ?? null,
    expoSdkVersion: allDependencies["expo"] ?? null,
  };
};
