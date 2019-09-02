var settable = {
    table: { "class": "mytable" },
    tableTh: { "class": "table-th" },
    tableTd: { "class": "table-td" },
    tableTdLeft: { "class": "table-td-left" }
};

// pager plugins
$.fn.datagrid("plugin", "pager", "mypager", "default", {
    attrUl: {
        "class": "pager"
    },
    item: "li",
    attrItemActive: {
        "class": "active",
        "style": "background-color:#efefef"
    },
    attrItemDisabled: {
        "class": "disabled",
        "style": "background-color:#fff"
    },
    link: true,
    behavior: false,
    /*firstPage: "&lt;&lt;",*/
    prevPage: "&lt;",
    nextPage: "&gt;",
    /*lastPage: "&gt;&gt;"*/
});

//sorter plugins
$.fn.datagrid("plugin", "sorter", "mysorter", "default", {
    up: "<span style='padding-left:2px;font-size:15px;vertical-align:middle;height:100%;line-height:100%;'>▴</span>",
    down: "<span style='padding-left:2px;font-size:15px;vertical-align:middle;height:100%;line-height:100%;'>▾</span>"
});