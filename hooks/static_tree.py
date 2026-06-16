from __future__ import annotations

import html
from dataclasses import dataclass, field
from pathlib import Path

MARKER = "<!-- KB_STATIC_TREE -->"
SKIP_DIRS = {"assets"}
SKIP_FILES = {"index.md", "tags.md"}
ROOT_DIR_ORDER = {
    "自然与应用科学": 0,
    "人文与社会科学": 1,
    "艺术与文化生活": 2,
}


@dataclass
class TreeNode:
    title: str
    url: str | None = None
    children: list["TreeNode"] = field(default_factory=list)


def on_page_markdown(markdown: str, page, config, files):
    if page.file.src_uri != "index.md":
        return markdown

    docs_dir = Path(config["docs_dir"])
    tree = build_tree(docs_dir)
    rendered_tree = render_tree(tree)

    if MARKER in markdown:
        return markdown.replace(MARKER, rendered_tree)

    return markdown.rstrip() + "\n\n" + rendered_tree + "\n"


def build_tree(docs_dir: Path) -> list[TreeNode]:
    nodes: list[TreeNode] = []

    for entry in sorted(docs_dir.iterdir(), key=root_sort_key):
        node = build_entry(entry, Path(entry.name))
        if node is not None:
            nodes.append(node)

    return nodes


def build_entry(entry: Path, rel_path: Path) -> TreeNode | None:
    if entry.name.startswith(".") or entry.name in SKIP_DIRS or entry.name in SKIP_FILES:
        return None

    if entry.is_dir():
        return build_dir(entry, rel_path)

    if entry.suffix.lower() == ".md":
        return TreeNode(title=read_title(entry, entry.stem), url=to_url(rel_path))

    return None


def build_dir(dir_path: Path, rel_dir: Path) -> TreeNode | None:
    index_file = dir_path / "index.md"
    title = read_title(index_file, rel_dir.name or dir_path.name) if index_file.exists() else (rel_dir.name or dir_path.name)
    url = to_url(rel_dir / "index.md") if index_file.exists() else None

    children: list[TreeNode] = []
    for entry in sorted(dir_path.iterdir(), key=sort_key):
        child = build_entry(entry, rel_dir / entry.name)
        if child is not None:
            children.append(child)

    if not children and url is None:
        return None

    return TreeNode(title=title, url=url, children=children)


def sort_key(path: Path):
    return (0 if path.is_dir() else 1, path.name.lower())


def root_sort_key(path: Path):
    if path.is_dir():
        return (0, ROOT_DIR_ORDER.get(path.name, len(ROOT_DIR_ORDER)), path.name.lower())
    return (1, path.name.lower())


def read_title(path: Path, fallback: str) -> str:
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if stripped.startswith("#"):
                title = stripped.lstrip("#").strip()
                if title:
                    return title
    except OSError:
        pass
    return fallback


def to_url(rel_path: Path) -> str:
    rel = rel_path.as_posix()
    if rel == "index.md":
        return "./"
    if rel.endswith("/index.md"):
        rel = rel[: -len("index.md")]
    else:
        rel = rel[:-3]
    if not rel.endswith("/"):
        rel += "/"
    return rel


def render_tree(nodes: list[TreeNode]) -> str:
    lines = [
        # 🎯 新增的控制按钮区域
        '<div style="display: flex; gap: 10px; margin-bottom: 15px;">',
        '  <button class="md-button" onclick="document.querySelectorAll(\'.kb-static-tree details\').forEach(e => e.open = true)">全部展开</button>',
        '  <button class="md-button" onclick="document.querySelectorAll(\'.kb-static-tree details\').forEach(e => e.open = false)">全部收起</button>',
        '</div>',
        
        # 原本的树状目录开头
        '<div class="kb-tree kb-static-tree">', 
        '  <ul class="kb-static-tree__root">'
    ]
    for node in nodes:
        lines.extend(render_item(node, 2))
    lines.extend(["  </ul>", "</div>"])
    return "\n".join(lines)


def render_item(node: TreeNode, depth: int) -> list[str]:
    indent = "  " * depth
    title = html.escape(node.title)
    # 对于纯文件（叶子节点），保留原本的 a 标签跳转逻辑
    link = f'<a href="{html.escape(node.url, quote=True)}">{title}</a>' if node.url else title

    # 如果没有子节点，直接渲染
    if not node.children:
        return [f'{indent}<li class="kb-static-tree__item">{link}</li>']

    open_attr = " open" if depth <= 2 else ""
    lines = [
        f'{indent}<li class="kb-static-tree__item">',
        f'{indent}  <details class="kb-static-tree__branch"{open_attr}>',
        # 把 <summary> 里面的 {link} 替换成了纯文本 {title}，消除 HTML 违规警告
        f'{indent}    <summary><span class="kb-static-tree__chevron" aria-hidden="true"></span>{title}</summary>',
        f'{indent}    <div class="kb-static-tree__children">',
        f'{indent}      <ul>',
    ]
    
    # 如果这个父目录本身有 index.md 页面，我们把它作为子节点的第一项插入，供用户点击
    if node.url:
        lines.append(f'{indent}        <li class="kb-static-tree__item"><a href="{html.escape(node.url, quote=True)}">📄 {title} (概览)</a></li>')

    for child in node.children:
        lines.extend(render_item(child, depth + 3))
        
    lines.extend([
        f'{indent}      </ul>',
        f'{indent}    </div>',
        f'{indent}  </details>',
        f'{indent}</li>',
    ])
    return lines