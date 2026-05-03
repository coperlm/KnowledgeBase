# 关于wayland和x11

解决了部分应用输入法出问题（不能直接输入中文）的情况

具体问题描述：我安装了Zettlr，但是出现了打字的时候可能输入法失效，输入法是rime小鹤双拼，必须点进去重新选输入法才能打中文；并且我发现是切换页面的时候出现的，也就是我把页面切换到浏览器，再换回来就输入法没有中文了，浏览器还正常

原理是

```
现状：Electron 应用（如 Zettlr, Discord, VS Code, Obsidian）本质上是一个浏览器（Chromium）。虽然 Chromium 早就宣称支持 Wayland，但它对 **Linux 输入法协议（Text Input Protocol）** 的支持非常不稳定，经常在版本迭代中出现“回退”。

问题：在 Wayland 模式下，应用需要主动告诉输入法“我现在在这个坐标，请弹窗”。如果 Electron 这一块没写好（或者和你的 KDE/Fcitx5 版本不匹配），就会出现焦点丢失、无选词框、切回来无法输入等问题。
```

所以直接降级求稳，打开的时候加一句`\--ozone-platform=x11
`即可

用我刚刚弄好的zettlr为例

第一步：复制启动文件到用户目录
```
cp /usr/share/applications/zettlr.desktop ~/.local/share/applications/
```

第二步：编辑配置文件
```
nano ~/.local/share/applications/zettlr.desktop
```

第三步：修改 Exec 行
```
Exec=/usr/bin/zettlr --ozone-platform=x11 %U
```

例如我原本是

```
\[Desktop Entry]
Version=1.0
Type=Application
Name=Zettlr
Comment=A Markdown Editor for the 21st century
Exec=zettlr
Icon=zettlr
Terminal=false
StartupNotify=false
Categories=Office;
MimeType=text/markdown;
StartupWMClass=Zettlr
```

只需改为

```
[Desktop Entry]
Version=1.0
Type=Application
Name=Zettlr
Comment=A Markdown Editor for the 21st century
# ↓↓↓↓↓↓ 重点修改了这一行 ↓↓↓↓↓↓
Exec=zettlr --ozone-platform=x11 %U
# ↑↑↑↑↑↑ 重点修改了这一行 ↑↑↑↑↑↑
Icon=zettlr
Terminal=false
StartupNotify=false
Categories=Office;
MimeType=text/markdown;
StartupWMClass=Zettlr
```

然后重启应用即可