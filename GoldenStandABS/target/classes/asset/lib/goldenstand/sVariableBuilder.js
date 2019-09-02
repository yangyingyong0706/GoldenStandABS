define(function () {
    function sVariableBuilder() {
        this.Variables = [];
        this.VariableTemp = '<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>{2}</DataType><IsConstant>{3}</IsConstant><IsKey>{4}</IsKey><KeyIndex>{5}</KeyIndex></SessionVariable>';
    }

    sVariableBuilder.prototype = {

        AddVariableItem: function (name, value, dtatType, isConstant, isKey, keyIndex) {
            this.Variables.push({ Name: name, Value: value, DataType: dtatType, IsConstant: isConstant || 0, IsKey: isKey || 0, KeyIndex: keyIndex || 0 });
        },

        BuildVariables: function () {
            var pObj = this;

            var vars = '';
            $.each(this.Variables, function (i, item) {
                vars += pObj.VariableTemp.format(item.Name, item.Value, item.DataType, item.IsConstant, item.IsKey, item.KeyIndex);
            });

            var strReturn = "<SessionVariables>{0}</SessionVariables>".format(vars);
            return strReturn;
        },
        ClearVariableItem: function () {
            this.Variables.splice(0, this.Variables.length);
        }
    }

    return new sVariableBuilder();
});