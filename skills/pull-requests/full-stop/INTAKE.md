# Kickoff intake

Ask the user once, before work starts, for everything the lanes will need:
one question card for the inputs, then one secret card per secret the store
does not already hold. After intake, a lane asks again only per **Late
puts** below. Full-send's **Asking the user** applies after the intake.

Who runs it, and the **lane key** that owns its lane secrets:

- **A map**: the conductor, at the **Build-plan park** of
  `orchestration-wayfinder`, for every stack of the spec at once. The lane
  key is each stack ticket, `owner/repo#n`, since its lane does not exist
  yet.
- **A lane started on its own**, or an `implement` ticket without a
  `## Intake` section: the lane, at its kickoff (`full-stop`). The lane key
  is its ticket when it has one, else its own thread id; in T3 Code,
  `t3_thread_configuration` without a `threadId` returns it.

## Checklist

Pick the items for each lane's kinds of work, merge them across lanes, and
ask each item once. Leave out what the map, the ticket, or the user's agent
instructions already answer.

- **All work**: the proof plan, with each proof the user names; the tier
  forecast (`merge-risk` **Tier**); the merge route; the StampHog forecast,
  when the user's agent instructions name an approval bot.
- **SDK sends**: backend prerequisites and deploy order; the SDK branch and
  head matrix; region, test project, and sender; the recipient inbox and read
  access to it; the project key with its send scope; what "delivered" means;
  who releases.
- **Dark launch**: the flag key; the first identities; which hunks run with
  the flag off; the sandbox test user; compatibility proofs.
- **Migration**: migration first, in every region; read access to the
  production shape; the switch-off path.
- **UI**: the flag; the sandbox test user; the screens to prove.

Delivery contracts, such as idempotency, retention, and retries, are critical
decisions: ask each as its own question, not as an intake item.

## Steps

1. **List the secrets.** For each lane, name every secret it will use.
   `fleet secret list` shows the declared names. Run
   `fleet secret list --need <declared names>`: it prints the card text of
   each one that is missing or fails its live check, or one `Nothing to ask`
   line. It refuses a name that is not declared, and refuses while the store
   is off. A lane secret that no row declares gets a card you write: its
   kind (project or personal key), project and region, the smallest scope,
   an expiry of 7 days or less where the provider allows one, else its
   revoke link, and the settings link where the user creates it. A live
   handoff gets no card; it is asked at its use.
2. **Ask the inputs.** One question card holds every non-secret item, each
   with its recommended answer. For each standing secret to ask, it also
   asks the expiry date the user will set (within 90 days), or none.
3. **Ask each secret.** One `request_secret` card with `delivery: "file"` per
   secret from step 1, with its card text. After each answer, follow the card
   text; a `fleet secret put` gets `--expires <date>` from step 2 when the
   user set one. For a lane secret with a card you wrote, run
   `fleet secret put <name> --file <file> --lane <lane key> --env <VAR>
   --why intake` with `--expires <date>` or `--revoke <link>`. When a put
   refuses, ask again with its reason: that is still intake.
4. **Write the answers down.** A map writes each stack's answers into its
   ticket's `## Intake` section, where its lane and later rollout steps, such
   as a dark launch, read them. A lane started on its own keeps them in its
   plan.

```md
## Intake
- Proof plan: <proofs, and each proof the user named>
- Tier forecast: <critical (letters) or non-critical>
- Merge route: <merge queue, merge word, or grant>
- StampHog forecast: <likely approve, or likely refuse and why, or none>
- Flag key: <key>
- First identities: <who sees it first>
- Sandbox user: <store name>
- Region and project: <region, project>
- Secrets: <store names>; lane key <owner/repo#n or thread id>
- <other checklist item>: <answer>
```

Done when every lane's items are answered, every secret is stored or marked
as a live handoff, and each stack ticket has its `## Intake` section.

Without the `fleet` CLI or `request_secret`, the card asks the non-secret
items only, and each secret is asked when its step needs it.

## Late puts

A live handoff is asked at its use and never stored. Every other put after
intake carries its reason in `--why`: `failed-check`, `expired`, `revoked`,
`scope`, or `missed` for a secret intake should have asked. The end-of-run
report with `--lane` lists the lane's own lane puts whose reason is not
`intake`, with the misses marked; a late put of a declared secret shows only
in the store's event log.
