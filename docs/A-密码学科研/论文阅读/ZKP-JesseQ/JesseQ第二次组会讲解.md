继续上次的内容，具体讲JesseQ的算法

（上次的内容是前情提要，本次的内容全部建立在上次的基础上，主要体现在差异点）

文字部分是对PPT的补充

![](JesseQ第二次组会讲解/slide_002.jpg)

![](JesseQ第二次组会讲解/slide_003.jpg)

上次组会我是按直接运行2PC来理解的，但是实际上用到的是一个名为OT的东东，好像是叫什么不经意传输，反正可以当作可信第三方来用

![](JesseQ第二次组会讲解/slide_004.jpg)

JesseQ提出了三个这个$\mathcal{F}$的东东，其中$\mathcal{F}_{qsVOLE}^{p,r}$基于QuivkSilver模型，而又是JQv1和JQv2的基石

![](JesseQ第二次组会讲解/slide_005.jpg)

这是JesseQ的，前面的方案不一定这样更新

![](JesseQ第二次组会讲解/slide_006.jpg)

![](JesseQ第二次组会讲解/slide_007.jpg)

![](JesseQ第二次组会讲解/slide_008.jpg)

![](JesseQ第二次组会讲解/slide_009.jpg)

![](JesseQ第二次组会讲解/slide_010.jpg)

其实我也不知道他的式子怎么来的，但是看起来确实是正确的-并且作者也没有给正确性证明，故我这里用乘法门手动推了一下

![](JesseQ第二次组会讲解/slide_011.jpg)

![](JesseQ第二次组会讲解/slide_012.jpg)

![](JesseQ第二次组会讲解/slide_013.jpg)

这是一点小感悟，但是不知道如何优化~

![](JesseQ第二次组会讲解/slide_014.jpg)

这是我第一个idea，最终被证明不行了

```
该方案在正确性和安全性（零知识性与健全性）方面是可以保障的，但在效率上难以优于现有方案。
具体来说，对于 d=w−u，原方案中 u 由随机数生成器产生；若令 d 由类随机数生成器产生，则需要在在线阶段对 IT-MAC 进行额外绑定，因此整体效率不可能优于 JesseQ 论文中的方案。
```

![](JesseQ第二次组会讲解/slide_015.jpg)

![](JesseQ第二次组会讲解/slide_016.jpg)

![](JesseQ第二次组会讲解/slide_017.jpg)

![](JesseQ第二次组会讲解/slide_018.jpg)

![](JesseQ第二次组会讲解/slide_019.jpg)

然后这是另一个创新点，最终发现没什么意思，做起来不太划算

![](JesseQ第二次组会讲解/slide_020.jpg)

![](JesseQ第二次组会讲解/slide_021.jpg)

![](JesseQ第二次组会讲解/slide_022.jpg)

![](JesseQ第二次组会讲解/slide_023.jpg)

![](JesseQ第二次组会讲解/slide_024.jpg)

最后一个创新点，用TEE实现公开验证，但是比较草率

![](JesseQ第二次组会讲解/slide_025.jpg)

后续工作打算把那篇美密关于VOLEitH看了，在具体决定这个值不值得做
