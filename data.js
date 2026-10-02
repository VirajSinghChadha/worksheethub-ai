// Sample data shown only when showSampleData is true in config.js.
// Real worksheets you add in the Admin dashboard are stored in the browser; use "Export" there to get
// a worksheets.json you can commit to GitHub (see README).
(function () {
  const R = (window.WH_CONFIG && window.WH_CONFIG.githubRepo) || "";
  const f = (p) => `${R}/blob/main/worksheets/${p}`;
  window.WH_SEED = {
    worksheets: [
      { id: "s1", title: "Adding Fractions with Different Denominators", subject: "Mathematics", grade: "Grade 6", topic: "Fractions", difficulty: "Medium", description: "Practise finding common denominators and adding fractions, with worked example at the top.", file: f("math/grade6/adding-fractions.pdf"), answers: f("math/grade6/adding-fractions-answers.pdf"), date: "2026-09-20", sample: true },
      { id: "s2", title: "Pythagoras' Theorem Practice", subject: "Mathematics", grade: "Grade 7", topic: "Pythagoras", difficulty: "Hard", description: "Find missing sides in right-angled triangles, plus real-life word problems.", file: f("math/grade7/pythagoras.pdf"), answers: "", date: "2026-09-27", sample: true },
      { id: "s3", title: "Parts of a Cell", subject: "Science", grade: "Grade 6", topic: "Cells", difficulty: "Easy", description: "Label plant and animal cells and match each organelle to its job.", file: f("science/grade6/cells.pdf"), answers: f("science/grade6/cells-answers.pdf"), date: "2026-09-15", sample: true },
      { id: "s4", title: "Photosynthesis Revision", subject: "Science", grade: "Grade 7", topic: "Photosynthesis", difficulty: "Medium", description: "Revision questions on the word equation, limiting factors and leaf structure.", file: f("science/grade7/photosynthesis.pdf"), answers: "", date: "2026-09-29", sample: true },
      { id: "s5", title: "Spanish Vocabulary: School Life", subject: "Spanish", grade: "Grade 6", topic: "Spanish vocabulary", difficulty: "Easy", description: "Match, translate and complete sentences using classroom and school subject words.", file: f("spanish/school-vocab.pdf"), answers: f("spanish/school-vocab-answers.pdf"), date: "2026-09-10", sample: true },
      { id: "s6", title: "World Population Distribution", subject: "Individuals & Societies", grade: "Grade 7", topic: "Population", difficulty: "Medium", description: "Read maps and graphs to explain why people live where they do.", file: f("individuals-societies/population.pdf"), answers: "", date: "2026-09-25", sample: true }
    ],
    requests: [
      { id: "q1", subject: "Mathematics", grade: "Grade 6", topic: "Fractions", difficulty: "Medium", type: "Practice questions", info: "", date: "2026-09-12", status: "Completed", link: "#/worksheet/s1", sample: true },
      { id: "q2", subject: "Mathematics", grade: "Grade 6", topic: "Fractions", difficulty: "Easy", type: "Revision worksheet", info: "", date: "2026-09-18", status: "Requested", link: "", sample: true },
      { id: "q3", subject: "Mathematics", grade: "Grade 7", topic: "Algebra", difficulty: "Mixed", type: "Mixed questions", info: "Solving equations with brackets", date: "2026-09-26", status: "Being Created", link: "", sample: true },
      { id: "q4", subject: "Science", grade: "Grade 6", topic: "Cells", difficulty: "Easy", type: "Multiple choice", info: "", date: "2026-09-08", status: "Completed", link: "#/worksheet/s3", sample: true },
      { id: "q5", subject: "English", grade: "Grade 7", topic: "Creative writing", difficulty: "Medium", type: "Challenge questions", info: "", date: "2026-09-30", status: "Requested", link: "", sample: true }
    ]
  };
})();
