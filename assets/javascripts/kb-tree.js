/* global document, fetch, URL, window */

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

  function pickPageLevelDocs(docs) {
    // mkdocs-material 的 search_index.json 同时包含：
    // 1) 页面级条目（location 不含 #）
    // 2) 小节/标题级条目（location 含 #）
    // 之前直接用 docs 会导致小节标题覆盖页面标题，进而让目录树"看起来"结构错乱。
    // 这里按"去掉 # 后的页面路径"聚合，并优先选择页面级条目。

    var byLoc = new Map();

    for (var i = 0; i < docs.length; i++) {
      var doc = docs[i] || {};
      var rawLoc = String(doc.location || "");
      var pageLoc = normalizeLocation(rawLoc);
      var isPageRecord = rawLoc.indexOf("#") === -1;

      var existing = byLoc.get(pageLoc);
      if (!existing) {
        byLoc.set(pageLoc, {
          location: pageLoc,
          title: doc.title || "",
          isPageRecord: isPageRecord,
        });
        continue;
      }

      // Prefer page-level record over section-level record
      if (!existing.isPageRecord && isPageRecord) {
        existing.location = pageLoc;
        existing.title = doc.title || existing.title;
        existing.isPageRecord = true;
        continue;
      }

      // Fill missing title if any
      if ((!existing.title || String(existing.title).trim() === "") && doc.title) {
        existing.title = doc.title;
      }
    }

    return Array.from(byLoc.values()).map(function (d) {
      return { location: d.location, title: d.title };
    });
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
      label.target = "_blank";
      label.rel = "noopener noreferrer";
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
      // Count ancestor ".kb-tree__children" up to current tree root
      var level = 0;
      var p = li.parentElement;
      while (p && p !== rootEl) {
        if (p.classList && p.classList.contains("kb-tree__children")) level += 1;
        p = p.parentElement;
      }

      // li is at depth 'level+1' relative to root children
      if (level + 1 < depth) setExpanded(li, true);
    }
  }

  function getSearchIndexUrls(baseUrl) {
    var urls = [];
    if (baseUrl) {
      urls.push(joinUrl(baseUrl, "search/search_index.json"));
    }
    urls.push("search/search_index.json");

    var path = window.location.pathname || "/";
    if (!path.endsWith("/")) {
      path = path.slice(0, path.lastIndexOf("/") + 1);
    }
    var segments = path.replace(/^\/+/, "").replace(/\/+$/, "").split("/").filter(Boolean);
    for (var depth = 1; depth <= Math.min(6, segments.length); depth++) {
      urls.push(Array(depth + 1).join("../") + "search/search_index.json");
    }
    if (segments.length > 0) {
      urls.push("/" + segments[0] + "/search/search_index.json");
    }

    return urls.filter(function (value, index, array) {
      return array.indexOf(value) === index;
    });
  }

  async function loadSearchIndex(baseUrl) {
    var urls = getSearchIndexUrls(baseUrl || ".");
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var lastError = null;

    for (var i = 0; i < urls.length; i++) {
      var url = urls[i];
      var timeoutId = null;
      if (controller) {
        timeoutId = setTimeout(function () {
          try {
            controller.abort();
          } catch (_e) {
            // ignore
          }
        }, 8000);
      }

      var res;
      try {
        res = await fetch(url, {
          credentials: "same-origin",
          signal: controller ? controller.signal : undefined,
          cache: "no-store",
        });
      } catch (err) {
        lastError = err;
      } finally {
        if (timeoutId != null) clearTimeout(timeoutId);
      }

      if (res && res.ok) {
        return await res.json();
      }

      if (res) {
        lastError = new Error("HTTP " + res.status + " for " + url);
      }
    }

    throw new Error("无法加载 search_index.json: " + (lastError && lastError.message ? lastError.message : "404"));
  }

  function buildUI(contentEl, tree, baseUrl) {
    contentEl.textContent = "";

    var ul = createEl("ul", "kb-tree__root");
    ul.setAttribute("data-kb-tree", "1");

    var kids = mapToSortedArray(tree.children);
    for (var i = 0; i < kids.length; i++) {
      ul.appendChild(renderNode(kids[i], baseUrl, null, 0));
    }

    // Collapse all by default, then expand to 2
    contentEl.appendChild(ul);
    setAllExpanded(contentEl, false);
    expandToDepth(contentEl, 2);
  }

  function wireControls(controlsEl, treeRootEl) {
    if (!controlsEl) return;

    if (controlsEl.getAttribute("data-kb-tree-bound") === "1") return;
    controlsEl.setAttribute("data-kb-tree-bound", "1");

    controlsEl.addEventListener("click", function (ev) {
      var target = ev.target;
      if (!(target instanceof Element)) return;

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
    if (init._running) return;
    init._running = true;

    var rootEl = document.querySelector("[data-kb-tree-root]");
    if (!rootEl) {
      init._running = false;
      return;
    }

    var status = rootEl.querySelector("[data-kb-tree-status]");
    var contentEl = rootEl.querySelector("[data-kb-tree-content]");
    if (!contentEl) {
      contentEl = document.createElement("div");
      contentEl.className = "kb-tree__content";
      contentEl.setAttribute("data-kb-tree-content", "");
      rootEl.appendChild(contentEl);
    }

    var baseFromCfg = getBaseFromMaterialConfig();
    // Material provides '.' for base; keep it.
    var baseUrl = baseFromCfg || ".";

    try {
      if (status) status.textContent = "正在加载目录索引…（如长时间未出现，请刷新页面）";

      var idx = await loadSearchIndex(baseUrl);
      var docs = Array.isArray(idx.docs) ? idx.docs : [];
      var pages = pickPageLevelDocs(docs);
      var tree = buildTree(pages);

      buildUI(contentEl, tree, baseUrl);

      var controls = document.querySelector("[data-kb-tree-controls]");
      wireControls(controls, contentEl);

      if (status) status.textContent = "目录索引已加载（" + pages.length + " 页）";
    } catch (e) {
      var msg = (e && e.name === "AbortError")
        ? "加载超时（网络较差或被拦截）。"
        : "加载失败：" + (e && e.message ? e.message : String(e));

      if (status) {
        status.textContent = msg + " 请刷新页面重试。";
      }
    } finally {
      init._running = false;
    }
  }

  function scheduleInit() {
    // Defer to the next frame so Material can finish swapping the DOM
    if (scheduleInit._pending) return;
    scheduleInit._pending = true;
    requestAnimationFrame(function () {
      scheduleInit._pending = false;
      (function initWithRetry(attempt) {
        if (document.querySelector("[data-kb-tree-root]")) {
          init();
          return;
        }
        if (attempt >= 20) return;
        setTimeout(function () {
          initWithRetry(attempt + 1);
        }, 100);
      })(0);
    });
  }

  function hookMaterialInstantNavigation() {
    // Material exposes RxJS observables that emit on navigation
    // See: window.location$, window.document$ in the bundled theme script
    if (typeof window === "undefined") return false;

    var hooked = false;
    var loc$ = window.location$;
    if (loc$ && typeof loc$.subscribe === "function") {
      loc$.subscribe(function () {
        scheduleInit();
      });
      hooked = true;
    }

    var doc$ = window.document$;
    if (doc$ && typeof doc$.subscribe === "function") {
      doc$.subscribe(function () {
        scheduleInit();
      });
      hooked = true;
    }

    return hooked;
  }

  // Initial load
  document.addEventListener("DOMContentLoaded", scheduleInit);

  // Instant navigation (primary)
  var hooked = hookMaterialInstantNavigation();

  // Fallback for older versions / different integrations
  if (!hooked) {
    document.addEventListener("navigation:load", scheduleInit);
  }
})();