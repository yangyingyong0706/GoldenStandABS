package com.boot;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;

//@SpringBootApplication 
public class Application {
/*	public static void main(String[] args) throws Exception {
//         SpringApplication.run(Application.class, args);
		String encode = URLEncoder.encode("GBK编码", "GBK");
		System.out.println("乱码" + encode);
		String decode = URLDecoder.decode(encode, "GBK");// GBK解码
		System.out.println(decode);
     }*/
	
	public static void main(String[] args) throws UnsupportedEncodingException {
		String encode = URLEncoder.encode("GBK编码", "GBK");
		System.out.println("乱码" + encode);
		String decode = URLDecoder.decode(encode, "GBK");// GBK解码
		System.out.println(decode);
	}
	
	
}