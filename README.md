# Cascader
基于jQuery，样式模仿ElementUI的级联选择器

### 使用说明

``` html
  <input type="text" id="test"/>
```

``` js
  $('#test').zdCascader({
    data: citys,
    container: '#test',
    search: true,
    onChange: function(value, label, datas){
      console.log(value, label, datas);
    }
  });
```