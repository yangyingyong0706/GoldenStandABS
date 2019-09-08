package com.boot.util;

import java.io.File;
import java.util.Iterator;
import java.util.List;
 
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.Node;
import org.dom4j.io.SAXReader;
 
/**
 * 读取下xml文档,获得document对象。
 * 本文为xml连载第一篇，以下代码可以直接运行，结尾附上源码下载地址。
 */
class exmple {
  public static void main(String[] args) throws DocumentException
  {
    SAXReader reader = new SAXReader();
//    Document document = reader.read(new File("./src/contact.xml"));
    Document document = reader.read(new File("E:/test/test1.xml"));
     
    /**
     * 节点对象的操作方法
     */
     
    //获取文档根节点
    Element root = document.getRootElement();
    //输出根标签的名字
    System.out.println(root.getName());
     
     
    //获取根节点下面的所有子节点（不包过子节点的子节点）
    List<Element> list = root.elements() ;
    //遍历List的方法
    for (Element e:list){
      System.out.println(e.getName());
    }
     
  //获得指定节点下面的子节点
    Element contactElem = root.element("Accounts");//首先要知道自己要操作的节点。 
    List<Element> contactList = contactElem.elements();//获取 Accounts 节点下信息
    for (Element e:contactList){
      System.out.println(e.getName());
    } 
     
     
    //调用下面获取子节点的递归函数。
    getChildNodes(root);
     
     
    //获得当前标签下指定名称的第一个子标签
    Element conElem = root.element("contact");
    System.out.println(conElem.getName());
     
     
    //获得更深层次的标签（一层一层的获取）
    Element nameElem = root.element("contact").element("name");
    System.out.println(nameElem.getName());
  }
   
  //递归查询节点函数,输出节点名称
  private static void getChildNodes(Element elem){
    System.out.println("递归查询节点函数,输出节点名称--"+elem.getName());
    Iterator<Node> it=  elem.nodeIterator();
    while (it.hasNext()){
      Node node = it.next();
      if (node instanceof Element){
        Element e1 = (Element)node;
        getChildNodes(e1);
        }
       
      }
    }
   
   
}