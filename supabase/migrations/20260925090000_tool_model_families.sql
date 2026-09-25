-- Fourteen more model families (VIB-206).
--
-- The Models category held four rows — Claude, Gemini, GPT and Jev — while
-- OpenRouter lists 459 models. These are the families a vibe coder actually
-- meets: the ones behind the cheap coding plans, the open weights people
-- self-host, and the two or three that turn up in every benchmark thread.
--
-- Every row is an openrouter_family, not an openrouter_id, so the family page
-- lists its models live (VIB-107) and a new release needs no migration. The
-- prefixes below were read off the live OpenRouter catalogue on 2026-09-25,
-- not from memory, and each one is matched with starts_with:
--
--   qwen/qwen        54   z-ai/glm         19   deepseek/deepseek  16
--   moonshotai/kimi   8   x-ai/grok         8   meta-llama/llama    8
--   minimax/minimax   8   google/gemma      8   tencent/hy          6
--   nvidia/nemotron  10   xiaomi/mimo       5   inclusionai/ling    5
--   mistralai/voxtral 1   stealth/space     1
--
-- openrouter_id is left null almost everywhere: null means "the newest in the
-- family", which stays right on its own. Llama is the exception — its newest
-- row is Llama Guard, a safety classifier, and opening a family page on a
-- classifier misrepresents the family.
--
-- Three slugs are suffixed because the plain ones are already chat apps in
-- this directory: deepseek, grok and kimi are the chats, *-models are the
-- model families. Renaming the chats would break links that exist.
--
-- pricing_tier follows OpenRouter's hugging_face_id: a family whose models
-- publish weights is "Open source", which is the fact a reader wants (can I
-- run this myself?) rather than a guess at anyone's subscription price.
-- Grok publishes none, so it is Paid; Space Bunny Alpha is a free stealth
-- listing with no vendor at all.
--
-- What is deliberately not here: benchmark claims, parameter counts and
-- prices. Those are on OpenRouter, live, one click from the same page.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, best_for, openrouter_family, openrouter_id)
values
  ('Qwen', 'qwen', 'models',
   'Alibaba''s open-weight family, with a coder model in nearly every size.',
   'Qwen is Alibaba''s model family and the largest open-weight line there is — dozens of sizes from a few billion parameters up to the Max models, most of them published so you can run them yourself. For vibe coders the draw is the Qwen Coder models: strong at code for the price, cheap to call through a provider, and small enough at the low end to run on your own machine. The flagship Max models take text, images and video and go up to a million tokens of context.',
   'Open source', 'https://qwen.ai', 'intermediate', 'qwen/qwen', null),

  ('DeepSeek models', 'deepseek-models', 'models',
   'The open-weight family everyone else gets benchmarked against.',
   'DeepSeek publishes the weights for nearly everything it ships, which is why its models became the price anchor for the whole market — a Flash model here costs a fraction of a frontier model and gets close on reasoning and code. The V4 line is a sparse mixture-of-experts design with a million-token context. This row is the model family; DeepSeek''s own free chat app has its own entry in Chats.',
   'Open source', 'https://www.deepseek.com', 'intermediate', 'deepseek/deepseek', null),

  ('Kimi models', 'kimi-models', 'models',
   'Moonshot''s open-weight models, built for long documents and agent runs.',
   'Kimi is Moonshot AI''s model family, open-weight and aimed squarely at long-horizon work: big context windows, strong tool use, and a Code variant tuned for software tasks. K3 is a multimodal reasoning model with a million-token context. If you have a large repository or a long agent run and do not want to pay frontier prices, this is the family to price against. The Kimi chat app is listed separately under Chats.',
   'Open source', 'https://www.moonshot.ai', 'intermediate', 'moonshotai/kimi', null),

  ('Grok models', 'grok-models', 'models',
   'SpaceXAI''s models, strong on long-running engineering tasks.',
   'Grok is SpaceXAI''s model family, sold through its own API rather than published as weights. The recent versions are pitched at coding and agentic work — long software-engineering runs where the model checks its own output — and take text, images and files with a 500K-token context. Closed weights and paid only, so treat it as a frontier option you rent, not one you host. The Grok chat app is listed separately under Chats.',
   'Paid', 'https://x.ai', 'intermediate', 'x-ai/grok', null),

  ('GLM', 'glm', 'models',
   'Z.ai''s open-weight family, behind the cheap coding subscriptions.',
   'GLM is the model family from Z.ai, and the reason its coding plan turns up in every "cheaper than Claude Code" thread — the weights are published, plenty of providers serve them, and the Flash models are some of the cheapest usable coding models anywhere. The 5.3 line runs to a million tokens of context, with Flash variants that also read images and video. Z.ai''s own chat app is listed separately under Chats.',
   'Open source', 'https://z.ai', 'intermediate', 'z-ai/glm', null),

  ('Ling', 'ling', 'models',
   'inclusionAI''s open mixture-of-experts models, priced near zero.',
   'Ling is inclusionAI''s open-weight family: mixture-of-experts models that activate a small slice of their parameters per token, which is how the Flash models land at a price per million tokens most people would call a rounding error. There are vision and finance-tuned variants alongside the general one, and a 262K context. A sensible pick for high-volume work — classifying, tagging, summarising — where a frontier model is overkill.',
   'Open source', 'https://huggingface.co/inclusionAI', 'expert', 'inclusionai/ling', null),

  ('MiMo', 'mimo', 'models',
   'Xiaomi''s open-weight family, and unusually multimodal for its price.',
   'MiMo is Xiaomi''s model family, published as open weights and built around a flagship at over a trillion parameters with Flash variants under it. The whole line reads text, images, video and audio with a million-token context, which is a rarer combination than the price suggests. Worth a look if your app takes messy real-world input — screenshots, recordings, clips — rather than clean text.',
   'Open source', 'https://huggingface.co/XiaomiMiMo', 'expert', 'xiaomi/mimo', null),

  ('MiniMax', 'minimax', 'models',
   'Open-weight multimodal models built for long agent runs.',
   'MiniMax publishes open weights for its M-series models, which are aimed at long-horizon agentic work and coding. The current M3 takes text, images and video with a million-token context, and the older M2 models are still around and cheaper. A solid middle option: more capable than the tiny Flash models, far cheaper than a frontier API, and you can host it yourself if you need to.',
   'Open source', 'https://www.minimax.io', 'expert', 'minimax/minimax', null),

  ('Nemotron', 'nemotron', 'models',
   'NVIDIA''s open models, tuned for throughput rather than benchmarks.',
   'Nemotron is NVIDIA''s open-weight family, built to run fast on NVIDIA hardware. The Lightning models activate only a few billion of their parameters per token and are meant for high-throughput agent workloads, and the line includes specialised members like a content-safety classifier rather than one general model stretched over every job. Several are free to call through OpenRouter.',
   'Open source', 'https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/', 'expert', 'nvidia/nemotron', null),

  ('Gemma', 'gemma', 'models',
   'Google''s open models — Gemini''s research, small enough to self-host.',
   'Gemma is Google DeepMind''s open-weight family, built from the same research as Gemini but published so you can download and run it. Sizes run from a few billion parameters up to about thirty, they read text and images, and the current line has a 256K context with a switchable thinking mode. The obvious starting point if you want a capable model on your own machine or on cheap hardware.',
   'Open source', 'https://ai.google.dev/gemma', 'intermediate', 'google/gemma', null),

  ('Llama', 'llama', 'models',
   'Meta''s open-weight family, and the reason local models took off.',
   'Llama is Meta''s open-weight family and the one that made running a serious model on your own hardware normal — most local tooling was built for it first, so support is everywhere. The Llama 4 models are mixture-of-experts and multimodal, with very large context windows, and the line includes Llama Guard, a classifier for filtering input and output rather than a chat model. Meta''s newer work ships under a different name, so check the dates on this family before choosing it.',
   'Open source', 'https://www.llama.com', 'intermediate', 'meta-llama/llama', 'meta-llama/llama-4-maverick'),

  ('Hy', 'hy', 'models',
   'Tencent''s open-weight models, aimed at coding agents and tool use.',
   'Hy is Tencent''s open-weight family, successor to its Hunyuan models. The current preview is a mixture-of-experts model built for coding agents and complex tool-use workflows with a million-token context, and the line also carries small translation-specialised models you can run almost anywhere. Preview status is worth taking literally: good for trying, not for depending on.',
   'Open source', 'https://huggingface.co/tencent', 'expert', 'tencent/hy', null),

  ('Voxtral', 'voxtral', 'models',
   'Mistral''s open speech model — audio in, text out.',
   'Voxtral is Mistral''s open-weight audio model: it takes speech and files as input and returns text, handling transcription, translation and questions about what was said, while keeping the text ability of the Mistral Small model it is built on. It is a single specialised model rather than a family, so reach for it when your app has recordings to understand, and use a general model for everything else.',
   'Open source', 'https://mistral.ai/news/voxtral', 'expert', 'mistralai/voxtral', null),

  ('Space Bunny Alpha', 'space-bunny-alpha', 'models',
   'An anonymous model on free trial — fast, multimodal, and unattributed.',
   'Space Bunny Alpha is a stealth listing: a large multimodal model released on OpenRouter without naming its maker, free to call while it is being evaluated, with a million-token context and adjustable reasoning effort. Vendors do this to collect honest feedback before a launch. Treat it as exactly that — worth trying, not worth building on, since it can be renamed, repriced or withdrawn without notice, and you cannot know whose terms your prompts are going under.',
   'Free', 'https://openrouter.ai/stealth/space-bunny-alpha', 'expert', 'stealth/space', 'stealth/space-bunny-alpha')
on conflict (slug) do nothing;

-- Key facts stay short because the model page already carries the live ones —
-- price, context, modalities and uptime all come from OpenRouter at request
-- time. These are the two things that catalogue does not say: who made it,
-- and whether you can run it yourself.
update tools set key_facts = f.facts, updated_at = now()
from (values
  ('qwen', '[{"label": "Made by", "value": "Alibaba"}, {"label": "Weights", "value": "Open, most sizes"}, {"label": "Good for", "value": "Cheap coding models, and running one yourself"}]'::jsonb),
  ('deepseek-models', '[{"label": "Made by", "value": "DeepSeek"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Reasoning and code at a fraction of frontier prices"}]'::jsonb),
  ('kimi-models', '[{"label": "Made by", "value": "Moonshot AI"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Long documents and long agent runs"}]'::jsonb),
  ('grok-models', '[{"label": "Made by", "value": "SpaceXAI"}, {"label": "Weights", "value": "Closed, API only"}, {"label": "Good for", "value": "Long software-engineering tasks"}]'::jsonb),
  ('glm', '[{"label": "Made by", "value": "Z.ai"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Coding on a budget"}]'::jsonb),
  ('ling', '[{"label": "Made by", "value": "inclusionAI"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "High-volume, low-value calls"}]'::jsonb),
  ('mimo', '[{"label": "Made by", "value": "Xiaomi"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Apps that take images, video or audio"}]'::jsonb),
  ('minimax', '[{"label": "Made by", "value": "MiniMax"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Agentic work over a long context"}]'::jsonb),
  ('nemotron', '[{"label": "Made by", "value": "NVIDIA"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Throughput, and specialised jobs like safety filtering"}]'::jsonb),
  ('gemma', '[{"label": "Made by", "value": "Google DeepMind"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Running a capable model on your own machine"}]'::jsonb),
  ('llama', '[{"label": "Made by", "value": "Meta"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Local setups, where tooling support is widest"}]'::jsonb),
  ('hy', '[{"label": "Made by", "value": "Tencent"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Coding agents and tool-use workflows"}]'::jsonb),
  ('voxtral', '[{"label": "Made by", "value": "Mistral"}, {"label": "Weights", "value": "Open"}, {"label": "Good for", "value": "Transcribing and understanding speech"}]'::jsonb),
  ('space-bunny-alpha', '[{"label": "Made by", "value": "Undisclosed"}, {"label": "Weights", "value": "Closed"}, {"label": "Good for", "value": "Trying, not depending on"}]'::jsonb)
) as f(slug, facts)
where tools.slug = f.slug;
