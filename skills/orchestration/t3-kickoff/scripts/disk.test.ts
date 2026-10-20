import { expect, test } from "bun:test";
import { assertDiskRoom } from "./disk.ts";

const gigabyte = 1024 ** 3;

test("a new worktree needs 5 GB free on the machine", () => {
  expect(() => assertDiskRoom(4.2 * gigabyte)).toThrow("Only 4.2G free on this machine, below 5G. A new worktree can fill the disk and crash T3 and every thread on it. Free space first, or launch with --worktree none or on another machine.");
  expect(() => assertDiskRoom(5 * gigabyte)).not.toThrow();
});
