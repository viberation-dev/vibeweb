# Walkthrough rules

Rules every walkthrough follows. They come from Ali's review feedback, written
down once so that a correction made on one walkthrough is applied to all of
them, and to every new one before it is published.

**How this file works**

- Each rule says what to do, why (the feedback that caused it), and how it is
  enforced. A rule without a "why" does not belong here.
- When Ali gives feedback on a walkthrough, do not just fix that walkthrough.
  Work out the general rule behind it, add it here, then apply it to every
  published walkthrough in the same change.
- Before publishing or editing a walkthrough, read this file top to bottom and
  check the walkthrough against each rule.

## 1. Prompts

### 1.1 Every blank has a hint

A blank is anything in a prompt the reader must replace, written in square
brackets: `Tone of voice: [three words]`.

Every blank gets an entry in the prompt block's `placeholders` array:

- `token`: the blank exactly as written, brackets included.
- `tip`: one sentence saying what to put there. It is the tooltip.
- `options`: one or more example answers.
- `label`: the words before the blank on its line ("Tone of voice"). Set it
  when the blank's own wording does not name it (`[describe it]`, `[who]`),
  and whenever the same token appears twice in one prompt with different
  meanings.

**Why:** Ali, 2026-10-12. A reader who does not know what "three words" for a
tone of voice looks like is stuck, and a stuck reader leaves.

**Enforced by:** the content migration fails if a blank has no hint
(`20261012090000_walkthrough_prompt_hints.sql` is the pattern to copy).

### 1.2 Every prompt can be seen finished

A reader can open any prompt as a filled-in example: the whole prompt with
each blank replaced by an example answer. The example is built from the first
option of every hint, so authoring the hints is authoring the example.

A prompt with no blanks is already its own example and needs nothing.

**Why:** Ali, 2026-10-12. Seeing the final version is what unblocks someone
who is stuck partway through.

### 1.3 Offer several options wherever more than one answer is reasonable

Give two or three options when the answer is a choice or a matter of taste
(a tone of voice, a best-fit client, a call to action, a host). Make them
genuinely different from each other, so the reader sees the range and not
three spellings of one answer.

One option is enough only when there is one right shape: a pasted error, a
version number, a link.

Where "I do not have this yet" is a legitimate answer, include it as an
option ("No quote yet.", "Not decided."). It tells the reader they can go on.

**Why:** Ali, 2026-10-12. More options give the reader more information and
more confidence that their own answer is the right kind.

### 1.4 What a tip says

- One sentence, plain words, addressed to the reader.
- Says what to put, and where to find it when that is not obvious ("On your
  host's failed build page, copy the lines in red").
- Does not repeat the label.
- Says why the answer matters when that changes how carefully they answer
  ("It decides which region to pick").
- A blank that pastes a saved file says which version: the latest saved one,
  in full. (Ali, 2026-10-13: "Tighten it" asked for copy.md without saying
  whether that meant the first reply or the one with the case studies in it.)

### 1.5 What an example says

- **One made-up project per walkthrough.** The first option of every hint
  belongs to the same project, so the filled-in examples read as one person's
  build from the first step to the last. Later options can be other projects.
- **Specific, not generic.** "Brand and web design for independent food and
  drink businesses. Leeds, UK." Not "A great agency that delivers results."
- **Realistic length.** As long as a real answer would be, including messy
  ones where the prompt invites mess.
- **Made up, and obviously so.** No real companies as clients or agencies, no
  real people. Use `.example` for invented domains.
- **Long pastes are described, not invented.** Where the answer is a whole
  file or a long log, the example says what to paste and where it comes from,
  in round brackets: "(everything in your brief.md, first line to last)".
  Short pastes (an error message, a command) are shown for real.

### 1.6 Brackets that are not blanks

Some prompts tell the AI to write a bracketed marker in its answer, such as
`[NEEDED]` or `[ASSUMED]`. Those are not blanks: give them no hint, so they
render as plain text and nobody tries to fill them in.

### 1.7 Guard against borrowed examples, twice

An example good enough to learn from is good enough to copy. Two guards, both
required:

- **The example dialog warns against copying**, in a warning box and not a
  caption: the answers describe a made-up business, and pasting one in makes
  the AI treat it as a fact about the reader's.
- **A prompt in which the reader describes their own business or project asks
  the AI to check the answers first.** It lists any that read like a stock
  example, or that do not fit the business described, under the heading
  "Check these", before it writes anything, and marks what it builds on them
  `[ASSUMED]`.

Do not weaken the examples to make them harder to copy. Vague examples teach
nothing, which is the problem rule 1.5 exists to prevent.

**Why:** Ali, 2026-10-12. In his own test run, two answers in a brief for a
flooring-trade web agency were this walkthrough's food-and-drink examples with
the nouns swapped ("about to pitch a supermarket"). ChatGPT wrote both into
the brief as facts.

## 2. Being found

### 2.1 A new walkthrough announces itself

A newly published walkthrough shows as New in the sidebar, on the Walkthroughs
page and in What's new, for `site_settings.badge_new_days` days. This is
automatic from the row's `created_at`; there is nothing to author.

Do not backdate `created_at` when publishing, or the walkthrough will launch
without its New label.

**Why:** Ali, 2026-10-12. A walkthrough was published and nothing on the site
said so.

## 3. After the AI answers

### 3.1 A prompt tells the AI when to stop

Every prompt that produces something the reader keeps ends by telling the AI
to stop: no next steps, no offers of more work. The walkthrough decides what
comes next, not the AI.

**Why:** Ali, 2026-10-12, running step 1 of the agency walkthrough. ChatGPT
finished the brief, added a "recommended next step" nobody asked for, and
following it turned one step into a long exchange about packages.

### 3.2 A prompt does not open a loop it cannot close

If a prompt asks the AI for weaknesses, questions or gaps, it asks for them in
a form the reader can answer in one reply ("for each one, ask me a single
question I can answer in a sentence"), and the step supplies the follow-up
prompt that closes them.

A prompt that ends "tell me what is weak" with nothing after it is a bug.

### 3.3 Every step that ends in a saved file has an "After the AI answers" section

Placed straight after the step's last prompt, and **written for that step**.
It says:

- **What the reply should contain**, in that step's own terms: the brief's
  eight headings and three questions; the blueprint's four parts and its
  `[NEEDED]` markers. Never a generic line about what an AI "usually" does.
- **What to make of it.** Whether there are questions to answer, what the
  markers mean, what the AI may have invented.
- **How to save it** (rule 4.2).
- **The three rules:** one round of fixes; a real decision is made once, in a
  side prompt, and brought back; anything still unknown stays in the file as
  `[NEEDED: what]`.
- **When they are done**, and to start the next step in a new chat.

`pg_temp.after_file()` in `20261013090000_walkthrough_step_two_feedback.sql`
holds the shared wording; the per-step parts are its `what` and `note`
arguments.

**Why:** Ali, 2026-10-12: the walkthrough said nothing about what to do with
the AI's extra advice. Then Ali, 2026-10-13: the first version of this section
was one text stamped on six steps. It promised "weak points, questions, a
recommended next step" in step 2, where the prompt asks for none and the reply
had none. A description of the reply that does not match the reply is worse
than no description.

**Check before publishing:** run the step's prompt yourself and compare the
reply with what the section says it contains.

### 3.4 Follow-up prompts

The section gives four, in this order:

1. **Fix the gaps once.** The reader's answers and corrections in, one rewrite
   out, no new questions.
2. **Change one thing.** A single correction, applied everywhere it matters.
3. **Decide one thing.** Three options, a recommendation, stop.
4. **Wrap it up.** For a conversation that has already wandered.

Every one that returns the deliverable asks for **the complete file, every
heading, not only the parts that changed**, in the format of rule 4.1.

Every one is marked `followUp: true`, so the page shows "paste into the chat
you already have open" in place of the links that open a new chat.

**Why:** Ali, 2026-10-13. After he answered the brief's three questions,
ChatGPT returned only the three changed sections. He asked for "the final
copy", made one more correction, and got changed sections again. And the
follow-up prompts carried "open in ChatGPT" links, which start a chat that has
never seen the reply being answered.

### 3.5 Steps that are iterative say how to keep each round small

Building pages and fixing audit findings are loops on purpose. Those steps do
not get the three prompts; they get one short rule on how to bound a round
(one page per conversation; fix critical and high, list the rest).

### 3.6 Troubleshooting prompts are exempt

A "Stuck?" prompt is a conversation by design: the reader pastes an error and
goes back and forth until it is fixed. Do not add a stop line to it.

### 3.7 Short planning steps get a note, not a section

Where a step's output is a sentence or a decision and not a file, one short
note is enough: the one thing to take away, and permission to ignore the rest.

### 3.8 Gaps are sorted and capped, never dumped

A prompt may leave gaps for the reader, but it must not hand over a wall of
them.

- `[NEEDED: what]` is only for a fact the AI must not invent: a name, a
  number, a quote, a price, a legal detail, what a package includes. Related
  details share one marker.
- Everything else the AI would normally ask about (a form field, a response
  time, a button label) gets a sensible default, written in and marked
  `[ASSUMED]`, so the reader corrects instead of supplying.
- What is left comes back in three lists: **Before launch**, **Soon after**,
  **Nice to have**. Before launch holds at most eight items, most important
  first, each with who could supply it.
- The step's checklist asks only for the Before launch list.

**Why:** Ali, 2026-10-13. "Write the copy" returned 36 `[NEEDED]` items. Every
one was valid, and together they made the step feel impossible for one person:
"it is not possible for an individual to provide it in one go."

## 4. Files and tools

### 4.1 A prompt whose answer is saved says what form to give it in

"Put the whole answer in Markdown inside a single code block I can copy,
fenced with four backticks so any code inside it survives. Do not create a
file to download."

Never ask the AI for "a .md file". A file to download is a paid or metered
feature in some tools, and a rendered reply loses its Markdown when the reader
selects and copies it.

**Why:** Ali, 2026-10-13, on free ChatGPT. The replies were formatted pages,
not Markdown. When he asked for .md, ChatGPT offered a download and then
reported that he was out of data analysis for the day.

### 4.2 The walkthrough says how to save a file

The first time a reader is asked to save a file, and in every "After the AI
answers" section: copy the code block, paste into a plain text file, save it
under the given name. Name an editor for Windows and for Mac. Do not assume
the reader knows what a .md file is.

### 4.3 The reader's AI tool is remembered

The prompt block leads with the tool the reader opened last, as the filled
button. The first prompt of each step opens a new chat and carries the earlier
files with it; follow-up prompts stay in the chat (rule 3.4). Do not write a
step that depends on the AI remembering an earlier step.

**Why:** Ali, 2026-10-13. Having used ChatGPT for step 1, step 2 offered him
the same undifferentiated row of six tools.

## 5. Checklists

### 5.1 A task that states a judgement says how to check it

A task is either an action ("Saved the brief as brief.md") or a judgement
("Every page has one job I can say in a sentence"). Every judgement carries a
`help` line under it that says where to look and what done looks like, with a
small example where one helps. An action only needs help when a reader might
not know how to do it.

If a task could be mistaken for something else on the page, the help says what
it is not ("This is not the four parts of the blueprint. It is the gaps inside
them").

**Why:** Ali, 2026-10-13. He could not tell what "Every page has one job I can
say in a sentence" was asking him to check, or whether "everything marked
NEEDED" meant the four parts of the blueprint.

## 6. Choices

### 6.1 Every version of a prompt says when to use it

When a prompt block offers more than one prompt, each carries a `description`:
when to pick it (start here, optional, run last, once per project), and where
its answer goes (save as a file, save over a file, paste into a named place in
a file, or "advice, not a file").

If two versions are alternatives, one says so ("run one of these two, not
both"). If they run in sequence, each says its place in the order.

**Why:** Ali, 2026-10-13. Step 3 offered Write the copy, Write a case study
and Tighten it with no word on order. The case study came back and nothing
said where to put it. The four follow-ups raised the same question: why four?

**Enforced by:** the content migration fails if any version has no
description (`20261013150000_walkthrough_step_three_feedback.sql`).

### 6.2 Advice for some readers lives inside the choice that picks them out

A note that applies only to readers in one situation (a client's site, a
particular host, a particular tool) does not sit in the open as "A client's
site? ...". It goes in a tab of the choice that asks about that situation,
under the same label that choice has everywhere else in the walkthrough.

The page remembers the answer by label, so a reader who chose "My own agency"
in step 1 sees that tab already open in step 3. Reuse the exact label and tab
keys; a new wording is a new question.

**Why:** Ali, 2026-10-13. Having said in step 1 that the site was his own
agency's, he met "A client's site? Send them copy.md and get it approved" in
step 3 and could not tell whether it applied to him.

## 7. One walkthrough, several ways through it

### 7.1 Settings, not copies

A walkthrough that suits different readers differently is **one walkthrough
with settings**, never several copies. The reader answers "How are you doing
this?" at the top (how thorough; alone or with a team), and steps and blocks
tagged for other answers drop out.

- A step or a top-level block carries `when: { depth: [...], team: [...] }`.
  No `when` means everyone.
- Untagged content **is** Standard, for one person. Tag only what differs.
- A depth or team option appears in the panel the day content tagged for it
  is published, and not before. Do not tag anything `full` or `team` until
  that content is written and tested.
- Where two depths need different wording, write two blocks and tag each.
  Checklist task ids must stay unique across the whole walkthrough, so a
  Basic checklist uses its own ids.
- Every prompt in every setting still follows every rule in this file.

**Why:** Ali, 2026-10-13. Step 3 at full detail was more than one person
could supply in a sitting, and he asked for Individual and Team modes at
three depths. Six separate walkthroughs would mean every later fix made six
times.

### 7.2 What each depth promises

| | Basic | Standard | Complete |
|---|---|---|---|
| Steps | The fewest that still end in a live site | Every step | Standard, plus research before and a review before launch |
| Gaps | The AI fills in almost everything; at most three items block launch | At most eight block launch | Everything is asked for, sorted into the three lists |
| Effort | An evening or two | A week of evenings | Several weeks |

A depth that asks for more than its row is a bug in that depth.

### 7.3 What Team adds

Team adds to a walkthrough and never replaces anything in it. A team block is
tagged `team` only, with no depth, so it shows at every depth and sits only in
steps every depth has.

- **Roles, once, in the first step:** one person with the final say, a name
  beside each kind of missing information, one shared folder.
- **A way to ask.** Wherever a step leaves `[NEEDED]` items, the team gets the
  "Ask for what is missing" prompt, which turns the list into one message per
  person. For a team, a gap is somebody else's to fill; say so.
- **A way to take comments.** "Combine the team's comments" turns a pile of
  feedback into one list, with disagreements left for the decider. One round.
- **Sign-off** before anything later steps are built on: the brief, the words,
  the look, the preview link. Each has a checklist task that names the decider
  and asks for a yes in writing.

Do not put team advice in the open as "If you work with others...". That is
rule 6.2 again: it belongs behind the setting.

### 7.4 Name a step, never number it

With settings, "step 1" is Research at one depth and Brief at another. Refer
to a step by its name ("the Brief step", "while you write the copy") or by
position relative to this one ("the next step"). The page prints the right
number for the reader on its own.

### 7.5 A deeper depth is built from the shallower one

Complete is Standard plus what it adds. Where a Complete prompt differs from
the Standard one, derive it in the migration by replacing the sentences that
change, and have the migration check the replacement happened. Do not retype
the prompt: two hand-typed copies stop matching within a month.

What Complete adds to the agency walkthrough: a Research step first
(competitors from pasted text, calls with past clients, research.md), a brief
written from that research with a success measure, a copy prompt that lists
every gap, and a Review step before Launch (legal drafts, measurement, an
accessibility pass by hand, a proofread of the built pages).

An AI tool asked about another company's website answers from memory and is
often wrong. Any prompt that compares the reader with someone else works only
from text the reader pastes in, and says so.
