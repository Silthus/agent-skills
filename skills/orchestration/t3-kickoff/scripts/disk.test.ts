import { expect, test } from "bun:test";
import { assertDiskRoom } from "./disk.ts";

const gigabyte = 1024 ** 3;

test("a new worktree needs 10 GB free on the machine", () => {
  expect(() => assertDiskRoom(9.2 * gigabyte)).toThrow("Only 9.2G free on this machine, below 10G. A new worktree can fill the disk and crash T3 and every thread on it. Free space first, or launch with --worktree none or on another machine.");
  expect(() => assertDiskRoom(10 * gigabyte - 1)).toThrow();
  expect(() => assertDiskRoom(10 * gigabyte)).not.toThrow();
});
