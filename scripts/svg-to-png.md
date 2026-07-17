# SVG 转 PNG 指南

微信小程序 `image` 组件在基础库 2.28.0+ 已支持 SVG 格式直接引用。

如果你的目标基础库版本较低，需要将 SVG 转为 PNG。以下是几种转换方式：

## 方式一：在线工具（推荐，最简单）

1. 打开 https://svgtopng.com/ 或 https://cloudconvert.com/svg-to-png
2. 上传 `images/` 目录下的 SVG 文件
3. 设置输出尺寸为 200x200px
4. 下载 PNG 文件，命名为同名 `.png`

## 方式二：使用 sharp（Node.js，批量处理）

```bash
npm install sharp
```

然后运行：

```javascript
const sharp = require('sharp');
const fs = require('fs');

const files = ['icon-focus', 'icon-cognitive', 'icon-reaction', 'icon-memory', 'icon-flow'];

files.forEach(name => {
  sharp(`images/${name}.svg`)
    .resize(200, 200)
    .png()
    .toFile(`images/${name}.png`)
    .then(() => console.log(`Done: ${name}.png`));
});
```

## 方式三：微信开发者工具内置

直接在 WXML 中使用 SVG 路径的 image 标签（2.28.0+）：

```xml
<image src="/images/icon-focus.svg" class="icon" />
```

如果控制台报错，降级为 PNG 格式。
