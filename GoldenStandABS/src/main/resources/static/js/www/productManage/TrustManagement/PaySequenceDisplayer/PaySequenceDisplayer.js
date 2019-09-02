//function drag(ev) {
//    ev.dataTransfer.setData("Text", ev.target.id);
//}

var PaySequenceDisplayer = (function () {
    var trustId = 0;
    var nodeArray = [];
    var edgeArray = [];
    var currentScenrio = '';
    var selectScenario;
    //  RoomCreate("");
    //var scenarioArray;
    var childScenario = [];
    var winHeight = $(window.parent.document).height();
    var winWidth = $(window.parent.document).width();

    function getTrustPaymentSequence(tid, callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            SPName: 'usp_GetTrustPaymentSequence', SQLParams: [
                { Name: 'TrustId', value: tid, DBType: 'int' },
            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, callback);
    }

    function getTrustPaymentChart(tid, callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            SPName: 'usp_GetTrustPaymentChart', SQLParams: [
                { Name: 'TrustId', value: tid, DBType: 'int' },

            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, callback);
    }

    function getTriggeredScenario(trustId) {
        var currentDate = (new Date()).dateFormat('yyyy-MM-dd');
        var executeParam = {
            'SPName': "usp_GetTriggeredScenario", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' },
                { 'Name': 'CurrentDate', 'Value': currentDate, 'DBType': 'string' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (data) {
                var scenarioArray1 = [];
                if (data.length > 0) {
                    $.each(data, function (i, v) {
                        scenarioArray1.push(v.ScenarioName)
                    })
                    currentScenrio = scenarioArray1.join('、');
                }
            }

        });

    }
    function RoomCreate(data) {
        var container = document.getElementById('workflow');
        var createdNode = function (nodeId, nodeName, state) {
            var div = document.createElement('div');
            var innerHtml = '<svg class="svg" width="750" min-height="400"><g/></svg>';
            div.id = nodeId;
            div.className = 'section';
            div.innerHTML = innerHtml;
            var node = document.getElementById(nodeId);
            (node) ? node.firstChild.className = 'taskProgress ' + state : container.appendChild(div);
            return div;
        }
        var node = d3.select(createdNode('control-0', '流程图', 'Pending'));
        renderFlowTree(data)
    }

    function renderFlowTree(data) {
        if (data.length == 0) {
            data = '[{"States":"node_1","AliasValue":"开始","IsActive":0,"IsChildNode":1,"Levels":0}]';
            data = eval('(' + data + ')');
        }
        nodeArray = data;
        var svg = d3.select('#control-0').select('.svg'),
			inner = svg.select("g");
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
            edgeArray = edge;
            edge.forEach(function (row) {
                g.setEdge(row.SourceState, row.TargetState, {});
            });
            g.nodes().forEach(function (v) {
                var node = g.node(v);
                node.rx = node.ry = 6;
            });
            new dagreD3.render()(inner, g);
            $("g.node").unbind();
            $("g.node").bind("mousedown", (function (e) {
                e.preventDefault();
                e.stopPropagation();
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
					    text: "Rename",
					    func: function () {
					        var id = $(this).attr('id')
                            selectScenario = id;
                            var position = document.getElementById(id).getBoundingClientRect();
                            var styleTmp =  'style = "display:none;position:fixed;top:{0};left:{1}"'
                            $('#scenarioName').css({ left: position.left, top: position.top});
                            $('#scenarioName').show();
                            $("#scenarioInput").val($(this).text());
					    }
					}]
                    ];
                    $(this).smartMenu(data, opertion);
                }
            }));

            var xCenterOffset = (800 - g.graph().width) / 2;
            inner.attr("transform", "translate(" + xCenterOffset + ", 40)");
            svg.attr("height", g.graph().height + 100);
        }
        setEdges(edgeArray);
    }
    function onblus() {
        $.each(nodeArray, function (i, v) {
            if (v.States == selectScenario) {
                v.AliasValue = $('#scenarioInput').val()
            }
        });
        renderFlowTree(nodeArray);
        $.each(childScenario, function (j, val) {
            if (selectScenario == val.States) {
                $.each(val.childS, function (k, value) {
                    value.ScenarioName = $('#scenarioInput').val() + "_" + value.ScenarioName.split("_")[1];
                    value.PaymentPhaseName = $('#scenarioInput').val();
                })
                updateToDB(val.childS);
            }
        })
        $('#scenarioName').hide();
    }
    function updateToDB(data) {
        var scenarioXml = '<Scenarios>';
        var scenarioTemplate = '<Scenario><ScenarioId>{0}</ScenarioId><ScenarioName>{1}</ScenarioName><PaymentSequence>{2}</PaymentSequence><PaymentPhaseName>{3}</PaymentPhaseName></Scenario>'
        $.each(data, function (i,v) {
            var scenarioId = v.ScenarioId;
            var scenarioName = v.ScenarioName;
            var paymentSequence = JSON.parse(v.PaymentSequence);
            paymentSequence["ScenarioName"] = scenarioName;
            paymentSequence = JSON.stringify(paymentSequence)

            scenarioXml+=scenarioTemplate.StringFormat(scenarioId, scenarioName, paymentSequence,v.PaymentPhaseName)
        })
        scenarioXml = scenarioXml + "</Scenarios>"
        var executeParam = {
            SPName: 'usp_UpdateScenarioName', SQLParams: [
                { Name: 'ScenarioXml', value: scenarioXml, DBType: 'xml' },
            ]
        };
        executeRemoteData(executeParam, function (data) {
            if (data) {
                alert("update successfuly!");
            }
        });
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
  
    function renderDisplayer(tid) {
        trustId = tid;
        getTriggeredScenario(trustId);
        getTrustPaymentSequence(trustId, function (paymentData) {
            var nodeNameArray = [];
            var tempArray = []
            var firstNode = '[{"States":"node_1","AliasValue":"开始","IsActive":0,"IsChildNode":1,"Levels":0}]';
            firstNode = eval('(' + firstNode + ')');
            nodeArray = firstNode;
            if (paymentData.length > 0) {

                $.each(paymentData, function (index, dataObj) {
                    var vPhaseName = dataObj.PaymentPhaseName;
                    if ($.inArray(vPhaseName, nodeNameArray) > -1)
                    { return true; }
                    nodeNameArray.push(vPhaseName);
                });

                //scenarioArray = $.grep(paymentData, function (n, i) { return n.ScenarioName.indexOf('_') >= 0 });
                //if (scenarioArray && scenarioArray.length > 0) {
                //    $.each(scenarioArray, function (i, v) {
                //        var scenarioName = v.ScenarioName.split('_')[0];
                //        tempArray.push(scenarioName);
                //    })
                //    $.each(tempArray, function (j, val) {
                //        if (nodeNameArray.indexOf(val) == -1) {
                //            nodeNameArray.push(val);
                //        }
                //    })
                //}
                $.each(nodeNameArray, function (i, v) {
                    var nodeObject = {};
                    nodeObject['States'] = "node_1_" + i;
                    nodeObject['AliasValue'] = v;
                    nodeObject['IsChildNode'] = 1
                    nodeObject['FatherNode'] = "node_1"
                    if (currentScenrio.indexOf(v) != -1) {
                        nodeObject['IsActive'] = 1;
                    }
                    else {
                        nodeObject['IsActive'] = 0;
                    }
                   
                    nodeArray.push(nodeObject)
                    var edgObject = {};
                    edgObject['SourceState'] = "node_1"
                    edgObject['TargetState'] = "node_1_" + i;
                    edgeArray.push(edgObject)

                    var scenarioGroup = { States: nodeObject['States'], childS: [] }
                    var currentScenarioArray = $.grep(paymentData, function (pdata) { return pdata.PaymentPhaseName == v });
                    $.each(currentScenarioArray, function (j, val) {

                            scenarioGroup.childS.push(val);
                        
                    })
                    childScenario.push(scenarioGroup);
                })
                RoomCreate(nodeArray)
            }
        })
        
    }

    return {
        RenderDisplayer: renderDisplayer,
        onblus: onblus
    }
})();


