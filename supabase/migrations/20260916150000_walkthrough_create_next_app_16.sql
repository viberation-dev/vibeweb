-- Walkthrough setup steps match current create-next-app (VIB-160).
--
-- create-next-app 16 asks a single "recommended defaults" question rather
-- than one per option, and it runs git init and makes the first commit
-- itself. The Stack guidance described the old questions, and Deploy told
-- people to git init a repository that already existed.
--
-- Content only. Task ids are unchanged.
update wizards
set steps = jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(steps, '{1,blocks,1,expected}', '"npm asks Ok to proceed? Press y. Then one question: Would you like to use the recommended Next.js defaults? Pick Yes, use recommended defaults. That gives you TypeScript, Tailwind and the App Router in one go. Installing takes a minute or two and ends with Success! Created my-project."'::jsonb), '{1,blocks,2,expected}', '"A few lines, including Local: http://localhost:3000. Open that address in your browser. The first load takes a few seconds while it builds, then you see the Next.js starter page. To stop the server later, press Ctrl+C."'::jsonb), '{2,blocks,0,body}', '"Going live early turns every change after this into a small, safe step, instead of one big scary leap at the finish. You also get a real link to send people the moment it is worth showing off.\n\nGood news: create-next-app already set up git and saved a first commit for you. You only need to save the changes you have made since."'::jsonb), '{2,blocks,1,code}', '"git add -A\ngit commit -m \"my first changes\""'::jsonb), '{2,blocks,1,expected}', '"A short summary of the files you changed, and a commit ID. If git says nothing to commit, you have not changed anything yet, which is fine. If git asks who you are, set your name and email with git config, then run the commit again."'::jsonb), '{2,blocks,6,tasks,0,label}', '"Saved my changes with a commit"'::jsonb)
where slug = 'ship-your-first-web-project'
  and steps->1->>'key' = 'stack'
  and steps->2->>'key' = 'deploy';
