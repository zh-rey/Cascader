# Cascader
基于jQuery，样式模仿ElementUI的级联选择器

### 使用说明

``` html
  <input type="text" id="test"/>
```
``` js
  <script src="./jquery.min.js"></script>
  <script src="./cascader.js"></script>
```

``` js
  $('#test').zdCascader({
    data: citys, // 数据源
    container: '#test', // input框ID
    search: true, // 是否支持搜索
    onChange: function(value, label, datas){ // 选择监听
      console.log(value, label, datas);
    }
  });
```