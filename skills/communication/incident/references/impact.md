# Impact checklist

Measure every dimension, with numbers pinned as `SKILL.md` defines them.

## Scope

- **Window.** Start and end in UTC, from the first failure to the last one. When the failure shape differs from the fix time, give both, such as "events missing from 13:50, bleeding stopped at 14:20".
- **Teams and organizations hit.** The count, out of the teams that use the feature at all.
- **Regions.** Each region apart, then the total.
- **Internal team.** Count the company's own team apart. It can be most of the volume and hide how few customers were hit, or the other way round.
- **Since when.** When the failing code shipped. A failure that started weeks before anyone saw it is a bigger incident than its first report.

## What failed, from the customer's side

- **Hit versus affected.** "Marked failed in our logs" and "the customer lost something" are different counts. For each item hit, follow what happened next: did the run go on, stop at its last step, or miss later steps? Report the affected count beside the hit count, with the reason for the gap.
- **Kinds of use.** Split by the kinds of use the product has, such as transactional, marketing, and broadcast sends. Test the lead's expectation of which kinds were hit against the data. Keep items whose lookup records were deleted since: a join against current tables drops them. Take their kind from the logs, or count them as unknown.
- **Sent but not tracked versus never sent.** A message that went out without tracking is not a lost message. A message that was never sent is.
- **Records that lie.** An item can succeed and be recorded as failed, or fail and be recorded as succeeded. Check the record against a source outside it, such as the provider's send counter. A wrong record misleads the customer, their metrics, and any rerun.
- **Actions since the failure.** Reruns, resumes, and manual sends by customers or staff after the failure, and what they caused, such as a duplicate send.
- **Safety checks that did not run.** Caps, suppression lists, and suspensions that failed open. Count them apart; recovery cannot undo them.

## Downstream effects

Data the incident lost or delayed may feed things the customer built. For every lost event type, find who reads it:

- workflow and automation triggers
- wait-until and branch steps that wait for the event
- destinations and webhooks that forward it
- conversion goals and experiments
- cohorts built from it
- saved insights and dashboards that chart it

Report, per customer, what did not run on their side: "about 15 runs did not start", "a chart shows a dip from 13:50 to 14:20". This is the true customer impact.

## Recoverable versus lost

For each lost item, say which of these it is:

- **Recoverable**: we hold enough data to rebuild it.
- **Recoverable with risk**: it can be replayed, but a late replay may fire automations at the wrong time.
- **Lost**: no record exists, or the retention window has passed. Give the retention window's end date.

## Per customer

For the customer list: name, organization, region, account owner, revenue, and for each dimension above what they lost, what is recorded wrongly, and what they need to do. A placeholder owner, such as one person on most accounts, is probably a default queue; say so. Give the date of the revenue data when it is stale.
