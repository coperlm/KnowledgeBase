这次要讲的是25年的一篇S&P

JesseQ，是一种基于VOLE的零知识证明，你问VOLE是什么？你知道它有一定的同态性就行

![slide_001](JesseQ第一次组会讲解/slide_001.jpg)

它的基本逻辑是：对于一个算数电路，我们把它抽象为只有乘法和加法。最初P和V协商（Setup初始化，也是offline阶段）锁定V的全局私钥$x$（指定验证者）；承诺阶段是通过计算加法门来实现（后面会给出具体操作），证明和验证阶段是针对乘法门计算（核心和精髓）。

![slide_002](JesseQ第一次组会讲解/slide_002.jpg)

这是目录喵

![slide_004](JesseQ第一次组会讲解/slide_004.jpg)

![slide_005](JesseQ第一次组会讲解/slide_005.jpg)

首先是一个叫IT-MAC的东东，甭管IT是什么，反正MAC就是你知道的消息认证码的意思

它的公式是$m=k-x\cdot u$，具体含义见PPT，描述挺详细的我觉得

![slide_006](JesseQ第一次组会讲解/slide_006.jpg)

![slide_007](JesseQ第一次组会讲解/slide_007.jpg)

![slide_008](JesseQ第一次组会讲解/slide_008.jpg)

这里有举具体数字的例子

![slide_009](JesseQ第一次组会讲解/slide_009.jpg)

![slide_010](JesseQ第一次组会讲解/slide_010.jpg)

这里红色是不能获取到的，可以看出无法解出对方的私有内容

![slide_011](JesseQ第一次组会讲解/slide_011.jpg)

我们可以利用IT-MAC的加法同态性，对加法进行承诺并构建很多组$m_i=k_i-x\cdot u_i$

![slide_012](JesseQ第一次组会讲解/slide_012.jpg)

![slide_013](JesseQ第一次组会讲解/slide_013.jpg)

接下来是乘法门，借助多项式证明的，PPT也很清楚 不再赘述

![slide_014](JesseQ第一次组会讲解/slide_014.jpg)

原本每个门都需要传$a_0,a_1$，现在有了QuickSilver就只需要传每个门“揉“在一起的结果

![slide_015](JesseQ第一次组会讲解/slide_015.jpg)

这里需要订正一下，这里的掩码传输并不安全，应该2PC来生成（下次具体讲）

![slide_016](JesseQ第一次组会讲解/slide_016.jpg)

![slide_017](JesseQ第一次组会讲解/slide_017.jpg)

![slide_018](JesseQ第一次组会讲解/slide_018.jpg)

![slide_019](JesseQ第一次组会讲解/slide_019.jpg)

![slide_020](JesseQ第一次组会讲解/slide_020.jpg)

![slide_021](JesseQ第一次组会讲解/slide_021.jpg)

![slide_022](JesseQ第一次组会讲解/slide_022.jpg)

![slide_023](JesseQ第一次组会讲解/slide_023.jpg)

![slide_024](JesseQ第一次组会讲解/slide_024.jpg)

![slide_025](JesseQ第一次组会讲解/slide_025.jpg)

![slide_027](JesseQ第一次组会讲解/slide_027.jpg)

![slide_028](JesseQ第一次组会讲解/slide_028.jpg)

后一半感觉挺清楚的，留个PPT在这；后面的工作是把JesseQ讲清楚一些
