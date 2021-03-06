package com.boot.util;

import java.io.UnsupportedEncodingException;

/**
 * url使用Unicode加解密
 * 
 * @author yangyingyong
 * @date 2019-08-29
 *
 */
public class UnicodeConvertUtil {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		String str = "{\"SPName\":\"[dbo].[usp_GetProjectFilters]\",\"SQLParams\":[{\"Name\":\"ItemAliasSetName\",\"Value\":\"zh-CN\",\"DBType\":\"string\"}]}";
		String unicode = stringToUnicode(str);
		System.out.println("字符串转unicode结果：" + unicode);
		String s = unicodeToString(unicode);
		System.out.println("unicode转字符串结果：" + s);
		
		
		String unicode1="%7B%22SPName%22%3A%22usp_StructureDesign_GetPeriods%22%2C%22SQLParams%22%3A%5B%7B%22Name%22%3A%22TrustID%22%2C%22Value%22%3A%223612%22%2C%22DBType%22%3A%22int%22%7D%5D%7D";
		String s1 = unicodeToString(unicode1);
		System.out.println("unicode转字符串结果-----------：" + s1);
	}

	/**
	 * 字符串转unicode编码
	 * 
	 * @param str
	 *            传入字符串
	 * @return 返回转码后的字符串
	 */
	// TODO 待完善出现异常情况 ，需要跟踪日志信息
	public static String stringToUnicode(String str) {
		try {
			String output = java.net.URLDecoder.decode(str, "UTF-8");// 对应的url加密信息进行解码
			return output;
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return "";
		}

	}

	/**
	 * unicode转字符串
	 * 
	 * @param unicode
	 *            编码字符串
	 * @return 返回解码后的字符串
	 */
	public static String unicodeToString(String unicode) {
		try {
			String input = java.net.URLEncoder.encode(unicode, "UTF-8");// 加密
			return input;
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return "";
		}

	}

}
