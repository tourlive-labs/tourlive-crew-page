// src/types/mission.ts

// ─── Mission Status (missions table) ─────────────────────────────────────────

/**
 * Canonical status values for the `missions` table.
 * NOTE: The DB historically stored both 'rejected' and 'REJECTED'.
 *       Always read through normalizeMissionStatus() to get a canonical value.
 */
export const MissionStatus = {
  /** Link submitted, AI-verified, waiting for user to click "완료 제출" */
  CHECKING: 'checking',
  /** User submitted for admin review */
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  /** Admin approved — mission complete */
  COMPLETED: 'completed',
  /** Admin or AI rejected */
  REJECTED: 'REJECTED',
  /** Virtual/UI-only — no mission row exists for this month */
  NONE: 'none',
} as const;

export type MissionStatus = typeof MissionStatus[keyof typeof MissionStatus];

// ─── Side Mission Status (side_missions table) ────────────────────────────────

export const SideMissionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type SideMissionStatus = typeof SideMissionStatus[keyof typeof SideMissionStatus];

// ─── Stamp Status (UI-only, displayed in the stamp card) ─────────────────────

export const StampStatus = {
  NONE: 'none',
  PENDING: 'pending',
  APPROVED: 'approved',
} as const;

export type StampStatus = typeof StampStatus[keyof typeof StampStatus];

// ─── Schedule Status (UI-only, activity schedule items) ──────────────────────

export const ScheduleStatus = {
  COMPLETED: 'completed',
  ONGOING: 'ongoing',
  PENDING: 'pending',
} as const;

export type ScheduleStatus = typeof ScheduleStatus[keyof typeof ScheduleStatus];

// ─── Mapper / Normalizer functions ───────────────────────────────────────────

/**
 * Normalizes a raw DB mission status string to a canonical MissionStatus.
 * Handles the legacy lowercase 'rejected' variant.
 */
export function normalizeMissionStatus(raw: string | null | undefined): MissionStatus {
  if (!raw || raw === MissionStatus.NONE) return MissionStatus.NONE;
  // Normalize legacy lowercase variant
  if (raw.toLowerCase() === 'rejected') return MissionStatus.REJECTED;
  const values = Object.values(MissionStatus) as string[];
  if (values.includes(raw)) return raw as MissionStatus;
  // Unknown value — treat as NONE (no valid state)
  console.warn(`[normalizeMissionStatus] Unknown status value: "${raw}"`);
  return MissionStatus.NONE;
}

/**
 * Normalizes a raw DB side mission status string to a canonical SideMissionStatus.
 */
export function normalizeSideMissionStatus(raw: string | null | undefined): SideMissionStatus {
  if (!raw) return SideMissionStatus.PENDING;
  const values = Object.values(SideMissionStatus) as string[];
  if (values.includes(raw)) return raw as SideMissionStatus;
  console.warn(`[normalizeSideMissionStatus] Unknown status value: "${raw}"`);
  return SideMissionStatus.PENDING;
}

/**
 * Converts a normalized MissionStatus → UI StampStatus.
 */
export function missionStatusToStamp(status: MissionStatus): StampStatus {
  if (status === MissionStatus.COMPLETED) return StampStatus.APPROVED;
  if (status === MissionStatus.PENDING_APPROVAL) return StampStatus.PENDING;
  return StampStatus.NONE;
}

/**
 * Converts a normalized SideMissionStatus → UI StampStatus.
 */
export function sideMissionStatusToStamp(status: SideMissionStatus): StampStatus {
  if (status === SideMissionStatus.APPROVED) return StampStatus.APPROVED;
  if (status === SideMissionStatus.PENDING) return StampStatus.PENDING;
  return StampStatus.NONE;
}

/**
 * Returns true if the mission is in a terminal "done" state (approved or rejected).
 */
export function isMissionTerminal(status: MissionStatus): boolean {
  return status === MissionStatus.COMPLETED || status === MissionStatus.REJECTED;
}

/**
 * Returns true if the mission has been approved by admin.
 */
export function isMissionApproved(status: MissionStatus): boolean {
  return status === MissionStatus.COMPLETED;
}
