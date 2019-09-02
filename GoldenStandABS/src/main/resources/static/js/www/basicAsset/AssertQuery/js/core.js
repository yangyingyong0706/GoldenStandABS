
var Search = {
    registerSearchEvent: function () {
        $(".seachShow").click(function (event) {
            event.stopPropagation();
            $(".gsc-advfilter").stop().hide(0);
            $(".filter_box").stop().slideToggle(300);
            $(".VoucherBox").removeClass("seachStyle")
        })
        $(".clickSeach").click(function (event) {
            event.stopPropagation();
            $(".seachShow").toggleClass("seachStyle")
            $(".filter_box").stop().slideToggle(20);
            $(".filterMask").addClass("filterBox_hider")
        })
        $(".filter_box").click(function (event) {
            event.stopPropagation();
        })
        $("#grid").click(function () {
            $(".seachShow").removeClass("seachStyle")
            $(".VoucherBox").removeClass("seachStyle")
            $(".filter_box").stop().slideUp(300);
            $(".filterMask").addClass("filterBox_hider")
            $(".gsc-advfilter").stop().slideUp(300);
        })
        $(".filterMask").click(function () {
            $(".seachShow").removeClass("seachStyle")
            $(".VoucherBox").removeClass("seachStyle")
            $(".filter_box").stop().slideUp(300);
            $(".filterMask").addClass("filterBox_hider")
            $(".gsc-advfilter").stop().slideUp(300);
        })

    },
}

var GSFrameNav = function (title, url) {
    if (top.VM_Index && typeof top.VM_Index.Outer_SetNewNavNode === 'function') {
        top.VM_Index.Outer_SetNewNavNode(title, url);
    }
};

var GSFrameNavFull = function (title, url, gic) {
    if (top.VM_Index && typeof top.VM_Index.Outer_SetNewNavFull === 'function') {
        top.VM_Index.Outer_SetNewNavFull(title, url, gic);
    }
}

requirejs(['../../../asset/lib/config'], function (config) {
    require(['Vue', 'jquery', 'globalVariable', 'callApi'], function (Vue, $, gv, CallApi) {

        Vue.component('gsc-advancefilter', {
            props: {
                dbcn: { type: String, required: true },
                tmpl: { type: String, required: true }
                //,staflds: { type: Object }
            },
            template: '<div class="gsc-advfilter">\
                        <div class="gsc-advfilter-chosen">\
                            <ul>\
                                <li v-for="field in Fields" v-show="field.ChosenTitles.length>0">\
                                    <span class="field-titles">{{field.Title}}：{{field.UIFormat?field.ChosenTitles.join(" - "):field.ChosenTitles.join(", ")}}</span>\
                                    <span class="field-remove" v-if="!field.Must" @click="RemoveFieldChosen(field)">X</span>\
                                </li>\
                            </ul>\
                        </div>\
                        <div class="gsc-advfilter-fields">\
                            <ul>\
                                <li v-for="field in Fields">\
                                    <div class="field-title">{{field.Title}}：</div>\
                                    <ul v-if="!field.UIFormat">\
                                        <li v-for="option in field.Options" v-bind:class="{coption: option.Chosen }" @click="ToogleOptionChosen(field, option)">\
                                            <span class="option-title">{{option.Text}}</span>\
                                        </li>\
                                    </ul>\
                                    <ul class="field-input-options" v-else>\
                                        <li v-for="option in field.Options">\
                                            <span class="option-title optionSpan">{{option.Text}}</span>\
                                            <input type="text" v-bind:class="[field.UIFormat]" v-model="option.Value" v-on:change="FormatUIValueChange(field)" />\
                                        </li>\
                                    </ul>\
                                </li>\
                            </ul>\
                        </div>\
                        <div class="gsc-advfilter-btns">\
                            <button type="button" class="btn-ok k-button" @click="ButtonClick(1)">确定</button><button type="button" class="btn-close k-button" @click="ButtonClick(0)">取消</button>\
                        </div>\
                    </div>',
            data: function () {
                return { Fields: [] };
            },
            methods: {
                RemoveFieldChosen: function (field) {
                    var isInput = field.UIFormat;
                    for (var i = 0, length = field.Options.length; i < length; i++) {
                        if (!isInput) {
                            field.Options[i].Chosen = false;
                        } else {
                            field.Options[i].Value = '';
                        }
                    }
                    field.ChosenTitles = [];
                },
                ToogleOptionChosen: function (field, option) {
                    if (option.Chosen && field.Must) {
                        return;
                    }

                    if (option.Chosen) {
                        field.ChosenTitles.remove(option.Text);
                        option.Chosen = false;
                    } else {
                        if (field.Radio) {
                            field.ChosenTitles = [option.Text];
                            for (var i = 0, length = field.Options.length; i < length; i++) {
                                field.Options[i].Chosen = false;
                            }
                        } else {
                            field.ChosenTitles.push(option.Text);
                        }
                        option.Chosen = true;
                    }
                },
                FormatUIValueChange: function (field) {
                    var chosenTitles = [];
                    for (var i = 0, length = field.Options.length; i < length; i++) {
                        var option = field.Options[i];
                        if (option.Value) {
                            //var title = option.Text ? '{0} {1}'.format(option.Text, option.Value) : option.Value;
                            chosenTitles.push(option.Value);
                            option.Chosen = true;
                        } else {
                            option.Chosen = false;
                        }
                    }
                    field.ChosenTitles = chosenTitles;
                },
                ButtonClick: function (btnType) {
                    if (btnType === 1) {
                        var ary = [];
                        for (var i = 0, length = this.Fields.length; i < length; i++) {
                            var fld = this.Fields[i];
                            if (fld.ChosenTitles.length < 1) { continue; }

                            var optary = [];
                            for (var j = 0, jlen = fld.Options.length; j < jlen; j++) {
                                var opt = fld.Options[j];
                                if (!opt.Chosen) {
                                    continue;
                                }
                                if (!fld.OptionUsing) {
                                    if (!fld.UIFormat) {
                                        if (opt.Value === 'is null') {
                                            optary.push('{0} {1}'.format(fld.Field, opt.Value));
                                        } else {
                                            optary.push('{0}=N\'{1}\''.format(fld.Field, opt.Value));
                                        }
                                    } else {
                                        optary.push(opt.ValueExpress.replace(/#PH#/g, opt.Value));
                                    }
                                } else {//using option value as filter condition directly
                                    if (opt.Value) { optary.push(opt.Value); }
                                }
                            }
                            if (optary.length == 1) {
                                ary.push(optary.join(' '));
                            } else if (optary.length > 1) {
                                var cnct = fld.UIFormat ? ' and ' : ' or ';
                                ary.push('(' + optary.join(cnct) + ')');
                            }
                        }

                        this.$emit('okclick', ary.join(' and '));
                    }

                    $(".gsc-advfilter").stop().slideToggle(300)
                    $(".filterMask").addClass("filterBox_hider")
                }
            },
            ready: function () {
                //var fields = this.staflds;
                //if (fields && typeof fields === 'object' && fields.length > -1) {
                //    this.Fields = fields;
                //}
                //if (!this.dbcn || !this.tmpl) {
                //    return;
                //}
                var self = this;

                var callApi = new CallApi(this.dbcn, 'dbo.usp_AdvanceFilter_GetByName', true);
                callApi.AddParam({ Name: 'TemplateName', Value: self.tmpl, DBType: 'string' });
                callApi.ExecuteDataSet(function (response) {
                    if (!response || response.length < 1) {
                        return;
                    }

                    var fields = response[0];
                    var options = response[1];
                    for (var i = 0, length = fields.length; i < length; i++) {
                        var field = fields[i];
                        field.ChosenTitles = (field.ChosenTitles) ? field.ChosenTitles.split(';') : [];
                        var fieldOptions = $.grep(options, function (v) { return v.Field == field.Field; });
                        if (field.UIFormat) {
                            $.each(fieldOptions, function (s, o) {
                                o['ValueExpress'] = o.Value;
                                o.Value = '';
                            });
                        }
                        field['Options'] = fieldOptions;
                    }

                    self.Fields = self.Fields.concat(fields);
                    //setTimeout(function () {
                    //    $(".gsc-advfilter .input-date").kendoDatePicker({ format: 'yyyy-MM-dd' });
                    //}, 500);
                    //kendo日期控件无法触发日期选择input的value change 事件，所以需要寻找新控件实现
                });
            }
        });


    });
});


