'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['Vue2'], function (Vue) {
    var prefixCls = 'gd-loading';
    var LoadingComponent = {
        name: 'Loading',
        props: {
            fix: {
                type: Boolean,
                default: true
            },
            fullscreen: {
                type: Boolean,
                default: false
            },
            loadingText: {
                type: String,
                default: ''
            }
        },
        data: function data() {
            return {
                showText: false,
                //使用在Vue全局方法$loading
                visible: false
            };
        },
        template: '<transition name="fade">\n        <div :class=\'classes\' v-if=\'fullscreenVisble\'>\n          <div :class=\'mainClasses\'>\n            <span :class=\'dotClasses\'></span>\n            <div :class=\'textClasses\'>{{loadingText}}</div>\n          </div>\n        </div>\n    </transition>',
        computed: {
            classes: function classes() {
                var _ref;

                return ['' + prefixCls, (_ref = {}, _defineProperty(_ref, prefixCls + '-fix', this.fix), _defineProperty(_ref, prefixCls + '-showText', this.showText), _ref)];
            },
            mainClasses: function mainClasses() {
                return prefixCls + '-main';
            },
            dotClasses: function dotClasses() {
                return prefixCls + '-dot';
            },
            textClasses: function textClasses() {
                return prefixCls + '-text';
            },
            fullscreenVisble: function fullscreenVisble() {
                if (this.fullscreen) {
                    return this.visible;
                } else {
                    return true;
                }
            }
        },
        mounted: function mounted() {
            console.log(this.classes);

            //this.showText = this.$slots.default !==undefined
        }
    };

    /**
     * 每个插件都有的install方法，用于安装插件
     * @param {Object} Vue - Vue类
     * @param {Object} [pluginOptions] - 插件安装配置
     */
    var LoadingPlugin = {};
    LoadingPlugin.install = function (Vue) {
        var pluginOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // 创建"子类"方便挂载
        var VueLoading = Vue.extend(LoadingComponent);
        var loading = null;
        /**
         * 初始化并显示loading
         */
        function $loading(options) {

            // 第一次调用
            if (!loading) {
                loading = new VueLoading();

                // 手动创建一个未挂载的实例
                loading.$mount();
                // 挂载
                document.querySelector(pluginOptions.container || 'body').appendChild(loading.$el);
            }
            if (typeof options === 'string') {
                loading.loadingText = options;
            } else if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
                for (var i in options) {
                    loading[i] = options[i];
                }
            }
            loading.fullscreen = true;
            // 显示loading
            loading.visible = true;
        }
        // 定义关闭loading方法
        $loading.end = function () {
            if(loading) loading.visible = false;
            
        };
        //挂载到Vue原型上面，可以之间使用原型方法调用
        Vue.loading = Vue.prototype.$loading = $loading;
    };
    if (typeof window !== 'undefined' && Vue) {
        Vue.use(LoadingPlugin);
    };
    //导出组件，可以以组件的方式使用
    return LoadingComponent;
});