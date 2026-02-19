interface LeaderboardEntry {
  name: string;
  githubUrl: string;
  packageName: string;
  score: number;
  errorCount: number;
  warningCount: number;
  fileCount: number;
}

const buildShareUrl = (entry: LeaderboardEntry): string => {
  const searchParams = new URLSearchParams({
    p: entry.packageName,
    s: String(entry.score),
    e: String(entry.errorCount),
    w: String(entry.warningCount),
    f: String(entry.fileCount),
  });
  return `/share?${searchParams.toString()}`;
};

const RAW_ENTRIES: LeaderboardEntry[] = [
  {
    name: "react-native-mmkv",
    githubUrl: "https://github.com/mrousavy/react-native-mmkv",
    packageName: "react-native-mmkv",
    score: 83,
    errorCount: 2,
    warningCount: 89,
    fileCount: 51,
  },
  {
    name: "reanimated",
    githubUrl: "https://github.com/software-mansion/react-native-reanimated",
    packageName: "react-native-reanimated",
    score: 81,
    errorCount: 6,
    warningCount: 142,
    fileCount: 98,
  },
  {
    name: "react-navigation",
    githubUrl: "https://github.com/react-navigation/react-navigation",
    packageName: "@react-navigation/core",
    score: 79,
    errorCount: 9,
    warningCount: 187,
    fileCount: 134,
  },
  {
    name: "restyle",
    githubUrl: "https://github.com/Shopify/restyle",
    packageName: "@shopify/restyle",
    score: 78,
    errorCount: 11,
    warningCount: 211,
    fileCount: 143,
  },
  {
    name: "expo",
    githubUrl: "https://github.com/expo/expo",
    packageName: "expo",
    score: 76,
    errorCount: 18,
    warningCount: 241,
    fileCount: 189,
  },
  {
    name: "react-native-paper",
    githubUrl: "https://github.com/callstack/react-native-paper",
    packageName: "react-native-paper",
    score: 74,
    errorCount: 22,
    warningCount: 276,
    fileCount: 201,
  },
  {
    name: "react-native",
    githubUrl: "https://github.com/facebook/react-native",
    packageName: "react-native",
    score: 72,
    errorCount: 44,
    warningCount: 318,
    fileCount: 210,
  },
  {
    name: "gesture-handler",
    githubUrl:
      "https://github.com/software-mansion/react-native-gesture-handler",
    packageName: "react-native-gesture-handler",
    score: 73,
    errorCount: 27,
    warningCount: 298,
    fileCount: 178,
  },
  {
    name: "vision-camera",
    githubUrl: "https://github.com/mrousavy/react-native-vision-camera",
    packageName: "react-native-vision-camera",
    score: 69,
    errorCount: 33,
    warningCount: 341,
    fileCount: 187,
  },
  {
    name: "WatermelonDB",
    githubUrl: "https://github.com/Nozbe/WatermelonDB",
    packageName: "@nozbe/watermelondb",
    score: 67,
    errorCount: 38,
    warningCount: 402,
    fileCount: 218,
  },
  {
    name: "react-native-svg",
    githubUrl: "https://github.com/software-mansion/react-native-svg",
    packageName: "react-native-svg",
    score: 65,
    errorCount: 47,
    warningCount: 456,
    fileCount: 234,
  },
  {
    name: "react-native-firebase",
    githubUrl: "https://github.com/invertase/react-native-firebase",
    packageName: "@react-native-firebase/app",
    score: 62,
    errorCount: 58,
    warningCount: 531,
    fileCount: 289,
  },
];

export interface ResolvedLeaderboardEntry extends LeaderboardEntry {
  shareUrl: string;
}

export const LEADERBOARD_ENTRIES: ResolvedLeaderboardEntry[] = RAW_ENTRIES.sort(
  (entryA, entryB) => entryB.score - entryA.score,
).map((entry) => ({ ...entry, shareUrl: buildShareUrl(entry) }));
