function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
};

function allowDrop(ev) {
    ev.preventDefault();
};

//function click(ev) {
//    alert("hello")
//}


String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
};


var PaySequenceDisplayer = (function () {
    var trustId = 0;
    var nodeArrays = [];
    var edgeArrays = [];
    var nodeArray = [];
    var edgeArray = [];
    //  RoomCreate("");
    var _currentTabId = "beforeBreach";
    var winHeight = $(window.parent.document).height();
    var winWidth = $(window.parent.document).width();

    var svgTemplate = '<svg xmlns="http://www.w3.org/2000/svg" id="{1}" class="svg" width="1130" height="138.48"><g /></svg>' +
                        '<div style=" position: absolute;top: 0;right: 6px;height: 100%;width: 22px;" class="taskText">'+
                           '<div style="vertical-align: middle;position: relative;top: 30%;width: 28px;border: 4px solid #efe9e9;background-color: #F8F6FF;" class="taskName  taskProgress">{0}</div>'+
                        '</div>'


    

    function mouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        $("svg").unbind();
        if (e.which == 3) {
            var opertion = {
                name: "",
                offsetX: 2,
                offsetY: 2,
                textLimit: 10,
                beforeShow: $.noop,
                afterShow: $.noop
            };
            //text: e.target.innerHTML,
            var data = [
            [{
                text: "查看",
                func: function () {
                    var idArray = this.id.split("$$");
                    var currentNode = $.grep(nodeArray, function (node, i) { return node.States == this.id })[0];
                    var id = idArray[idArray.length - 1];
                    showDialogPage('../FeeSettings/PaymentSequence.html?tid=' + trustId + '&id=' + id + '', '维护偿付顺序', winWidth * 8 / 10, winHeight * 4 / 5, function () { })
                }
            }],
            [{
                text: "删除容器",
                func: function () {
                    var controlId = this.parentNode.id;
                    var index = controlId.split("-")[1];
                    nodeArrays.splice(nodeArrays[index]);
                    $('#' + controlId).remove();
                }
            }]
            ];
            $(this).smartMenu(data, opertion);
        }
    }

    function addSvg(srcControlId, trgControlId,svgName)
    {
        var svgId = "svg" + srcControlId.split("-")[1];
        var divTmp='<div id="{0}" class="section controlAdd" ondragover="allowDrop(event)" style="width: 100%; height: auto; background-color: rgb(241, 241, 241);">'+
            '<svg xmlns="http://www.w3.org/2000/svg" id="{1}" class="svg" width="1130" height="138.48"><g></g></svg>'+
            '<div style=" position: absolute;top: 0;right: 6px;height: 100%;width: 22px;" class="taskText">'+
            '<div style="vertical-align: middle;position: relative;top: 30%;width: 28px;border: 4px solid #efe9e9;background-color: #F8F6FF;" class="taskName  taskProgress">{2}</div></div></div>'
        divTmp = divTmp.format(srcControlId, svgId, svgName);
        $('#' + trgControlId).parent().append(divTmp);
        addDragableAttr(srcControlId);

        nodeArrays.push([]);
        edgeArrays.push([]);
       
        //$("svg").on("drop", svgDrop);

    }

    function addDragableAttr(controlId)
    {
        $("#"+controlId).attr("ondragover", "allowDrop(event)");
    }
    function drop() {
        var count = 0
        $("svg").unbind();
        function svgDrop(ev) {
            count++;
            ev.preventDefault();
            if (count > 1)
            {
                count = 0;
                return
            }
            var id = this.id;
            var controlId = this.parentNode.id
            if (controlId.indexOf("-") > 0) { controlIndex = controlId.split("-")[1] }
            var data = ev.originalEvent.dataTransfer.getData("Text");
            
            var dropDateName = $("#" + data).text();
            var dropDateCode = data;

            if (dropDateName == "非加速清偿") {
                addSvg('control-3', controlId, "非加速清偿")
            }
            else if (dropDateName == "加速清偿") {
                var divTmp = '<div class="taskText controlAdd" style=" position: absolute;top: 0;right: 6px;height: 100%;width: 22px;">' +
                                  '<div style="vertical-align: middle;position: relative;top: 30%;width: 28px;border: 4px solid #efe9e9;background-color: #F8F6FF;" class="taskName taskProgress">加速清偿前</div>' +
                             '</div';
                $('#' + id).parent().append(divTmp);
                addSvg('control-1', controlId, "加速清偿")
                addSvg('control-2', controlId, "加速清偿后")

                //$('#' + controlId)[0].parentNode.appendChild(svg_add);
            }
            else {
                var nodeObject = {};
                nodeObject['States'] = dropDateCode;
                nodeObject['AliasValue'] = dropDateName;//fatherNode.AliasValue+"/"+dropDateName;
                nodeObject['IsActive'] = 1;
                nodeObject['IsChildNode'] = 1
                //nodeObject['FatherNode'] = id

                var newNodeArray = [];
                $.extend(newNodeArray, nodeArrays[controlIndex]);
                newNodeArray.push(nodeObject);
                nodeArrays[controlIndex] = newNodeArray;

                var newEdgeArray = [];
                $.extend(newEdgeArray, edgeArrays[controlIndex]);
                edgeArrays[controlIndex] = newEdgeArray;

                ev.target.appendChild(document.getElementById(data));

                renderOneSvg(nodeArrays[controlIndex], controlId)
            }
        }
        return svgDrop;
    }
    
  

    function getTrustPaymentSequence(tid, callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

        var executeParam = {
            SPName: 'usp_GetTrustPaymentSequence', SQLParams: [
                { Name: 'TrustId', value: tid, DBType: 'int' },

            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, callback);
    }

    function getTrustPaymentChart(tid, currentTabId,callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

        var executeParam = {
            SPName: 'usp_GetTrustPaymentChart', SQLParams: [
                { Name: 'TrustId', value: tid, DBType: 'int' },
                { Name: 'ChartName', value: currentTabId, DBType: 'string' },

            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, callback);
    }

    var creatSectionRoom = function (data) {
        var specialTmp='<div class="section" style="position: absolute; width: 100%;bottom: 0;">'+
        '<div class="taskProgress Pending">' +
                        '<div class="taskText">' +
                            '<div class="taskName">特殊情况</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="svg specialRoom" width="1130" >{0}</div>';
        var innerHtml = '';
        $.each(data, function (index, dom) {
            if (dom.ScenarioName == "加速清偿") {
                var SpeedPayId = dom.ScenarioId + 1;
                innerHtml += '<span id="' + dom.ScenarioId + '" class="dropSpan" draggable="true" ondragstart="drag(event)" >' + dom.ScenarioName + '</span>';
                innerHtml += '<span id="' + SpeedPayId + '" class="dropSpan" draggable="true" ondragstart="drag(event)" >' + "非" + dom.ScenarioName + '</span>';
            }
        });
        specialTmp=specialTmp.format(innerHtml)
        specialTmp=specialTmp.format(innerHtml)
        $('#workflow').append(specialTmp);
        return div;
    }

    function RoomCreate(data) {
        var container = document.getElementById('workflow');

        //var createdNode = function (nodeId, nodeName, state) {
        //    var div = document.createElement('div');
        //    var innerHtml = '<div class="taskProgress ' + state + '">' +
		//						'<div class="taskText">' +
		//							'<div class="taskName">' + nodeName + '</div>' +
		//						'</div>' +
		//					'</div>' +
		//					'<svg class="svg" width="1130"><g/></svg>';
        //    div.id = nodeId;
        //    div.className = 'section';
        //    div.innerHTML = innerHtml;
        //    var node = document.getElementById(nodeId);

        //    (node) ? node.firstChild.className = 'taskProgress ' + state : container.appendChild(div);
        //    return div;
        //}


        

        //var node = d3.select(createdNode('control-0', '流程图', 'Pending'));

        //var data=[{'id':'code1','name':'加速偿付'},{'id':'code2','name':'特殊情况1'},{'id':'code3','name':'特殊情况2'},{'id':'code4','name':'特殊情况3'}]

        //creatSectionRoom(data);
        renderOneSvg(nodeArray, "control-0");

        $('.taskProgress').on('click', function () {
            var parentNode = this.parentNode;
            if (parentNode.classList.contains('toggle')) {
                parentNode.classList.remove('toggle');
            } else {
                parentNode.classList.add('toggle');
            }
        })
    }

    function renderOneSvg(data, controlid) {
        var controlIndex=controlid.split("-")[1]
        var svg = d3.select('#' + controlid).select(".svg"),
                inner = svg.select("g");
            
            //if (data.length == 0) {
            //    data = '[{"States":"node_1","AliasValue":"开始","IsActive":1,"IsChildNode":1,"Levels":0}]';
            //    data = eval('(' + data + ')');
            //}
            nodeArrays[controlIndex] = data
            var g = new dagreD3.graphlib.Graph().setGraph({
                nodesep: 160,
                edgesep: 2 // -5 ??
            });

            var nodeStatusColor = function (IsActive) {
                return (IsActive) ? 'fill:#f3eb90' : 'fill:#dcdcdc'
            }
            data.forEach(function (row) {
                g.setNode(row.States, {
                        //shape: row.States.match(/_[end|back]/gi) ? "ellipse" : "rect",
                        shape: "rect",
                        label: row.AliasValue,
                        id: row.States,
                        style: nodeStatusColor(row.IsActive),
                        paddingLeft: 20,
                        paddingRight: 20,
                        active: row.IsActive,
                        isChildNode: row.IsChildNode
                    });
            });

            var setEdges = function (edge) {
                if (edge.length == 0) {
                    edge = '[]';
                    edge = eval('(' + edge + ')');
                }
                edgeArrays[controlIndex] = edge;
                edge.forEach(function (row) {
                    g.setEdge(row.SourceState, row.TargetState, {});
                });
                g.nodes().forEach(function (v) {
                    var node = g.node(v);
                    node.rx = node.ry = 10;
                });

                new dagreD3.render()(inner, g);

                $("g.node").unbind();

                $("g.node").bind("mousedown", (function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var self = this;
                    
                    if (e.which == 3) {
                        var opertion1 = {
                            name: "",
                            offsetX: 2,
                            offsetY: 2,
                            textLimit: 10,
                            beforeShow: $.noop,
                            afterShow: $.noop
                        };
                        //text: e.target.innerHTML,
                        var data1 = [
                        [{
                            text: "查看",
                            func: function () {
                                var idArray = this.id.split("$$");
                                var currentNode = $.grep(nodeArray, function (node, i) { return node.States == this.id })[0];
                                console.log(currentNode);
                                var id = idArray[idArray.length - 1];
                                showDialogPage('../FeeSettings/PaymentSequence.html?tid=' + trustId + '&id=' + id + '', '维护偿付顺序', winWidth * 8 / 10, winHeight * 4 / 5, function () { })
                            }
                        }],
                        [{
                            text: "删除节点",
                            func: function () {
                                var name = $(this).text().replace("非", "");
                                var flag = $(this).text().split("not_");
                                var brotherId = 0;
                                var id = this.id.replace("not_", "");
                                var idArray = id.split("$$");
                                var realId = idArray[idArray.length - 1]
                                var controlId = $(this).parentsUntil('.section')[3].parentNode.id;//this.closest('svg').parentNode.id
                                controlIndex = controlId.split("-")[1]
                                if (flag.length == 1) {
                                    brotherId = id.replace("$$" + realId, "") + "$$" + (parseInt(realId) + 1)
                                }
                                else {
                                    brotherId = id.replace("$$" + realId, "") + "$$" + (parseInt(realId) - 1)
                                }
                                var IsChildNode = 1;
                                var fatherNode = '';
                                var nodeindexNumber = [];
                                var edgeindexNumber = [];
                                $.each(edgeArrays[controlIndex], function (index, dom) {
                                    if (dom.TargetState == id) {
                                        edgeindexNumber.push(index);
                                    }
                                    if (dom.TargetState == brotherId) {
                                        edgeindexNumber.push(index);
                                    }
                                })
                                $.each(nodeArrays[controlIndex], function (index, dom) {
                                    if (dom.States == id) {
                                        IsChildNode = IsChildNode && dom.IsChildNode;
                                        fatherNode = dom.FatherNode;
                                        nodeindexNumber.push(index);
                                    }
                                    if (dom.States == brotherId) {
                                        IsChildNode = IsChildNode && dom.IsChildNode;
                                        nodeindexNumber.push(index);
                                    }
                                })
                                nodeindexNumber = $.map(nodeindexNumber, function (dom, index) {
                                    return dom - index;
                                })
                                edgeindexNumber = $.map(edgeindexNumber, function (dom, index) {
                                    return dom - index;
                                })
                                if (!!IsChildNode) {
                                    $.each(nodeindexNumber, function (index, dom) {
                                        nodeArrays[controlIndex].splice(dom, 1)
                                    })
                                    $.each(edgeindexNumber, function (index, dom) {
                                        edgeArrays[controlIndex].splice(dom, 1)
                                    })
                                    $.each(nodeArrays[controlIndex], function (index, dom) {
                                        if (dom.States == fatherNode) {
                                            dom.IsChildNode = 1;
                                        }
                                    })
                                    //$(".specialRoom").append('<span id="' + id + '" class="dropSpan" draggable="true" ondragstart="drag(event)" >' + name + '</span>')
                                    renderOneSvg(nodeArrays[controlIndex], controlId);
                                }
                                else {
                                    return;
                                }
                            }

                        }]
                        ];
                        $(this).smartMenu(data1, opertion1);
                    }
                }));

               
                $("g.node").on("dragover", function (ev) {
                    ev.preventDefault();
                });
                $("g.node").on("drop", function (ev) {
                    ev.preventDefault();
                    var id = this.id;
                    var controlId = $(this).parentsUntil('.section')[3].parentNode.id;//this.closest('svg').parentNode.id
                    controlIndex = controlId.split("-")[1]
                    var data = ev.originalEvent.dataTransfer.getData("Text");
                    ev.target.appendChild(document.getElementById(data));
                    var dropDateName = $("#" + data).text();
                    var dropDateCode = data;
                    var IsChildNode = '';
                    dropNodeId = id + "$$" + dropDateCode;
                    $.each(nodeArrays[controlIndex], function (index, dom) {
                        if (dom.States == id) {
                            IsChildNode = dom.IsChildNode
                            //dom.IsChildNode = 0;
                        }
                    })
                    if (!!IsChildNode) {
                        //ev.target.appendChild(document.getElementById(data));
                        var nodeObject = {};
                        var fatherNode = $.grep(nodeArray, function (n, i) { return n.States == id })[0];
                        nodeObject['States'] = id + "$$" + dropDateCode;
                        nodeObject['AliasValue'] = dropDateName;//fatherNode.AliasValue+"/"+dropDateName;
                        nodeObject['IsActive'] = 0;
                        nodeObject['IsChildNode'] = 1
                        nodeObject['FatherNode'] = id

                        nodeArrays[controlIndex].push(nodeObject);
                        console.log(nodeArrays);

                        var edgObject = {};
                        edgObject['SourceState'] = id
                        edgObject['TargetState'] = id + "$$" + dropDateCode;
                        edgeArrays[controlIndex].push(edgObject);

                        renderOneSvg(nodeArrays[controlIndex], controlId)
                    }
                    else {
                        return;
                    }
                });

                var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
                inner.attr("transform", "translate(" + xCenterOffset + ", 40)");
                svg.attr("height", g.graph().height + 100);
            }

            setEdges(edgeArrays[controlIndex]);

        // Set up zoom support
            var zoom = d3.behavior.zoom().on("zoom", function () {
                inner.attr("transform", "translate(" + d3.event.translate + ")" +
                                            "scale(" + d3.event.scale + ")");
            });
            svg.call(zoom);

            var initialScale = 0.75;
            zoom
              .translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
              .scale(initialScale)
              .event(svg);
            svg.attr('height', g.graph().height * initialScale + 40);
        //});
       
       
    }

    function executeRemoteData(executeParam, callback) {
        var executeParams = JSON.stringify(executeParam);

        var params = '';
        params += '<root appDomain="TrustManagement" postType="">';
        params += executeParams;
        params += '</root>';

        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonPostExecute";

        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: params,
            processData: false,
            success: function (response) {
                if (callback)
                    callback(response);
            },
            error: function (response) { alert("error is :" + response); }
        });
    }

    function renderDisplayer(tid,currentTabId) {
        trustId = tid;
        _currentTabId = currentTabId
        getTrustPaymentSequence(trustId, function (paymentData) {
            getTrustPaymentChart(trustId, currentTabId, function (paymentChartData) {
                //nodeArrays = eval('(' + paymentChartData[0].NodeArray + ')');
                if (paymentChartData.length == 0) {
                    nodeArrays = [];
                    edgeArrays = [];
                    nodeArrays[0] = [];
                    edgeArrays[0] = [];
                    renderOneSvg(nodeArrays[0], "control-0")

                }
                if (paymentChartData.length > 0) {
                    nodeArrays = eval('(' + paymentChartData[0].NodeArray + ')');
                    edgeArrays = eval('(' + paymentChartData[0].EdgeArray + ')');
                    $.each(nodeArrays, function (index, nodeArray) {
                        if (index == 1) {
                            var controlTxtTmp = '<div class="taskText controlAdd" style="position: absolute;top: 0;right: 6px;height: 100%;width: 22px;">'+
                                                      '<div style="vertical-align: middle;position: relative;top: 30%;width: 28px;border: 4px solid #efe9e9;background-color: #F8F6FF;" class="taskName taskProgress">加速清偿前</div>' +
                                                '</div>'
                            $("#control-0").append(controlTxtTmp);
                            addSvg('control-1', "control-0", "加速清偿")
                            renderOneSvg(nodeArrays[index], "control-" + index)
                        }
                        else if (index == 2) {
                            addSvg('control-2', "control-0", "加速清偿后")
                            renderOneSvg(nodeArrays[index], "control-" + index)
                        }
                        else if (index == 3) {
                            addSvg('control-3', "control-0", "非加速清偿")
                            renderOneSvg(nodeArrays[index], "control-" + index)
                        }
                        else {
                            renderOneSvg(nodeArrays[index], "control-" + index)
                        }
                    })
                }
                
               
            })
        })

        
    }

    registerTabEvent();

    function registerTabEvent() {
        $("#btnSaveChart").on('click', function () {
            var executeParam = {
                SPName: 'usp_SaveTrustPaymentChart', SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                    { Name: 'ChartName', value: currentTabId, DBType: 'string' },
                    { Name: 'NodeArray', value: JSON.stringify(nodeArrays), DBType: 'string' },
                    { Name: 'EdgeArray', value: JSON.stringify(edgeArrays), DBType: 'string' },
                ]

            };

            executeRemoteData(executeParam, function (data) {
                if (data) {
                    alert("saved successfuly!");
                }
            });
        })
        var idCount = 213
        $('#addShowColumn').on('click', function () {
            idCount++;
            var newScenario = '<div id="newPro">' +
                        '<span"><input id="toSelect" style="width:90px;margin-top:4px;border: 1px solid"></input></span>' +
                        '</div>'
            var proTmp = '<div title="{0}" class="objElement feeElement" id={1} bfcode="" bfclasstype="" bftype="Fee" bfname="ValueAddedTax_Fee_2" draggable="true" ondragstart="drag(event)">{0}</div>'
            $("#sortable_div").append(newScenario);
            $("#toSelect").change(function () {
                var itemText = $(this).val();
                currentScenarioName = itemText;
                if (itemText != "") {
                    //if ($.inArray(itemText, scenarioNames) > -1) {
                    //    alertMsg("该偿付情景已经存在！");
                    //    $("#toSelect").val("");
                    //    return;
                    //}
                    $("#newPro").remove();
                    proTmp = proTmp.format(currentScenarioName, idCount)
                    $("#sortable_div").append(proTmp);
                }
            });
            
        })
        $("svg").on("allowDrop", function (ev) {
            ev.preventDefault();
        });
        $("div.section").on("dragOver", "svg", function (ev) {
            ev.preventDefault();
        });

        $("div.section").on("mousedown", "svg", mouseDown);

        $("div.section").on("drop", "svg", drop());
    }

    function changeTab(tid, currentTabId) {
        var added = $('.controlAdd');
        $.each(added, function (index, value) {
            $(this).remove();
        })
        renderDisplayer(tid, currentTabId);
    }


   

    return {
        RenderDisplayer: renderDisplayer,
        ChangeTab: changeTab,
        GetTrustPaymentSequence: getTrustPaymentSequence,
        //svgDrop: svgDrop
    }
})();


