define(['Vue2'], function (Vue) {
    var typeMap = {
        success: 'check',
        info: 'info',
        warning: 'warning',
        error: 'close'
    };
    var MessageComponent = {
        data: function data() {
            return {
                visible: false,
                message: "",
                duration: 3000,
                type: 'info',
                iconClass: '',
                customClass: '',
                onClose: null,
                timer: null,
                showClose: false,
                closed: false,
                center: false
            };
        },
        template: '<transition name="fade">\n  <div v-bind:class="[\n \'gd-message\',\n type ? \'gd-message-\'+type: \'\',\n center ? \'is-center\' : \'\',\n  showClose ? \'is-closable\' :\'\',\n   customClass]"\n  v-show="visible">\n <i v-bind:class="iconClass" v-if="iconClass"></i>\n  <i v-bind:class="typeClass" v-else></i>\n  <slot>\n  <p class="message_content" v-html="message">\n  </p>\n  </slot>\n   <i v-if="showClose" class="message_closeBtn" @click="close"></i>\n   </div>\n  </transition>',
        //原版提示没有处理html标签//template: '<transition name="fade">\n  <div v-bind:class="[\n \'gd-message\',\n type ? \'gd-message-\'+type: \'\',\n center ? \'is-center\' : \'\',\n  showClose ? \'is-closable\' :\'\',\n   customClass]"\n  v-show="visible">\n <i v-bind:class="iconClass" v-if="iconClass"></i>\n  <i v-bind:class="typeClass" v-else></i>\n  <slot>\n  <p class="message_content">\n   {{message}}\n                  </p>\n  </slot>\n   <i v-if="showClose" class="message_closeBtn" @click="close"></i>\n   </div>\n  </transition>',
        computed: {
            iconWrapClass: function iconWrapClass() {
                var classes = ['gd-message__icon'];
                if (this.type && !this.iconClass) {
                    classes.push('gd-message__icon--' + this.type);
                }
                return classes;
            },
            typeClass: function typeClass() {
                return this.type && !this.iconClass ? ' fa fa-' + typeMap[this.type] : '';
            }
        },
        watch: {
            closed: function closed(newVal) {

                if (newVal) {
                    this.visible = false;
                    this.$el.addEventListener('transitionend', this.destroyElement);
                }
            }
        },
        methods: {
            destroyElement: function destroyElement() {
                this.$el.removeEventListener('transitionend', this.destroyElement);
                this.$destroy(true);
                this.$el.parentNode.removeChild(this.$el);
            },
            close: function close() {
                this.closed = true;
                if (typeof this.onClose === 'function') {
                    this.onClose(this);
                }
            },
            clearTimer: function (_clearTimer) {
                function clearTimer() {
                    return _clearTimer.apply(this, arguments);
                }

                clearTimer.toString = function () {
                    return _clearTimer.toString();
                };

                return clearTimer;
            }(function () {
                clearTimer(this.timer);
            }),
            startTimer: function startTimer() {
                var _this = this;
                if (this.duration > 0) {
                    this.timer = setTimeout(function () {
                        if (!_this.closed) _this.close();
                    }, this.duration);
                }
            },
            keydown: function keydown(e) {
                if (e.keyCode === 27) {
                    if (!this.closed) {
                        this.close();
                    }
                }
            }
        },
        mounted: function mounted() {
            this.startTimer();
            document.addEventListener('keydown', this.keydown);
        },
        beforeDestroy: function beforeDestroy() {
            document.removeEventListener('keydown', this.keydown);
        }
    };

    /**
     * 每个插件都有的install方法，用于安装插件
     * @param {Object} Vue - Vue类
     * @param {Object} [pluginOptions] - 插件安装配置
     */
    var message = {};
    var seed = 1;
    var instance;
    var instances = [];
    message.install = function (Vue) {
        var pluginOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // 生成一个Vue的子类
        var MessageConstructor = Vue.extend(MessageComponent);
        
        // 生成一个该子类的实例

        var Message = function Message(options) {
            options = options || {};
            if (typeof options === 'string') {
                options = {
                    message: options
                };
            }
            var userOnClose = options.onClose;
            var id = 'message_' + seed++;

            options.onClose = function () {
                Message.close(id, userOnClose);
            };
            instance = new MessageConstructor({
                data: options
            });
            instance.id = id;
            // 将这个实例挂载在空节点上
            instance.vm = instance.$mount();
            // 并将此div加入全局挂载点内部
            document.body.appendChild(instance.vm.$el);
            instance.vm.visible = true;
            instances.push(instance);
            return instance.vm;
        };
        ['success', 'warning', 'info', 'error'].forEach(function (type) {
            Message[type] = function (options) {
                if (typeof options === 'string') {
                    options = {
                        message: options
                    };
                }
                options.type = type;
                return Message(options);
            };
        });
        Message.close = function (id, userOnClose) {
            for (var i = 0, len = instances.length; i < len; i++) {
                if (id === instances[i].id) {
                    if (typeof userOnClose === 'function') {
                        userOnClose(instances[i]);
                    }
                    instances.splice(i, 1);
                    break;
                }
            }
        };
        Message.closeAll = function () {
            for (var i = instances.length - 1; i > 0; i--) {
                instances[i].close();
            }
        };

        // 通过Vue的原型注册一个方法, 让所有实例共享这个方法 
        Vue.prototype.$message = Message;
    };
    
    if (typeof window !== 'undefined' && Vue) {
        Vue.use(message);
    };
});