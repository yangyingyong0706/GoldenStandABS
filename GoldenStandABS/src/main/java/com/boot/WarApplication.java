package com.boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
//import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.boot.web.support.SpringBootServletInitializer;

import ch.qos.logback.core.rolling.RollingFileAppender;
/**
 * 使用此类方法进行warapp启动设置
 * @author yangyingyong 2019-08-28
 * 
 *
 */
@SpringBootApplication
public class WarApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(WarApplication.class, args);	
	}

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		return builder.sources(WarApplication.class);
	}
}

