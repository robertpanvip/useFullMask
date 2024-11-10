   

use-full-mask
=============

use-full-mask

[![NPM Version](https://img.shields.io/npm/v/use-full-mask?color=33cd56&logo=npm)](https://www.npmjs.com/package/use-full-mask)  [![NPM Version](https://img.shields.io/npm/dm/use-full-mask.svg?style=flat-square)](https://www.npmjs.com/package/use-full-mask)  [![unpacked size](https://img.shields.io/npm/unpacked-size/use-full-mask?color=green)](https://www.npmjs.com/package/use-full-mask)  [![Author](https://img.shields.io/badge/docs_by-robertpanvip@163.com-blue)](https://github.com/robertpanvip@163.com/use-full-mask.git)

📦 **Installation**
-------------------

    npm install use-full-mask

🏠 Exports
----------

### 

|参数|类型|
|---|---|
|📒MaskProps|`Interfaces`|
|🎗️default|`Functions`|

**📒Interfaces**
----------------

  
  

#### MaskProps

|参数|类型|说明|默认值|
|---|---|---|---|
|children|?: `React.ReactNode`|||
|className|?: `string`|||
|open|?: `boolean`|||

**🎗️Functions**
----------------

  
  

#### useFullMask

*   全局的页面上的蒙层 useFullMask 自定义 Hook，用于管理遮罩层（Mask）的渲染和状态控制。 重载 1: - 无参数调用时，提供基本的遮罩层元素、状态更新函数和初始的遮罩层属性。 重载 2: - 可以通过 \`defaultRender\` 自定义遮罩层内容，并可选择性提供遮罩层的配置 \`config\`。  
      
    
*   useFullMask(): \[`React.ReactElement`, `React.Dispatch`<`React.SetStateAction`<`MaskProps`\>\>, `MaskProps`\]
*   全局的页面上的蒙层 useFullMask 自定义 Hook，用于管理遮罩层（Mask）的渲染和状态控制。 重载 1: - 无参数调用时，提供基本的遮罩层元素、状态更新函数和初始的遮罩层属性。 重载 2: - 可以通过 \`defaultRender\` 自定义遮罩层内容，并可选择性提供遮罩层的配置 \`config\`。  
      
    
    #### Type Parameters
    
    *   P
        
        自定义渲染函数所需的属性类型。  
          
        
    
*   useFullMask<P\>(defaultRender:`DefaultRender`<P\>, config?:`Omit`<`MaskProps`, `"children"`\>): \[`React.ReactElement`, `React.Dispatch`<`React.SetStateAction`<P & `MaskProps`\>\>, `MaskProps`\]