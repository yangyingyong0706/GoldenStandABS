package com.boot.config;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.AbstractJsonpResponseBodyAdvice;

/**
 *  Created by yangyingyong on 2019/08/28
 *  设置jsonp的配置
 *  AbstractJsonpResponseBodyAdvice来支持跨域请求
 */
//三种不同的写法进行 支持跨域请求  
@ControllerAdvice
//@ControllerAdvice(basePackages = "com.zkn.learnspringboot.web.controller")//指定一个类
//@ControllerAdvice(basePackageClasses = {HomeController.class})//支持多个类
public class JsonpAdvice extends AbstractJsonpResponseBodyAdvice {
    public JsonpAdvice() {
        super("callback", "jsonp");
    }
}


