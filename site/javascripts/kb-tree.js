/* global document, fetch, URL */

(function () {
  "use strict";

  function getBaseFromMaterialConfig() {
    var configEl = document.getElementById("__config");
    if (!configEl) return null;
    try {
      var cfg = JSON.parse(configEl.textContent || "{}");
      if (cfg && typeof cfg.base === "string") return cfg.base;
    } catch (_e) {
      return null;
    }
    return null;
  }

  function joinUrl(base, path) {
    if (!base) return path;
    if (base.endsWith("/")) base = base.slice(0, -1);
    if (path.startsWith("/")) path = path.slice(1);
    return base + "/" + path;
  }

  function decodeLocation(loc) {
    try {
      return decodeURIComponent(loc);
    } catch (_e) {
      return loc;
    }
  }

  function stripFragment(loc) {
    var idx = loc.indexOf("#");
    return idx >= 0 ? loc.slice(0, idx) : loc;
  }

  function normalizeLocation(loc) {
    if (!loc) return "";
    loc = stripFragment(loc);
    // Material search_index location usually ends with '/'
    // Keep as-is; treat '' as home.
    return loc;
  }

  function locationToSegments(loc) {
    var decoded = decodeLocation(normalizeLocation(loc));
    decoded = decoded.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!decoded) return [];
    return decoded.split("/").filter(Boolean);
  }

  function compareStrings(a, b) {
    return a.localeCompare(b, "zh-Hans-CN", { numeric: true, sensitivity: "base" });
  }

  function buildTree(docs) {
    var root = { name: "root", children: new Map(), page: null };

    for (var i = 0; i < docs.length; i++) {
      var doc = docs[i];
      var loc = normalizeLocation(doc.location || "");
      var segs = locationToSegments(loc);

      var node = root;
      for (var s = 0; s < segs.length; s++) {
        var seg = segs[s];
        if (!node.children.has(seg)) {
          node.children.set(seg, { name: seg, children: new Map(), page: null });
        }
        node = node.children.get(seg);
      }

      // Each doc corresponds to a page at this node
      node.page = { location: loc, title: doc.title || segs[segs.length - 1] || "主页" };
    }

    return root;
  }

  function mapToSortedArray(map) {
    var arr = Array.from(map.values());
    arr.sort(function (a, b) {
      return compareStrings(a.name, b.name);
    });
    return arr;
  }

  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function renderNode(node, baseUrl, depth, currentDepth) {
    var hasChildren = node.children && node.children.size > 0;

    var item = createEl("li", "kb-tree__item");

    var row = createEl("div", "kb-tree__row");
    item.appendChild(row);

    if (hasChildren) {
      var toggle = createEl("button", "kb-tree__toggle");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "+";
      row.appendChild(toggle);

      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        setExpanded(item, !expanded);
      });
    } else {
      row.appendChild(createEl("span", "kb-tree__toggle-spacer", ""));
    }

    var label;
    if (node.page) {
      var href = node.page.location ? joinUrl(baseUrl, node.page.location) : baseUrl || ".";
      label = createEl("a", "kb-tree__link", node.page.title);
      label.href = href;
      row.appendChild(label);
    } else {
      label = createEl("span", "kb-tree__label", node.name);
      row.appendChild(label);
    }

    if (hasChildren) {
      var childrenUl = createEl("ul", "kb-tree__children");
      var kids = mapToSortedArray(node.children);
      for (var i = 0; i < kids.length; i++) {
        childrenUl.appendChild(renderNode(kids[i], baseUrl, depth, currentDepth + 1));
      }
      item.appendChild(childrenUl);

      // initial expand based on depth
      if (depth != null && currentDepth < depth) {
        setExpanded(item, true);
      }
    }

    return item;
  }

  function setExpanded(li, expanded) {
    var toggle = li.querySelector(":scope > .kb-tree__row > .kb-tree__toggle");
    var children = li.querySelector(":scope > .kb-tree__children");
    if (!toggle || !children) return;

    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    toggle.textContent = expanded ? "−" : "+";
    children.hidden = !expanded;
  }

  function setAllExpanded(rootEl, expanded) {
    var items = rootEl.querySelectorAll(".kb-tree__item");
    for (var i = 0; i < items.length; i++) {
      setExpanded(items[i], expanded);
    }
  }

  function expandToDepth(rootEl, depth) {
    // collapse all first
    setAllExpanded(rootEl, false);
    if (!depth || depth < 1) return;

    // Expand nodes where their nesting level < depth
    var items = rootEl.querySelectorAll(".kb-tree__item");
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      var level = 0;
      var p = li.parentElement;
      while (p && p.classList && !p.hasAttribute("data-kb-tree")) {
        if (p.classList.contains("kb-tree__children")) level += 1;
        p = p.parentElement;
      }
      // li is at depth 'level+1' relative to root children
      if (level + 1 < depth) setExpanded(li, true);
    }
  }

  async function loadSearchIndex(baseUrl) {
    var url = joinUrl(baseUrl || ".", "search/search_index.json");
    var res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) {
      throw new Error("无法加载 search_index.json: " + res.status);
    }
    return await res.json();
  }

  function isIndexPageRootPresent(tree) {
    // just a helper if needed later
    return tree && tree.page && tree.page.location === "";
  }

  function buildUI(container, tree, baseUrl) {
    container.textContent = "";

    var ul = createEl("ul", "kb-tree__root");
    ul.setAttribute("data-kb-tree", "1");

    // Render home first (if exists)
    if (tree.page) {
      var home = { name: "主页", children: tree.children, page: tree.page };
      ul.appendChild(renderNode(home, baseUrl, null, 0));
    } else {
      var kids = mapToSortedArray(tree.children);
      for (var i = 0; i < kids.length; i++) {
        ul.appendChild(renderNode(kids[i], baseUrl, null, 0));
      }
    }

    // Collapse all by default, then expand to 2
    container.appendChild(ul);
    setAllExpanded(container, false);
    expandToDepth(container, 2);
  }

  function wireControls(controlsEl, treeRootEl) {
    if (!controlsEl) return;

    controlsEl.addEventListener("click", function (ev) {
      var target = ev.target;
      if (!(target instanceof HTMLElement)) return;

      var action = target.getAttribute("data-kb-action");
      if (action === "collapse") {
        setAllExpanded(treeRootEl, false);
        return;
      }
      if (action === "expand") {
        setAllExpanded(treeRootEl, true);
        return;
      }
      if (action === "applyDepth") {
        var input = controlsEl.querySelector("[data-kb-depth-input]");
        var depth = input ? parseInt(input.value, 10) : 2;
        if (!Number.isFinite(depth)) depth = 2;
        expandToDepth(treeRootEl, depth);
        return;
      }

      var depthAttr = target.getAttribute("data-kb-depth");
      if (depthAttr) {
        var d = parseInt(depthAttr, 10);
        if (!Number.isFinite(d)) return;
        expandToDepth(treeRootEl, d);
      }
    });
  }

  async function init() {
    var container = document.querySelector("[data-kb-tree-root]");
    if (!container) return;

    var status = container.querySelector("[data-kb-tree-status]");

    var baseFromCfg = getBaseFromMaterialConfig();
    // Material provides '.' for base; keep it.
    var baseUrl = baseFromCfg || ".";

    try {
      var idx = await loadSearchIndex(baseUrl);
      var docs = Array.isArray(idx.docs) ? idx.docs : [];

      var tree = buildTree(docs);

      // attach home page to root if present
      for (var i = 0; i < docs.length; i++) {
        if ((docs[i].location || "") === "") {
          tree.page = { location: "", title: docs[i].title || "主页" };
          break;
        }
      }

      buildUI(container, tree, baseUrl);

      var controls = document.querySelector("[data-kb-tree-controls]");
      wireControls(controls, container);
    } catch (e) {
      if (status) {
        status.textContent = "加载失败：" + (e && e.message ? e.message : String(e));
      } else {
        container.textContent = "加载失败";
      }
    }
  }

  // Material uses instant navigation; re-init on page change
  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("navigation:load", init);
})();
