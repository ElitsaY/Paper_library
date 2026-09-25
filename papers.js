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
    id: "cap-qa-correctness",
    title: "CAP: How Correct Is Your Answer?",
    fullTitle: "How Correct Is Your Answer? A Semantic Correctness Framework for Open QA Evaluation",
    authors: "Yotkova, Kastreva, Velkov, Boyanov, Dimitrov, Nakov, Koychev",
    venue: "arXiv",
    year: 2026,
    hook: "An eight-class ordering of how answers can be right or wrong, and CAP, a bidirectional-NLI metric with over twice the rank correlation of COMET (60.37 vs. 26.88 Spearman).",
    interactive: "Browse real examples of each class, move α and λ in a live CAP calculator, and watch per-class means fall in order (or not).",
    topics: ["QA evaluation", "NLI", "Benchmarks", "LLMs"],
    accent: "blue"
  },
  {
    id: "llm-code-detection",
    title: "Stylometric Code Detection",
    fullTitle: "FMI_SU_Yotkova_Kastreva at SemEval-2026 Task 13: Lightweight Detection of LLM-Generated Code via Stylometric Signals",
    authors: "Yotkova, Kastreva, Dimitrov, Koychev, Nakov",
    venue: "SemEval",
    year: 2026,
    hook: "Pretrained code encoders collapse on unseen languages. Two comment ratios, a depth-2 decision tree and two data-driven rules reach 67.35 macro-F1 (top 15%) on CPU alone.",
    interactive: "Paste code and watch each line get tagged, the ratios computed and the rules fire.",
    topics: ["LLM-generated code", "Stylometry", "Interpretable ML", "LLMs"],
    accent: "teal"
  },
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
