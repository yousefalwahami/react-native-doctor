import type { Metadata } from "next";
import Link from "next/link";

const PERFECT_SCORE = 100;
const SCORE_GOOD_THRESHOLD = 75;
const SCORE_OK_THRESHOLD = 50;
const SCORE_BAR_WIDTH = 20;
const COMMAND = "npx -y react-doctor@latest .";

interface LeaderboardEntry {
  name: string;
  githubUrl: string;
  score: number;
  errorCount: number;
  warningCount: number;
  fileCount: number;
  shareUrl: string;
}

const LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  {
    name: "tldraw",
    githubUrl: "https://github.com/tldraw/tldraw",
    score: 84,
    errorCount: 98,
    warningCount: 139,
    fileCount: 40,
    shareUrl: "/share?p=tldraw&s=84&e=98&w=139&f=40",
  },
  {
    name: "excalidraw",
    githubUrl: "https://github.com/excalidraw/excalidraw",
    score: 84,
    errorCount: 2,
    warningCount: 196,
    fileCount: 80,
    shareUrl: "/share?p=%40excalidraw%2Fexcalidraw&s=84&e=2&w=196&f=80",
  },
  {
    name: "twenty",
    githubUrl: "https://github.com/twentyhq/twenty",
    score: 78,
    errorCount: 99,
    warningCount: 293,
    fileCount: 268,
    shareUrl: "/share?p=twenty-front&s=78&e=99&w=293&f=268",
  },
  {
    name: "plane",
    githubUrl: "https://github.com/makeplane/plane",
    score: 78,
    errorCount: 7,
    warningCount: 525,
    fileCount: 292,
    shareUrl: "/share?p=web&s=78&e=7&w=525&f=292",
  },
  {
    name: "formbricks",
    githubUrl: "https://github.com/formbricks/formbricks",
    score: 75,
    errorCount: 15,
    warningCount: 389,
    fileCount: 242,
    shareUrl: "/share?p=%40formbricks%2Fweb&s=75&e=15&w=389&f=242",
  },
  {
    name: "posthog",
    githubUrl: "https://github.com/PostHog/posthog",
    score: 72,
    errorCount: 82,
    warningCount: 1177,
    fileCount: 585,
    shareUrl: "/share?p=%40posthog%2Ffrontend&s=72&e=82&w=1177&f=585",
  },
  {
    name: "supabase",
    githubUrl: "https://github.com/supabase/supabase",
    score: 69,
    errorCount: 74,
    warningCount: 1087,
    fileCount: 566,
    shareUrl: "/share?p=studio&s=69&e=74&w=1087&f=566",
  },
  {
    name: "onlook",
    githubUrl: "https://github.com/onlook-dev/onlook",
    score: 69,
    errorCount: 64,
    warningCount: 418,
    fileCount: 178,
    shareUrl: "/share?p=%40onlook%2Fweb-client&s=69&e=64&w=418&f=178",
  },
  {
    name: "payload",
    githubUrl: "https://github.com/payloadcms/payload",
    score: 68,
    errorCount: 139,
    warningCount: 408,
    fileCount: 298,
    shareUrl: "/share?p=%40payloadcms%2Fui&s=68&e=139&w=408&f=298",
  },
  {
    name: "sentry",
    githubUrl: "https://github.com/getsentry/sentry",
    score: 64,
    errorCount: 94,
    warningCount: 1345,
    fileCount: 818,
    shareUrl: "/share?p=sentry&s=64&e=94&w=1345&f=818",
  },
  {
    name: "cal.com",
    githubUrl: "https://github.com/calcom/cal.com",
    score: 63,
    errorCount: 31,
    warningCount: 558,
    fileCount: 311,
    shareUrl: "/share?p=%40calcom%2Fweb&s=63&e=31&w=558&f=311",
  },
  {
    name: "dub",
    githubUrl: "https://github.com/dubinc/dub",
    score: 62,
    errorCount: 52,
    warningCount: 966,
    fileCount: 457,
    shareUrl: "/share?p=web&s=62&e=52&w=966&f=457",
  },
];

const getScoreColorClass = (score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return "text-green-400";
  if (score >= SCORE_OK_THRESHOLD) return "text-yellow-500";
  return "text-red-400";
};

const getDoctorFace = (score: number): [string, string] => {
  if (score >= SCORE_GOOD_THRESHOLD) return ["◠ ◠", " ▽ "];
  if (score >= SCORE_OK_THRESHOLD) return ["• •", " ─ "];
  return ["x x", " ▽ "];
};

const MAX_NAME_LENGTH = 12;

const ScoreBar = ({ score }: { score: number }) => {
  const filledCount = Math.round((score / PERFECT_SCORE) * SCORE_BAR_WIDTH);
  const emptyCount = SCORE_BAR_WIDTH - filledCount;
  const colorClass = getScoreColorClass(score);

  return (
    <span className="text-xs sm:text-sm">
      <span className={colorClass}>{"█".repeat(filledCount)}</span>
      <span className="text-neutral-700">{"░".repeat(emptyCount)}</span>
    </span>
  );
};

const LeaderboardRow = ({ entry, rank }: { entry: LeaderboardEntry; rank: number }) => {
  const colorClass = getScoreColorClass(entry.score);
  const paddedName = entry.name.padEnd(MAX_NAME_LENGTH);

  return (
    <div className="group flex items-center gap-2 border-b border-white/5 py-2 transition-colors hover:bg-white/2 sm:gap-4 sm:py-2.5">
      <span className="w-6 shrink-0 text-right text-neutral-600 sm:w-8">{rank}</span>

      <a
        href={entry.githubUrl}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 text-white transition-colors hover:text-blue-400"
      >
        <span className="sm:hidden">
          {entry.name.length > 10 ? `${entry.name.slice(0, 9)}…` : entry.name}
        </span>
        <span className="hidden sm:inline">{paddedName}</span>
      </a>

      <span className="hidden flex-1 sm:inline">
        <ScoreBar score={entry.score} />
      </span>

      <Link href={entry.shareUrl} className="ml-auto shrink-0 transition-colors hover:underline">
        <span className={`${colorClass} font-medium`}>{entry.score}</span>
        <span className="text-neutral-600">/{PERFECT_SCORE}</span>
      </Link>
    </div>
  );
};

export const metadata: Metadata = {
  title: "Leaderboard - React Doctor",
  description: "Scores for popular open-source React projects, diagnosed by React Doctor.",
};

const LeaderboardPage = () => {
  const topScore = LEADERBOARD_ENTRIES[0]?.score ?? 0;
  const [eyes, mouth] = getDoctorFace(topScore);
  const topScoreColor = getScoreColorClass(topScore);

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-[#0a0a0a] p-6 pb-32 font-mono text-base leading-relaxed text-neutral-300 sm:p-8 sm:pb-40 sm:text-lg">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-500 transition-colors hover:text-neutral-300"
        >
          <img src="/favicon.svg" alt="React Doctor" width={20} height={20} />
          <span>react-doctor</span>
        </Link>
      </div>

      <div className="mb-2">
        <pre className={`${topScoreColor} leading-tight`}>
          {`  ┌─────┐\n  │ ${eyes} │\n  │ ${mouth} │\n  └─────┘`}
        </pre>
      </div>

      <div className="mb-1 text-xl text-white">Leaderboard</div>
      <div className="mb-8 text-neutral-500">Scores for popular open-source React projects.</div>

      <div className="mb-8">
        {LEADERBOARD_ENTRIES.map((entry, index) => (
          <LeaderboardRow key={entry.name} entry={entry} rank={index + 1} />
        ))}
      </div>

      <div className="min-h-[1.4em]" />

      <div className="text-neutral-500">Run it on your codebase:</div>
      <div className="mt-2">
        <span className="border border-white/20 px-3 py-1.5 text-white">{COMMAND}</span>
      </div>
    </div>
  );
};

export default LeaderboardPage;
