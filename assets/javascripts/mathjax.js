/* Minimal MathJax setup for MkDocs Material */
(function () {
  "use strict";

  // Configure MathJax v3 (loaded separately via CDN in mkdocs.yml)
  window.MathJax = window.MathJax || {};
  window.MathJax = Object.assign(window.MathJax, {
    tex: {
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      displayMath: [["$$", "$$"], ["\\[", "\\]"]],
      processEscapes: true,
    },
    options: {
      ignoreHtmlClass: "md-search__form|md-search__output",
    },
  });

  function typeset() {
    if (!window.MathJax || !window.MathJax.typesetPromise) return;
    window.MathJax.typesetPromise();
  }

  document.addEventListener("DOMContentLoaded", typeset);
  document.addEventListener("navigation:load", typeset);
})();
