#!/bin/bash

# 进入指定的目录
cd /home/coper/KnowledgeBase/ || exit 1

# 执行 git 操作
git add .
git commit -m "Auto Commit"
git push

# 部署 MkDocs
mkdocs gh-deploy
