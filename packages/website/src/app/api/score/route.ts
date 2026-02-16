const PERFECT_SCORE = 100;
const ERROR_RULE_PENALTY = 1.5;
const WARNING_RULE_PENALTY = 0.75;
const SCORE_GOOD_THRESHOLD = 75;
const SCORE_OK_THRESHOLD = 50;

interface DiagnosticInput {
  plugin: string;
  rule: string;
  severity: "error" | "warning";
}

const getScoreLabel = (score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return "Great";
  if (score >= SCORE_OK_THRESHOLD) return "Needs work";
  return "Critical";
};

const calculateScore = (diagnostics: DiagnosticInput[]): number => {
  if (diagnostics.length === 0) return PERFECT_SCORE;

  const errorRules = new Set<string>();
  const warningRules = new Set<string>();

  for (const diagnostic of diagnostics) {
    const ruleKey = `${diagnostic.plugin}/${diagnostic.rule}`;
    if (diagnostic.severity === "error") {
      errorRules.add(ruleKey);
    } else {
      warningRules.add(ruleKey);
    }
  }

  const penalty = errorRules.size * ERROR_RULE_PENALTY + warningRules.size * WARNING_RULE_PENALTY;

  return Math.max(0, Math.round(PERFECT_SCORE - penalty));
};

const isValidDiagnostic = (value: unknown): value is DiagnosticInput => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.plugin === "string" &&
    typeof record.rule === "string" &&
    (record.severity === "error" || record.severity === "warning")
  );
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const OPTIONS = (): Response => new Response(null, { status: 204, headers: CORS_HEADERS });

export const POST = async (request: Request): Promise<Response> => {
  const body = await request.json().catch(() => null);

  if (!body || !Array.isArray(body.diagnostics)) {
    return Response.json(
      { error: "Request body must contain a 'diagnostics' array" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const isValidPayload = body.diagnostics.every((entry: unknown) => isValidDiagnostic(entry));

  if (!isValidPayload) {
    return Response.json(
      {
        error:
          "Each diagnostic must have 'plugin' (string), 'rule' (string), and 'severity' ('error' | 'warning')",
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const score = calculateScore(body.diagnostics);

  return Response.json({ score, label: getScoreLabel(score) }, { headers: CORS_HEADERS });
};
