/* Initialize tablesort on MkDocs Material pages */
(function () {
  "use strict";

  function init() {
    if (typeof Tablesort === "undefined") return;
    var tables = document.querySelectorAll("article table");
    for (var i = 0; i < tables.length; i++) {
      // Avoid double init
      if (tables[i].getAttribute("data-tablesort") === "1") continue;
      tables[i].setAttribute("data-tablesort", "1");
      new Tablesort(tables[i]);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("navigation:load", init);
})();