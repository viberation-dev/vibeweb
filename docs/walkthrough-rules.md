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

## 2. Being found

### 2.1 A new walkthrough announces itself

A newly published walkthrough shows as New in the sidebar, on the Walkthroughs
page and in What's new, for `site_settings.badge_new_days` days. This is
automatic from the row's `created_at`; there is nothing to author.

Do not backdate `created_at` when publishing, or the walkthrough will launch
without its New label.

**Why:** Ali, 2026-10-12. A walkthrough was published and nothing on the site
said so.
