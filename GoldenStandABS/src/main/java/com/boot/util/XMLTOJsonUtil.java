package com.boot.util;
//放几个必要的
import java.util.List;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import cn.hutool.json.XML;
import cn.hutool.json.JSONObject;

import com.alibaba.fastjson.JSON;
/*import com.alibaba.fastjson.JSONObject;*/

public class XMLTOJsonUtil {
	
	public static String xml3Json(String xmlStr) throws DocumentException {
        Document document = DocumentHelper.parseText(xmlStr);
        Element publicEle = document.getRootElement().element("Public");
        xmlToJsonList(publicEle);
        String asXML = publicEle.asXML();
        //正常模式的xml快速转json格式
        JSONObject  jsonObject = XML.toJSONObject(asXML);
        JSONObject json = (JSONObject) JSON.parse(jsonObject.toString());
        return json.get("Public").toString();
    }
    @SuppressWarnings("unchecked")
    public static void xmlToJsonList(Element publicEle) {
        List<Element> elements = publicEle.elements();
        for(Element element : elements){
            if(element.attribute("value") != null){
                //先得到该值
                String value = element.attributeValue("value");
                //再去除value属性
                element.remove(element.attribute("value"));
                //再为该节点添加值
                element.setText(value);
            }else{
                //递归
                xmlToJsonList(element);
            }
        }
    }
    
    public static void main(String[] args) throws DocumentException {
        String x1="<?xml version=\"1.0\" encoding=\"GB18030\"?><Message><Public><TxnCode value=\"CT02\" /><aaaa><SiteID value=\"00000001\" /><bbbb><TermID value=\"\" /><ffff><gggg><hhhh><tttt value=\"你好\" /></hhhh></gggg></ffff></bbbb><TxnBatchNo value=\"20170607152322\" /></aaaa><TxnSeq value=\"1\" /><TlrNo value=\"01\" /><CardNo value=\"2017000100000003\" /><Amt value=\"0.01\" /><OprType value=\"01\" /><RelTxnSsn value=\"IPEM00000000320170607152231\" /></Public></Message>";
        System.out.println(xml3Json(x1));
    }  
}
