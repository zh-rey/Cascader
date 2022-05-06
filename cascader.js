        /**
         * @author: Zhang Dong
         * @version: v1.0.1
         */

        ;
        (function ($) {
            var _keyCodes = {
                ESC: 27,
                TAB: 9,
                RETURN: 13,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                ENTER: 13,
                SHIFT: 16
            }

            function ZdCascader(el, options) {
                this.options = options;
                if (options.search) this.getLabelList();
                this.CLASS = ZdCascader.CLASS;
                this.$el = $(el); //input
                this.$el_ = this.$el.clone();

                this.init();
            }
            ZdCascader.CLASS = {
                wrap: "zd-cascader-wrap",
                inputwrap: "zd-input zd-input--suffix",
                input: "zd-input__inner",
                iconWrap: "zd-input__suffix",
                iconInnerWrap: "zd-input__suffix-inner",
                icon: "icon zd-input__icon zd-icon-arrow-down",
                dropdownWrap: "zd-cascader__dropdown",
                dropdownPanel: "zd-cascader-panel",
                menuWrap: "zd-cascader-menu",
                menuList: "zd-cascader-menu__list",
                menuNode: "zd-cascader-node",
                menuNodeLabel: "zd-cascader-node__label",
                menuNodePostfix: "zd-cascader-node__postfix",
                checkClass: {
                    wrapFocus: 'is-focus',
                    menuNodeSelected: "in-active-path",
                    nodeSelectedIcon: "is-selected-icon",
                    nodeAnchor: "is-prepare" //预备选中
                }
            }
            ZdCascader.DEFAULTS = {
                data: null, //支持格式[{value:"",label:"",children:[{value:"",label:""}]}]
                range: ' / ', //分割符
                onChange: function (data) {}
            }

            ZdCascader.METHODS = ['reload', 'destroy'];

            ZdCascader.prototype.init = function () {
                /*构建基础html*/
                this._construct();
                /*事件绑定*/
                this._event();
            }


            //构建Cascader的html
            ZdCascader.prototype._construct = function () {
                var self = this;
                //最外层容器
                this.$container = this.$el.wrap(`<div class="${this.CLASS.wrap}"></div>`)
                    .wrap(`<div class="${this.CLASS.inputwrap}"></div>`).addClass(this.CLASS.input).prop('readonly', !this.options.search).closest('.' + this.CLASS.wrap);

                //文本框右侧图标
                this.$arrow = $(`<span class="zd-input__suffix">
                                    <span class="zd-input__suffix-inner">
                                        <svg t="1600158452164" class="icon zd-input__icon zd-icon-arrow-down" viewBox="0 0 1024 1024"
                                            version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1181" width="200" height="200">
                                            <path
                                                d="M538.434046 617.504916c0 3.687996-1.403976 7.356548-4.211928 10.1645-5.615904 5.615904-14.713097 5.615904-20.329001 0L364.187513 476.931297c-5.615904-5.615904-5.615904-14.713097 0-20.329001 5.615904-5.615904 14.713097-5.615904 20.329001 0l149.705604 150.739143C537.03007 610.148367 538.434046 613.817943 538.434046 617.504916z"
                                                p-id="1182" fill="#515151"></path>
                                            <path
                                                d="M689.172165 466.767819c0 3.687996-1.403976 7.356548-4.211928 10.1645L534.222117 627.670439c-5.615904 5.615904-14.713097 5.615904-20.329001 0-5.615904-5.615904-5.615904-14.713097 0-20.329001L664.631236 456.603319c5.615904-5.615904 14.713097-5.615904 20.329001 0C687.768189 459.411271 689.172165 463.079824 689.172165 466.767819z"
                                                p-id="1183" fill="#515151"></path>
                                        </svg>
                                    </span>
                                </span>`).insertAfter(this.$el);
                //下拉列表
                this.$dropdownWrap = $(`<div class="${this.CLASS.dropdownPanel}"></div>`).appendTo(this.$container).wrap(`<div class="${this.CLASS.dropdownWrap}"></div>`);

                this.reload();
            }

            /*事件绑定*/
            ZdCascader.prototype._event = function () {
                this.$container.on('click.wrap', $.proxy(this._wrapClick, this));
                this.$container.on('mousedown', $.proxy(function (event) {
                    this.$el.focus();
                    event.stopPropagation();
                }, this));
                $(document).on('mousedown.cascader', $.proxy(function () {
                    this.$container.removeClass(this.CLASS.checkClass.wrapFocus);
                }, this));

                this.$container.on('blur.wrap', $.proxy(function () {
                    this.$container.removeClass(this.CLASS.checkClass.wrapFocus);
                }, this));

                this.$container.on('click.item', '.' + this.CLASS.menuNode, $.proxy(this._nodeClick, this));

                this.$el.on('keyup.wrap', $.proxy(this._keyup, this));

                this.$el.on('input', $.proxy(function (event) {
                  this.search(this.$el.val())
                }, this));
            }
            ZdCascader.prototype._wrapClick = function () {
                event.stopPropagation();
                this.$el.focus();
                if (!this.$container.hasClass(this.CLASS.checkClass.wrapFocus)) {
                    // if (this.$dropdownWrap.children(this.CLASS.menuWrap).length === 0)
                    //     loadFirst();
                    this.$container.addClass(this.CLASS.checkClass.wrapFocus);
                }
                this.$dropdownWrap.find('li.' + this.CLASS.checkClass.nodeAnchor).removeClass(this.CLASS
                    .checkClass.nodeAnchor);
                this.$dropdownWrap.find(this.CLASS.menuList).eq(0).find('li.' + this.CLASS.checkClass
                    .menuNodeSelected).addClass(this.CLASS.checkClass.nodeAnchor);
            }
            ZdCascader.prototype._nodeClick = function (event) {
                var $that = event.currentTarget ? $(event.currentTarget) : $(event); //li  
                var $wrap = $that.closest('.' + this.CLASS.menuWrap);
                $that.addClass(this.CLASS.checkClass.menuNodeSelected).siblings().removeClass(this.CLASS.checkClass.menuNodeSelected);
                var data = $that.data('bindData');
                if (!data.children) {
                    $wrap.nextAll().remove();
                    var prevWrap = $wrap.prevAll();
                    var value = data.label;
                    var allPathData = [data];
                    $.each(prevWrap, (i, m) => {
                        var selectedData = $(m).find('li.' + this.CLASS.checkClass
                            .menuNodeSelected).data(
                            'bindData');
                        value = selectedData.label + this.options.range + value;
                        allPathData.push(selectedData);
                    });
                    this.$el.val(value).focus();
                    this.$container.removeClass(this.CLASS.checkClass.wrapFocus);
                    this.$dropdownWrap.find('.' + this.CLASS.checkClass.nodeSelectedIcon).remove();
                    $that.prepend($(`<span class="${this.CLASS.checkClass.nodeSelectedIcon}">√</span>`));
                    this.$el.data('bindData', data);
                    this.$el.data('bindPathData', allPathData);
                    if (this.options.onChange && typeof this.options.onChange === "function")
                        this.options.onChange(this, data, allPathData);
                    event.stopPropagation();
                } else
                    this._loadChildren($that);
            }
            ZdCascader.prototype._loadChildren = function ($parentNode) {
                this.$el.focus();
                $parentNode.addClass(this.CLASS.checkClass.menuNodeSelected).siblings().removeClass(this.CLASS.checkClass.menuNodeSelected);
                var $wrap = $parentNode.closest('.' + this.CLASS.menuWrap);
                var data = $parentNode.data('bindData');
                this.$dropdownWrap.find('li.' + this.CLASS.checkClass.nodeAnchor).removeClass(this.CLASS
                    .checkClass.nodeAnchor);
                $parentNode.addClass(this.CLASS.checkClass.nodeAnchor);
                if (!data.children) {
                    $wrap.nextAll().remove();
                    return
                }
                var selectedId = [];
                var pathData = this.$el.data('bindPathData');
                if (pathData && pathData.length > 0) {
                    selectedId = $.map(pathData, m => {
                        return m.value
                    });
                }
                var $nextWrap = $wrap.next();
                if (!$nextWrap || $nextWrap.length === 0) {
                    $nextWrap = $(`<div class="zd-scrollbar ${this.CLASS.menuWrap}">
                                        <div class="zd-cascader-menu__wrap zd-scrollbar__wrap">
                                            <ul class="${this.CLASS.menuList}">
                                            </ul>
                                        </div>
                                    </div>`);
                    $nextWrap = $nextWrap.appendTo(this.$dropdownWrap);
                }
                $nextWrap.nextAll().remove();
                var $ul = $nextWrap.find('.' + this.CLASS.menuList).empty();
                $.each(data.children, (i, m) => {
                    var $li = $(`<li class="${this.CLASS.menuNode}"></li>`);
                    var $label = $(`<span class="${this.CLASS.menuNodeLabel}">${m.label}</span>`);
                    var $icon = $(`<svg t="1600158452164"
                                        class="icon zd-input__icon zd-icon-arrow-right ${this.CLASS.menuNodePostfix}"
                                        viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1181"
                                        width="200" height="200">
                                        <path
                                            d="M538.434046 617.504916c0 3.687996-1.403976 7.356548-4.211928 10.1645-5.615904 5.615904-14.713097 5.615904-20.329001 0L364.187513 476.931297c-5.615904-5.615904-5.615904-14.713097 0-20.329001 5.615904-5.615904 14.713097-5.615904 20.329001 0l149.705604 150.739143C537.03007 610.148367 538.434046 613.817943 538.434046 617.504916z"
                                            p-id="1182" fill="#515151"></path>
                                        <path
                                            d="M689.172165 466.767819c0 3.687996-1.403976 7.356548-4.211928 10.1645L534.222117 627.670439c-5.615904 5.615904-14.713097 5.615904-20.329001 0-5.615904-5.615904-5.615904-14.713097 0-20.329001L664.631236 456.603319c5.615904-5.615904 14.713097-5.615904 20.329001 0C687.768189 459.411271 689.172165 463.079824 689.172165 466.767819z"
                                            p-id="1183" fill="#515151"></path>
                                    </svg>`);
                    $li.append($label).data('bindData', m);
                    if (m.children && m.children.length > 0) $li.append($icon);
                    else if (selectedId.indexOf(m.value) >= 0) {
                        this.$dropdownWrap.find('.' + this.CLASS.checkClass.nodeSelectedIcon).remove();
                        $li.addClass(this.CLASS.checkClass.menuNodeSelected).prepend($(
                            `<span class="${this.CLASS.checkClass.nodeSelectedIcon}">√</span>`));
                    }
                    $li.appendTo($ul);
                });
            }
            //销毁
            ZdCascader.prototype.destroy = function () {
                $(this.$el).insertAfter(this.$el_);
                this.$el.remove();
            }
            //获取名称列表
            ZdCascader.prototype.getLabelList = function () {
              var datas = [];
              this.options.data.forEach(function(prov) {
                if (prov.children) {
                  prov.children.forEach(function(city) {
                    if (city.children) {
                      city.children.forEach(function(area) {
                        datas.push({
                          label: `${prov.label} / ${city.label} / ${area.label}`,
                          labels: [prov.label, city.label, area.label],
                          value: [prov.value, city.value, area.value],
                        })
                      })
                    } else {
                      datas.push({
                        label: `${prov.label} / ${city.label}`,
                        labels: [prov.label, city.label],
                        value: [prov.value, city.value],
                      })
                    }
                  })
                } else {
                  datas.push({
                    label: prov.label,
                    labels: [prov.label],
                    value: prov.value,
                  })
                }
              })
              this.labelList = datas
            }
            //搜索
            ZdCascader.prototype.search = function (keyword) {
              if (keyword) keyword = keyword.trim();
              if (!keyword) {
                this.options.keyword = keyword;
                this.reload(null, true)
                return
              };
              var keywords = keyword.replace(' ','').replace('/','').split('')
              var data = this.labelList.filter(function(item) {
                item.num = 0
                keywords.forEach(function(key) {
                  if (item.label.includes(key)) item.num++
                })
                if (item.label.includes(keyword)) item.num += 2
                return item.num>(keywords.length==1?0:1)
              }).sort(function(a, b) {
                return b.num - a.num
              }).slice(0, 10)
              this.reload(data, true)
            }
            //关键词筛选数据（暂不用）
            ZdCascader.prototype.searchData = function (keyword) {
              var data = [];
              this.options.data.forEach(function(prov){
                if(prov.label.indexOf(keyword) >= 0){
                  data.push(prov)
                } else {
                  if(prov.children){
                    var citys = []
                    prov.children.forEach(function(city){
                      if(city.label.indexOf(keyword) >= 0){
                        citys.push(city)
                      } else {
                        if(city.children){
                          var areas = []
                          city.children.forEach(function(area){
                            if(area.label.indexOf(keyword) >= 0){
                              areas.push(area)
                            }
                          })
                          if(areas.length > 0){
                            citys.push({
                              value: city.value,
                              label: city.label,
                              children: areas
                            })
                          }
                        }
                      }
                    })
                    if (citys.length > 0) {
                      data.push({
                        label: prov.label,
                        value: prov.value,
                        children: citys
                      })
                    }
                  }
                }
              });
            }
            //重新加载下拉数据
            ZdCascader.prototype.reload = function (data, search) {
                data = data || this.options.data;
                this.$el.removeData('bindData').removeData('bindPathData');
                if (!search) this.$el.val('');
                this.$dropdownWrap.empty();
                var selectedData = this.$el.data('bindData');
                var $firstWrap = $(`<div class="zd-scrollbar ${this.CLASS.menuWrap}">
                                            <div class="zd-cascader-menu__wrap zd-scrollbar__wrap">
                                                <ul class="${this.CLASS.menuList}">
                                                </ul>
                                            </div>
                                        </div>`);
                var $ul = $firstWrap.find('.' + this.CLASS.menuList);
                $.each(data, (i, m) => {
                    var $li = $(`<li class="${this.CLASS.menuNode}"></li>`);
                    var $label = $(`<span class="${this.CLASS.menuNodeLabel}">${m.label}</span>`);
                    var $icon = $(`<svg t="1600158452164"
                                        class="icon zd-input__icon zd-icon-arrow-right ${this.CLASS.menuNodePostfix}"
                                        viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1181"
                                        width="200" height="200">
                                        <path
                                            d="M538.434046 617.504916c0 3.687996-1.403976 7.356548-4.211928 10.1645-5.615904 5.615904-14.713097 5.615904-20.329001 0L364.187513 476.931297c-5.615904-5.615904-5.615904-14.713097 0-20.329001 5.615904-5.615904 14.713097-5.615904 20.329001 0l149.705604 150.739143C537.03007 610.148367 538.434046 613.817943 538.434046 617.504916z"
                                            p-id="1182" fill="#515151"></path>
                                        <path
                                            d="M689.172165 466.767819c0 3.687996-1.403976 7.356548-4.211928 10.1645L534.222117 627.670439c-5.615904 5.615904-14.713097 5.615904-20.329001 0-5.615904-5.615904-5.615904-14.713097 0-20.329001L664.631236 456.603319c5.615904-5.615904 14.713097-5.615904 20.329001 0C687.768189 459.411271 689.172165 463.079824 689.172165 466.767819z"
                                            p-id="1183" fill="#515151"></path>
                                    </svg>`);
                    $li.append($label).data('bindData', m);
                    if (m.children && m.children.length > 0) $li.append($icon);
                    else if (selectedData && m.value == selectedData.value) {
                        this.$dropdownWrap.find('.' + this.CLASS.checkClass.nodeSelectedIcon).remove();
                        $li.prepend($(`<span class="${this.CLASS.checkClass.nodeSelectedIcon}">√</span>`));
                    }
                    $ul.append($li);
                });
                this.$dropdownWrap.find('li.' + this.CLASS.checkClass.nodeAnchor).removeClass(this.CLASS.checkClass.nodeAnchor);
                this.$dropdownWrap.append($firstWrap).find(this.CLASS.menuNode).eq(0).focus().addClass(this.CLASS.checkClass
                    .nodeAnchor);
            }
            ZdCascader.prototype._keyup = function (event) {
                var keycode = event.which;
                switch (keycode) {
                    case _keyCodes.DOWN:
                        this._movedown();
                        break;
                    case _keyCodes.UP:
                        this._moveup();
                        break;
                    case _keyCodes.LEFT:
                        this._moveleft();
                        break;
                    case _keyCodes.RIGHT:
                        this._moveright();
                        break;
                    case _keyCodes.ENTER:
                        this._keyenter();
                        break;
                    case _keyCodes.ESC:
                        this._keyesc();
                        break;
                    default:
                        break;
                }
            }

            ZdCascader.prototype._movedown = function () {
                var $selected;
                if (!this.$container.hasClass(this.CLASS.checkClass.wrapFocus)) {
                    this.$container.trigger('click');
                    return
                }
                $selected = this.$dropdownWrap.find('.' + this.CLASS.menuNode + '.' + this.CLASS
                    .checkClass
                    .nodeAnchor);
                if ($selected.length === 0)
                    $selected = this.$dropdownWrap.find('.' + this.CLASS.menuWrap).eq(0).find('.' + this.CLASS
                        .menuNode).eq(0)
                    .addClass(
                        this.CLASS.checkClass.nodeAnchor);
                else if ($selected.next().length > 0)
                    $selected = $selected.removeClass(this.CLASS.checkClass.nodeAnchor).next()
                    .addClass(
                        this.CLASS
                        .checkClass.nodeAnchor);
                this._loadChildren($selected);
            }
            ZdCascader.prototype._moveup = function () {
                if (!this.$container.hasClass(this.CLASS.checkClass.wrapFocus)) return;
                var $selected = this.$dropdownWrap.find('.' + this.CLASS.menuNode + '.' + this.CLASS
                    .checkClass.nodeAnchor);
                if ($selected.length === 0) return;

                if ($selected.prev().length > 0)
                    $selected = $selected.removeClass(this.CLASS.checkClass.nodeAnchor).prev()
                    .addClass(
                        this.CLASS
                        .checkClass.nodeAnchor);
                this._loadChildren($selected);
            }
            ZdCascader.prototype._moveleft = function () {
                if (!this.$container.hasClass(this.CLASS.checkClass.wrapFocus)) return;
                var $selected = this.$dropdownWrap.find('.' + this.CLASS.menuNode + '.' + this.CLASS
                    .checkClass.nodeAnchor);
                if ($selected.length === 0) return;

                var $leftWrap = $selected.closest('.' + this.CLASS.menuWrap).prev();
                if ($leftWrap.length === 0) return;

                $selected.removeClass(this.CLASS.checkClass.nodeAnchor);
                $selected = $leftWrap.find('li.' + this.CLASS.checkClass.menuNodeSelected)
                    .length > 0 ?
                    $leftWrap.find('li.' + this.CLASS.checkClass.menuNodeSelected).eq(0) :
                    $leftWrap.find('li' + this.CLASS.menuNode).eq(0);
                $selected.addClass(this.CLASS.checkClass.nodeAnchor);
                this._loadChildren($selected);
            }
            ZdCascader.prototype._moveright = function () {
                if (!this.$container.hasClass(this.CLASS.checkClass.wrapFocus)) return;
                var $selected = this.$dropdownWrap.find('.' + this.CLASS.menuNode + '.' + this.CLASS
                    .checkClass.nodeAnchor);
                if ($selected.length === 0) return;

                var $rightWrap = $selected.closest('.' + this.CLASS.menuWrap).next();
                if ($rightWrap.length === 0) return;

                $selected.removeClass(this.CLASS.checkClass.nodeAnchor);
                $selected = $rightWrap.find('li.' + this.CLASS.menuNode).eq(0).addClass(
                    this.CLASS.checkClass
                    .nodeAnchor);
                this._loadChildren($selected);
            }
            ZdCascader.prototype._keyenter = function () {
                if (!this.$container.hasClass(this.CLASS.checkClass.wrapFocus)) return;
                var $selected = this.$dropdownWrap.find('.' + this.CLASS.menuNode + '.' + this.CLASS
                    .checkClass.nodeAnchor);
                if ($selected.length === 0) return;

                var $rightWrap = $selected.closest('.' + this.CLASS.menuWrap).next();
                if ($rightWrap.length !== 0) return;

                $selected.trigger('click');
            }
            ZdCascader.prototype._keyesc = function () {
                if (!this.$container.hasClass(this.CLASS.checkClass.wrapFocus)) return;
                this.$container.removeClass(this.CLASS.checkClass.wrapFocus);
                this.$el.focus();
            }

            $.fn.zdCascader = function (option) {
                var value,
                    args = Array.prototype.slice.call(arguments, 1);

                this.each(function () {
                    var $this = $(this),
                        data = $this.data('zdCascader'),
                        options = $.extend({}, ZdCascader.DEFAULTS, $this.data(),
                            typeof option === 'object' && option);

                    if (typeof option === 'string') {
                        if ($.inArray(option, ZdCascader.METHODS) < 0) {
                            throw new Error("Unknown method: " + option);
                        }

                        if (!data) {
                            return;
                        }

                        value = data[option].apply(data, args);

                        if (option === 'destroy') {
                            $this.removeData('zdCascader');
                        }
                    }

                    if (!data) {
                        $this.data('zdCascader', (data = new ZdCascader(this, options)));
                    }
                });

                return typeof value === 'undefined' ? this : value;
            };

        })(jQuery);