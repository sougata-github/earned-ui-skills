# SEO and AEO notes

Keywords come from OpenSEO (United States, monthly searches, checked
2026-11-22). KD is keyword difficulty out of 100.

## Home: agent skills

| Keyword | Searches | KD |
| --- | --- | --- |
| claude skills | 40,500 | 45 |
| claude code skills | 12,100 | 57 |
| agent skills | 9,900 | 34 |
| codex skills | 5,400 | 14 |
| cursor skills | 2,900 | 7 |
| frontend design skill | 1,900 | 4 |
| npx skills | 1,600 | 14 |
| best claude code skills | 590 | 24 |
| ui skills | 590 | 27 |
| claude code design skill | 390 | 17 |
| how to install claude skills | 390 | 27 |
| what are agent skills | 390 | |
| claude skills vs mcp | 260 | 23 |
| claude code frontend design | 210 | 6 |

## liquid-glass-web

| Keyword | Searches | KD |
| --- | --- | --- |
| liquid glass | 40,500 | 62 |
| glassmorphism | 6,600 | 29 |
| apple liquid glass | 5,400 | 64 |
| what is liquid glass | 2,900 | 47 |
| ios 26 liquid glass | 1,000 | 33 |
| liquid glass ui | 880 | 62 |
| glass effect css | 390 | 18 |
| liquid glass css | 320 | 10 |
| liquid glass effect | 260 | 13 |
| liquid glass react | 170 | 3 |
| liquid glass button | 110 | 4 |

## widget-bento-web

| Keyword | Searches | KD |
| --- | --- | --- |
| bento grid | 1,600 | 5 |
| dashboard widgets | 260 | 2 |
| bento ui | 140 | 6 |
| bento grid design | 110 | 6 |
| bento layout | 110 | 8 |
| widget ui | 110 | 2 |
| what is a bento grid | 50 | 0 |

## How the pages use them

- Headings in a skill page's body are questions in the searched wording,
  answered in their first sentence.
- Each page's description is the answer under its heading, written to be
  quoted on its own. It is also the line in llms.txt.
- FAQ answers open with the plain answer and name the skill. They are in
  the page's HTML and in FAQPage structured data.
- Every skill page has a Markdown twin at `/skills/<name>.md`, and
  `/llms.txt` lists them. Both are written by Velite when the content
  builds.
- The easy wins are the low difficulty terms: liquid glass css, liquid
  glass react, bento grid, frontend design skill, cursor skills.
