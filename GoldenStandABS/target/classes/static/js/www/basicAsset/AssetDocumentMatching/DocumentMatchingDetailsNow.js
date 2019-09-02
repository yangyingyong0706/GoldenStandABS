define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = GlobalVariable = require('gs/globalVariable');
    var dataProcess = require('app/assetFilter/js/dataProcess');
    var common = require('gs/uiFrame/js/common');
    var gsUtil = require('gs/gsUtil');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var webStorage = require('gs/webStorage');
    var gsAdmin = require('gs/uiFrame/js/gs-admin-2.pages');
    var gsUtil = require('gsUtil');
    var GSDialog = require("gsAdminPages")
    var Vue = require('Vue2');
    var sessionId = common.getUrlParam('SessionId')
    var kendoGrid = require('kendo.all.min');
    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var SourceFilePath = sessionStorage.getItem("SourceFilePath");
    var DestinationFilePath = sessionStorage.getItem("DestinationFilePath");
    console.log(SourceFilePath, DestinationFilePath)
    require("kendomessagescn");
    require("jquery.searchSelect");
    var filterMatchData = [];
    var self;
    var DimAssetTypeID = '';
    var SourceFileListLength = ""//外部数据文件数据源个数
    var DestinationFileListLength = ""//系统模板文件数据源个数
    window.vm = new Vue({
        el: "#AssetDocumentMatching",
        data: {
            matchData: [],    //全部匹配数据
            filterMatchData: [{
                DestinationFileColumns: '',
                IsEssentialColumn: '',
                IsUsed: '',
                SimilarityDegree: '',
                SortBy: '',
                SourceFileColumnsName: '',
            }],
            selectData: [],   //外部数据文件未匹配字段
            IsEssentialColumn: '',
            SimilarityDegree: '',
            SimilarityDegreeType: '',
            orderByDegree: 0,
            orderByEssential: 0,
        },
        watch: {
        },
        methods: {
            //kendo grid
            getMatchData: function (noFilter) {
                if (window.event) {
                    event.cancelBubble = true;
                } else {
                    event.stopPropagation();
                }
                var self = this;
                var height = $(window).height() - 120;
                $('.matchTable').height(height)
                var executeParam = {
                    SPName: 'TrustManagement.usp_GetFileMatchColumnsBySessionId',
                    SQLParams: [{
                        Name: 'SessionId',
                        value: sessionId,
                        DBType: 'string'
                    }]
                }
                self.filterMatchData = [];
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    self.matchData = data;
                    self.filterMatchData = data;
                    if (noFilter == 'true') {    
                        self.filterMatchData = data;
                        self.IsEssentialColumn = '';
                        self.SimilarityDegree = '';
                        self.SimilarityDegreeType = '';
                    } else {
                        if (self.IsEssentialColumn && !(self.SimilarityDegree && self.SimilarityDegreeType)) {
                            var IsEssentialColumn = self.IsEssentialColumn;
                            self.filterMatchData = [];
                            $.each(self.matchData, function (i, v) {
                                if (v.IsEssentialColumn == IsEssentialColumn) {
                                    self.filterMatchData.push(v)
                                }
                            })
                        }
                        if (self.SimilarityDegree && self.SimilarityDegreeType && !self.IsEssentialColumn) {
                            var SimilarityDegree = parseFloat(self.SimilarityDegree.substring(0, self.SimilarityDegree.length - 1));
                            if (self.SimilarityDegreeType == '大于') {
                                self.filterMatchData = []
                                $.each(self.matchData, function (i, v) {
                                    if (v.SimilarityDegree) {
                                        if (v.SimilarityDegree > SimilarityDegree) {
                                            self.filterMatchData.push(v)
                                        }
                                    }
                                })
                            } else {
                                self.filterMatchData = []
                                $.each(self.matchData, function (i, v) {
                                    if (v.SimilarityDegree) {
                                        if (v.SimilarityDegree < SimilarityDegree) {
                                            self.filterMatchData.push(v)
                                        }
                                    } else if (!v.SimilarityDegree) {
                                        self.filterMatchData.push(v)
                                    }
                                })
                            }
                        }
                        if (self.SimilarityDegree && self.SimilarityDegreeType && self.IsEssentialColumn) {
                            var IsEssentialColumn = self.IsEssentialColumn;
                            var SimilarityDegree = parseFloat(self.SimilarityDegree.substring(0, self.SimilarityDegree.length - 1));
                            if (self.SimilarityDegreeType == '大于') {
                                self.filterMatchData = []
                                $.each(self.matchData, function (i, v) {
                                    if (v.SimilarityDegree) {
                                        if (v.SimilarityDegree > SimilarityDegree && v.IsEssentialColumn == IsEssentialColumn) {
                                            self.filterMatchData.push(v)
                                        }
                                    }
                                })
                            } else {
                                self.filterMatchData = []
                                $.each(self.matchData, function (i, v) {
                                    if (v.SimilarityDegree) {
                                        if (v.SimilarityDegree < SimilarityDegree && v.IsEssentialColumn == IsEssentialColumn) {
                                            self.filterMatchData.push(v)
                                        }
                                    } else if (!v.SimilarityDegree && v.IsEssentialColumn == IsEssentialColumn) {
                                        self.filterMatchData.push(v)
                                    }
                                })
                            }
                        }
                    }
                    filterMatchData = self.filterMatchData;
                    self.$nextTick(function () {
                        self.randerSelect();
                    })
                    $('.filterBox').hide()
                    $('#loading').hide();
                })
            },
            sortMatchData: function(e){
                var $target = $(e.target);
                var self = this;
                var orderBy = $target.text();
                if (orderBy.indexOf('匹配度') > -1) {
                    self.filterMatchData = []
                    var arr = [];
                    if (self.orderByDegree == 0) {
                        self.orderByDegree = 1;
                        function sortUp(a) {//排序大小
                            var b = [];
                            $.each(a, function (i, v) {
                                b.push(v)
                            })
                            var i = j = t = 0;
                            for (i = 0; i < b.length; i++) {
                                for (j = 0; j < b.length; j++) {
                                    if (b[i].SimilarityDegree < b[j].SimilarityDegree) {
                                        t = b[j];
                                        b[j] = b[i];
                                        b[i] = t;
                                    }
                                }
                            }
                            return b;
                        }
                        arr = sortUp(filterMatchData)
                        console.log(arr)
                        $('.sort').hide();
                        $target.find('.sort').show();
                    } else if (self.orderByDegree == 1) {
                        self.orderByDegree = 2
                        function sortDown(a) {//排序大小
                            var b = [];
                            $.each(a, function (i,v) {
                                b.push(v)
                            })
                            var i = j = t = 0;
                            for (i = 0; i < b.length; i++) {
                                for (j = 0; j < b.length; j++) {
                                    if (b[i].SimilarityDegree > b[j].SimilarityDegree) {
                                        t = b[j];
                                        b[j] = b[i];
                                        b[i] = t;
                                    }
                                }
                            }
                            return b;
                        }
                        arr = sortDown(filterMatchData)
                        $target.find('.sort').addClass('down');
                        $target.find('.sort').show();
                    } else if (self.orderByDegree == 2) {
                        self.orderByDegree = 0
                        arr = filterMatchData;
                        $target.find('.sort').removeClass('down');
                        $target.find('.sort').hide();
                    }
                    self.filterMatchData = arr;   
                } else {
                    var arr = [];
                    if (self.orderByEssential == 0) {
                        $.each(filterMatchData, function (i, v) {
                            if (v.IsEssentialColumn == 1) {
                                arr.unshift(v)
                            } else {
                                arr.push(v)
                            }
                        })
                        self.orderByEssential = 1
                        $('.sort').hide();
                        $target.find('.sort').show();
                    } else if (self.orderByEssential == 1) {
                        $.each(filterMatchData, function (i, v) {
                            if (v.IsEssentialColumn == 0) {
                                arr.unshift(v)
                            } else {
                                arr.push(v)
                            }
                        })
                        $target.find('.sort').addClass('down');
                        $target.find('.sort').show();
                        self.orderByEssential = 2
                    } else if (self.orderByEssential == 2) {
                        arr = filterMatchData;
                        $target.find('.sort').removeClass('down');
                        $target.find('.sort').hide();
                        self.orderByEssential = 0
                    }
                    self.filterMatchData = arr;
                }
            },
            kendoGrid: function () {
                var self = this;
                var height = $(window).height() - 250;
                var executeParam = {
                    SPName: 'TrustManagement.usp_GetFileMatchColumnsBySessionId',
                    SQLParams: [{
                        Name: 'SessionId',
                        value: sessionId,
                        DBType: 'string'
                    }]
                }
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    self.matchData = data;
                    paging = Math.floor(height / 40);
                    self.pageNum = Math.ceil(data.length / paging);
                    $('.wrapTable').height((paging + 1)* 40 + paging + 2)
                    var grid = $("#grid").kendoGrid({
                        dataSource: data,
                        height: height,
                        selectable: "multiple",
                        filterable: true,
                        sortable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            page: 1,
                            pageSize: 10,
                            pageSizes: [10, 20, 30, 50],
                        },
                        columns: [{
                            title: "", width: '50px', headerTemplate: function () {
                                var t = '<input type="checkbox" id="checkAll" onclick="self.selectAll(this)" style="position:relative;top:-2px;left:-1px"/>';
                                return t
                            }, template: function (data) {
                                var info = data.SessionId
                                var t = '<input type="checkbox" class="selectbox"  onclick="self.selectCurrent(this)" data-info=' + info + '>';
                                return t
                            }, locked: true
                        },
                        {
                            field: "DestinationFileColumns",
                            title: '系统模板文件',
                            width: "auto",
                        },{
                            field: "IsEssentialColumn",
                            title: '是否必填字段',
                            width: "auto",
                            template: function (data) {

                                var IsEssentialColumn = data.IsEssentialColumn;
                                var t;
                                if (data.IsEssentialColumn == 1) {
                                    t = "<span style='color: #dd0000;'>是</span>";
                                } else {
                                    t = "<span>否</span>";
                                }
                                return t
                            },
                        }, {
                            field: "SourceFileColumnsName",
                            title: '外部数据文件',
                            width: "auto",
                            template: function (data) {
                                var t = '<div class="SourceFile"></div>';
                                return t
                            },
                        }, {
                            field: "SimilarityDegree",
                            title: '匹配度',
                            width: "120px",
                            template: function (data) {
                                var percent = data.SimilarityDegree;
                                var t;
                                if (data.SimilarityDegree) {
                                    t = "<div class='por_text'>" + percent + "</div>"
                                } else {
                                    t = "<div>----</div>"
                                }
                                return t
                            },
                        }],
                        dataBound: function () {

                        }
                    });
                });
                $('#loading').hide();
            },
            //Windows窗口改变事件
            windowsChange: function () {
                var self = this;
                window.onresize = function () {
                    var height = $(window).height() - 120;
                    $('.matchTable').height(height)
                }
            },
            //获取外部数据文件下拉菜单
            getOldeSelect: function () {
                var self = this,
					svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
					executeParam = {
					    'SPName': 'TrustManagement.usp_GetFileMatchUnMatchedSourceFIleColumnsBySessionId',
					    'SQLParams': [{
					        'Name': 'SessionId',
					        'Value': sessionId,
					        'DBType': 'string'
					    }]
					},
					appDomain = 'TrustManagement';
                common.ExecuteGetData(false, svcUrl, appDomain, executeParam, function (data) {
                    self.selectData = data

                });
            },
            goback: function () {
                window.location.href = 'AssetDocumentMatching.html';
            },
            saveUpload: function () {
                var self = this;
                var $searchable = $('.searchable-select-holder');
                var off = true;
                var off1 = false;
                var off2 = false;
                var off3 = false;
                var UsedArr = [];
                $.each($searchable, function (i, v) {
                    self.matchData[i].SourceFileColumnsName = $(v).text()
                    if (self.matchData[i].SourceFileColumnsName == '请选择...') {
                        self.matchData[i].SourceFileColumnsName = ''
                    }
                })
                $.each(self.matchData, function (i, v) {
                    if (v.IsUsed == true) {
                        UsedArr.push(v.SourceFileColumnsName)
                    }
                    if (!v.SourceFileColumnsName && v.IsUsed == true) {
                        off1 = true;
                    }
                    if (!v.SourceFileColumnsName && v.IsEssentialColumn == 1) {
                        off2 = true;
                    }
                    if (v.SourceFileColumnsName && v.IsUsed == false && v.IsEssentialColumn == 1) {
                        off3 = true;
                    }
                })
                var nary = UsedArr.slice().sort();
                for (let i = 0; i < UsedArr.length; i++) {
                    if (nary[i] == nary[i + 1]) {
                        off = false;
                        GSDialog.HintWindow('勾选的匹配中有重复的外部数据文件列，请修改！');
                        return false;
                    }
                }
                if (off) {
                    if (off1) {
                        GSDialog.HintWindow('勾选了未匹配上的字段，请修改');
                        return false;
                    }else if (off2 && off3) {
                        GSDialog.HintWindowTF('有未匹配上的必填字段以及有未勾选的必填字段，是否保存？', function () {
                            save()
                        }, function () {
                            return false;
                        })
                    } else if (!off2 && off3) {
                        GSDialog.HintWindowTF('有未勾选的必填字段，是否保存？', function () {
                            save()
                        }, function () {
                            return false;
                        })
                    } else if (off2 && !off3) {
                        GSDialog.HintWindowTF('有未匹配上的必填字段，是否保存？', function () {
                            save()
                        }, function () {
                            return false;
                        })
                    } else {
                        save()
                    }
                }
                function save() {
                    $('#mask').show()
                    var MappingXml = '';
                    xmlData = self.matchData;
                    MappingXml += '<ColumnMaps>';
                    $.each(xmlData, function (i, v) {
                        MappingXml += '<ColumnMap><SourceColumn name = "' + v.SourceFileColumnsName + '"/><DestinationColumn name = "' + v.DestinationFileColumns + '"/><IsUsed value = "' + v.IsUsed + '"/></ColumnMap>'
                    })
                    MappingXml += '</ColumnMaps>';
                    MappingXml = MappingXml.format(MappingXml);
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "PoastData?";
                    var executeParam = {
                        SPName: 'usp_SaveFileMatchColumnsMap', SQLParams: [
                            { name: 'SessionId', value: sessionId, DBType: 'string' },
                            { name: 'MappingXml', value: MappingXml, DBType: 'string' }
                        ]
                    };
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    $.ajax({
                        cache: false,
                        type: "POST",
                        async: false,
                        url: svcUrl + 'appDomain=TrustManagement&executeParams=2&resultType=commom',
                        dataType: "json",
                        //contentType: "application/json;charset=utf-8",
                        processData: false,
                        data: "[{executeParams:\"" + executeParams + "\"}," +
                                "{appDomain:\"TrustManagement\"}," +
                                "{resultType:\"commom\"}]",
                        success: function (response) {
                            $('#mask').hide()
                            GSDialog.HintWindow('保存成功！', function () {
                                window.location.reload()
                            });
                        },
                        error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); $('#mask').hide() }
                    });
                }
            },
            downLoad: function () {
                var off = false;
                var off1 = false;
                var self = this;

                $.each(self.matchData, function (i, v) {
                    if (v.SourceFileColumnsName && v.IsUsed == false && v.IsEssentialColumn == 1) {
                        off = true;
                    }
                    if (!v.SourceFileColumnsName && v.IsEssentialColumn == 1) {
                        off1 = true;
                    }
                })

                if (off && off1) {
                    GSDialog.HintWindowTF('有未勾选的必填字段以及有未匹配上的必填字段，是否继续生成？', function () {
                        task()
                    }, function () {
                        return false;
                    })
                }else if (off && !off1) {
                    GSDialog.HintWindowTF('有未勾选的必填字段，是否继续生成？', function () {
                        task()
                    }, function () {
                        return false;
                    })
                } else if (!off && off1) {
                    GSDialog.HintWindowTF('有未匹配上的必填字段，是否继续生成？', function () {
                        task()
                    }, function () {
                            return false;
                    })
                } else {
                    task()
                }

                function task() {
                    sVariableBuilder.AddVariableItem('SessionId', sessionId, 'String');
                    sVariableBuilder.AddVariableItem('SourceFilePath', SourceFilePath, 'String');
                    sVariableBuilder.AddVariableItem('DestinationFilePath', DestinationFilePath, 'String');
                    //sVariableBuilder.AddVariableItem('MappingXml', MappingXml, 'String');
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 900,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'FileMatchExportFIle',
                        sContext: sVariable,
                        callback: function () {
                            var tempsessionId = sessionStorage.getItem("sessionId")
                            sessionStorage.removeItem("sessionId")
                            webProxy.getSessionProcessStatusList(tempsessionId, "Task", function (response) {
                                for (let i = 0; i < response.GetSessionProcessStatusListResult.List.length; i++) {
                                    if (response.GetSessionProcessStatusListResult.List[i].ActionStatus != "Success") {
                                        return;
                                    }
                                }
                                var reg = /([.]\w+)$/;
                                var fileName = SourceFilePath.substring(SourceFilePath.lastIndexOf("\\")).replace(/\\/g, "")
                                var fileExtension = fileName.match(reg)[0];
                                fileName = fileName.replace(reg, "");
                                var filepath = webProxy.baseUrl + "/PoolCut/Files/FIleMatch" + "/" + fileName + "_" + sessionId.replace(/[_]/, "") + fileExtension;
                                const a = document.createElement('a'); // 创建a标签
                                a.setAttribute('download', '');// download属性
                                a.setAttribute('href', filepath);// href链接
                                a.click();
                            })
                        }
                    });
                    tIndicator.show();
                }
            },
            randerSelect: function () {
                var self = this;
                $('.searchable-select').remove();
                $('.SourceFile').searchableSelect();
                var holder = $('.searchable-select-holder');
                var searchable = $('.searchable-select');
                $.each(holder, function (i,v) {
                    if ($(v).text() != '请选择...') {
                        $(v).addClass('withBg')
                    }
                })
                var ItemsHeight = $(window).height()/2 - 80;
                $('.searchable-select-items').css('max-height', ItemsHeight + 'px');
                var $item = $('.searchable-select-item');
                $.each($item, function (i, v) {
                    $(v).click(function () {
                        var text = $(v).text();
                        console.log(text)
                        var index = $(v).parents('.searchable-select').prev().attr('index');
                        console.log(index);
                        var oldSourceFileColumnsName = self.filterMatchData[index].SourceFileColumnsName;
                        self.filterMatchData[index].SourceFileColumnsName = text;
                        if (oldSourceFileColumnsName) {
                            self.selectData.unshift({ 'ColumnName_CN': oldSourceFileColumnsName });
                        }
                        for (var j = 0; j < self.selectData.length-1; j++) {
                            if (self.selectData[j].ColumnName_CN == text) {
                                self.selectData.remove(self.selectData[j]);
                                console.log(self.filterMatchData)
                                self.$nextTick(function () {
                                    self.randerSelect();
                                })
                                return;
                            }
                        }
                    })
                })
            },
            selectAll: function (e) {
                var self = this;
                var checkAll = e.target;
                if ($(checkAll).is(':checked')) {
                    $.each(self.matchData, function (i, v) {
                        v.IsUsed = true
                    })
                } else {
                    $.each(self.matchData, function (i, v) {
                        v.IsUsed = false
                    })
                }
            },
            selectSingle: function (e) {
                var self = this;
                var selectSingle = e.target;
                var off = true;
                $.each(self.matchData, function (i, v) {
                    if (!v.IsUsed) {
                        off = false;
                    }
                })
                if (off) {
                    $(".checkAll").prop("checked", true);
                } else {
                    $(".checkAll").prop("checked", false);
                }
            }
        },
        mounted: function () {
            this.getMatchData()
            this.windowsChange();
            this.getOldeSelect();
            this.$nextTick(function () {
                this.randerSelect();
            })
        }
    })

    $(function () {
        $('.filter').click(function () {
            $(this).next().toggle();
        })
        
    })
})