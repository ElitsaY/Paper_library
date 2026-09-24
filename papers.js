/* ===== Paper Library — catalogue =====
   One entry per paper. The home page renders cards, topic filters and stats from this list.

   Fields:
     id          short slug, also the file name under papers/ (papers/<id>.html)
     title       short name shown large on the card
     fullTitle   the paper's actual title
     authors     short author string
     venue, year
     hook        one or two sentences: what the paper does, in plain words
     interactive what you can click / drag / watch on the deep-dive page
     topics      free-form tags; the filter chips are built from these
     accent      one of: coral, teal, gold, blue, sky  (card colour)
     url         optional override (e.g. a page hosted elsewhere); defaults to papers/<id>.html
     status      "live" (default) or "soon" (shown greyed out, not clickable)
*/
window.PAPERS = [
  {
    id: "leandojo",
    title: "LeanDojo",
    fullTitle: "LeanDojo: Theorem Proving with Retrieval-Augmented Language Models",
    authors: "Yang, Swope, Gu, Chalamala, Song, Yu, Godil, Prenger, Anandkumar",
    venue: "NeurIPS",
    year: 2023,
    hook: "Proving theorems in Lean as best-first search: a language model proposes proof steps, and a retriever narrows 130k mathlib premises down to the 100 that matter.",
    interactive: "Step through a proof-search tree and watch the frontier re-rank.",
    topics: ["Theorem proving", "Search", "Retrieval", "LLMs"],
    accent: "coral"
  }
];
