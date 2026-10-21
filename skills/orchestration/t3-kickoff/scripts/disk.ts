import { statfsSync } from "node:fs";
import { homedir } from "node:os";

const gigabyte = 1024 ** 3;
/** One worktree of a large repository, such as PostHog, takes 5 to 8 GB, more after a build. Below this, one more can fill the disk. */
const minFreeGigabytes = 10;

export function freeBytes(path = homedir()): number {
  const stats = statfsSync(path);
  return stats.bavail * stats.bsize;
}

export function assertDiskRoom(free = freeBytes()): void {
  if (free >= minFreeGigabytes * gigabyte) return;
  throw new Error(`Only ${(free / gigabyte).toFixed(1)}G free on this machine, below ${minFreeGigabytes}G. A new worktree can fill the disk and crash T3 and every thread on it. Free space first, or launch with --worktree none or on another machine.`);
}
