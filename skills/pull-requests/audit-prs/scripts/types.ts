// Shared types for the audit pipeline.

export type CiState = 'green' | 'pending' | 'awaiting-authorization' | 'cancelled' | 'failing' | 'none';
export type ReviewState = 'approved' | 'changes-requested' | 'review-required' | 'none';
export type Mergeable = 'MERGEABLE' | 'CONFLICTING' | 'UNKNOWN';

/** Report order, most urgent first. */
export const STATUSES = [
  'blocked',
  'changes-requested',
  'ready-to-merge',
  'waiting-ci-authorization',
  'waiting-ci',
  'ready-for-review',
  'draft',
] as const;
export type Status = (typeof STATUSES)[number];

export interface ThreadFacts {
  path: string | null;
  isOutdated: boolean;
  author: string;
  authorIsBot: boolean;
  body: string;
  lastAuthor: string;
  lastBody: string;
  lastAt: string;
  /** The last word in the thread is not the author's. */
  awaitingAuthor: boolean;
}

export interface CommentFacts {
  author: string;
  body: string;
  createdAt: string;
}

/** Everything we know about a PR from GitHub alone. No AI involved. */
export interface PrFacts {
  id: string;
  repo: string;
  number: number;
  title: string;
  url: string;
  body: string;
  isDraft: boolean;
  baseRef: string;
  headRef: string;
  headSha: string;
  createdAt: string;
  updatedAt: string;
  lastPushAt: string;
  /** Commits on the base branch that the PR does not have. Null when GitHub cannot compare. */
  behindBy: number | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  files: string[];
  labels: string[];
  review: ReviewState;
  approvers: string[];
  changeRequesters: string[];
  mergeable: Mergeable;
  mergeState: string;
  ci: {
    state: CiState;
    failing: string[];
    cancelled: string[];
    pending: string[];
    awaitingAuthorization: number;
    passed: number;
  };
  trunk: { managed: boolean; failed: boolean; message: string | null };
  /** Unresolved review threads only. */
  threads: ThreadFacts[];
  /** Recent top-level comments from humans other than the author. */
  humanComments: CommentFacts[];
  media: { images: number; gifs: number; videos: number };
  testFiles: string[];
  docsOnly: boolean;
}

/** Answers from Jev, as probabilities 0..1. Null when the PR did not raise the question. */
export interface JevAnswers {
  humanChangesPending: number | null;
  botFindingsSubstantive: number | null;
  draftFinished: number | null;
}

export const GRADES = ['low', 'medium', 'high'] as const;
export type Grade = (typeof GRADES)[number];

/** The areas and systems a change can touch. */
export const AREAS = ['ui', 'api', 'data', 'auth-billing', 'infra-ci', 'docs', 'tests'] as const;
export type Area = (typeof AREAS)[number];

/** What the agent read: the whole diff, a bounded excerpt, or only the file list when GitHub gives no diff. */
export type RiskBasis = 'full diff' | 'diff excerpt' | 'file list';

/** The agent's judgement of how safe a merge is, from the change itself. */
export interface RiskJudgement {
  /** Confidence that the merge is safe. High is safe. */
  level: Grade;
  /** One line that names the concrete risk. */
  reason: string;
  areas: Area[];
  userFacing: boolean;
  breakLikelihood: Grade;
  breakSeverity: Grade;
  basis: RiskBasis;
}

/** The agent's judgement, or `unscored` with the reason when nobody judged this head yet. */
export type Confidence = RiskJudgement | { level: 'unscored'; reason: string };

export interface TriagedPr {
  facts: PrFacts;
  status: Status;
  /** Only meaningful for drafts. */
  draftFinished: boolean;
  nextAction: string;
  reasons: string[];
  /** Deterministic warnings worth a look, whatever the status. */
  signals: string[];
  /** Judgement calls the agent must make because Jev could not. */
  openQuestions: string[];
  confidence: Confidence;
  jev: JevAnswers | null;
}
