# FPGA从入门到放弃

温馨提示，建议预留内存不少于250G，最好300G+

## 安装

搭环境，没得说，直接下载`Vivado`，我选择的是`2023.2`版本

需要下载很大的东西，大概一百来GB，中间老断，直接上**IDM**，挂个一两天即可

![](FPGA从入门到放弃\image-20251230190241742.png)

![](FPGA从入门到放弃\image-20251230190632249.png)

然后解压并双击`xsetup.exe`安装即可

没得选的直接往后点，这一步选第一个

![](FPGA从入门到放弃\image-20251230192628180.png)

这一步忒大了，我电脑装不下，可以减少一些不必要的（按需）

![](FPGA从入门到放弃\image-20251230192719742.png)

把该同意的都同意的，就可以安装了，再等几天就完成了

## 写代码

安装好了之后，桌面上多了这些

![](FPGA从入门到放弃\image-20251230190537537.png)

别的不用管，就打开这个

![](FPGA从入门到放弃\image-20251230191020344.png)

主页长这样，直接新建一个，然后一路点击next

![](FPGA从入门到放弃\image-20251230191204860.png)

这个勾选上

![](FPGA从入门到放弃\image-20251230191259532.png)

选择自己的芯片，我哪知道我的芯片是啥，被散热挡住了都，问商家猜测是`xc7k325tffg676-2 `

![](FPGA从入门到放弃\image-20251230191538799.png)

点进`sources`，按`Alt+A`新建一个文件

![](FPGA从入门到放弃\image-20251230191649079.png)

名字可以直接和主文件夹相同（也可以不一样）

![](FPGA从入门到放弃\image-20251230191725190.png)

我们把原本的去掉，替换为下面内容，这是一个选择器

```
module mux2(
    a,
    b,
    sel,
    out
);

    input a;
    input b;
    input sel;
    output out;

    assign out = ( sel == 0 ) ? a : b;

endmodule 
```

然后点进去模拟

![](FPGA从入门到放弃\image-20251230191950299.png)

看起来和期望的一样

![](FPGA从入门到放弃\image-20251230192101155.png)

## 仿真

新建一个仿真文件，也是`Alt+A`，但是这次选第三个

![](FPGA从入门到放弃\image-20251230192458794.png)

这是对应的代码，相当于给输入线一个定义

```
`timescale 1ns/1ns

module mux2_tb();

reg S0;
reg S1;
reg S2;

wire mux2_out;

mux2 mux2_inst0(
    .a(S0),
    .b(S1),
    .sel(S2),
    .out(mux2_out)
);

initial begin
    S2 = 0; S1 = 0; S0 = 0;
    #20;
    S2 = 0; S1 = 0; S0 = 1;
    #20;
    S2 = 0; S1 = 1; S0 = 0; 
    #20; 
    S2 = 0; S1 = 1; S0 = 1; 
    #20; 
    S2 = 1; S1 = 0; S0 = 0; 
    #20; 
    S2 = 1; S1 = 0; S0 = 1; 
    #20; 
    S2 = 1; S1 = 1; S0 = 0; 
    #20; 
    S2 = 1; S1 = 1; S0 = 1; 
    #20; 
end

endmodule
```

然后点左边这个，会出现右边这个东东

![](FPGA从入门到放弃\image-20251230193117066.png)

就相当于我们要的流程图

可能出现闪退，因为需要 `电脑名没有中文 && 电脑的当前用户名没有中文`

改好重启即可

## 烧录

最后就是烧录到开发板了，选择IO Planing

![](FPGA从入门到放弃\image-20251230193458479.png)

安装开发板原理图直接设置即可，没有的地方是隐藏了，和excel一样，鼠标拉开即可

这里只需要定义引脚和使能电压

![](FPGA从入门到放弃\image-20251230193743663.png)

![](FPGA从入门到放弃\image-20251230193552964.png)

然后`Ctrl+S`保存，得到一个xdc文件

![](FPGA从入门到放弃\image-20251230193649846.png)

然后编译即可

![](FPGA从入门到放弃\image-20251230193827676.png)

如果出现报错说没有证书，直接把下面这段内容写入txt，然后更名为`license.lic`即可，如何导入自己去搜

```
INCREMENT VIVADO_HLS xilinxd 2037.05 permanent uncounted AF3E86892AA2 \
	VENDOR_STRING=License_Type:Bought HOSTID=ANY ISSUER="Xilinx \
	Inc" START=19-May-2016 TS_OK
INCREMENT Vivado_System_Edition xilinxd 2037.05 permanent uncounted \
	A1074C37F742 VENDOR_STRING=License_Type:Bought HOSTID=ANY \
	ISSUER="Xilinx Inc" START=19-May-2016 TS_OK
PACKAGE Vivado_System_Edition xilinxd 2037.05 DFF4A65E0A68 \
	COMPONENTS="ISIM ChipScopePro_SIOTK PlanAhead ChipscopePro XPS \
	ISE HLS_Synthesis AccelDSP Vivado Rodin_Synthesis \
	Rodin_Implementation Rodin_SystemBuilder \
	PartialReconfiguration AUTOESL_FLOW AUTOESL_CC AUTOESL_OPT \
	AUTOESL_SC AUTOESL_XILINX petalinux_arch_ppc \
	petalinux_arch_microblaze petalinux_arch_zynq ap_sdsoc SDK \
	SysGen Simulation Implementation Analyzer HLS Synthesis \
	VIVADO_HLS" OPTIONS=SUITE
	
# 2037年之前的任何Vivado版本（包括HLS、AccelDSP、System Generator、软硬CPU、SOC、嵌入式Linux、重配置等等功能）都是永久使用。使用本license文件时要改名，文件名不能有汉字和空格。
```

可以改内核数，不过这无所谓了，直接OK

![](FPGA从入门到放弃\image-20251230194146401.png)

按这个sigma可以看进度

![](FPGA从入门到放弃\image-20251230194213410.png)

如果没有报错的话就没有报错了，然后连接开发板

![](FPGA从入门到放弃\image-20251230194308730.png)

不出意外就要出意外了，我找不到一点开发板

![](FPGA从入门到放弃\image-20251230194352144.png)

后面发现，好像要下载器呜呜

![](FPGA从入门到放弃\image-20251230194515611.png)



看了一下价格，遂放弃，以失败告终

---

参考来源：`https://www.bilibili.com/video/BV1va411c7Dz/`第三章
