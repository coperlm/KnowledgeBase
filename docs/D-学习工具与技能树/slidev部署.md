# slidev部署

本次在cachy os（arch linux）上成功运行slidev

## 不要下载CLI

因为slidev-CLI是全局的，如果安装了，需要每次都sudo才能运行，及其的不合适~

## 那我咋装

直接按[官网教程](https://cn.sli.dev/guide/)装

记得看好nodejs的版本，要22.0及以上的版本（用老牌LTS的有福了，首先排除我自己）

推荐使用pnpm，因为省空间~

```
npm install pnpm
pnpm create slidev
```

## localhostu打不开哇

实际运行的时候，出现了ipv4未启用，而 ipv6 的本地回环不通的情况

![ce6f1b4ab8931287a7ab87bd8d926bff.png](./images
/ce6f1b4ab8931287a7ab87bd8d926bff.png)

gemini说需要强制监听`pnpm exec slidev --host 0.0.0.0`；但是实际上最新版本的slidev并没有host命令（貌似是vite的指令，可以改为`-- --host`，但是依旧不能成功访问到），于是参照[CLI](https://cn.sli.dev/builtin/cli)的教程，只需直接运行`pnpm exec slidev --remote`即可，这样可以解决ipv4的问题

