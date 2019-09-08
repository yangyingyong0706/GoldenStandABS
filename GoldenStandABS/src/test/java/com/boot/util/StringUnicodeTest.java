package com.boot.util;

import org.springframework.util.StringUtils;

public class StringUnicodeTest {
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		String str = "{\"SPName\":\"[dbo].[usp_GetProjectFilters]\",\"SQLParams\":[{\"Name\":\"ItemAliasSetName\",\"Value\":\"zh-CN\",\"DBType\":\"string\"}]}";
		String unicode = stringToUnicode(str);
		System.out.println("字符串转unicode结果：" + unicode);
		String s = unicodeToString(unicode);
		System.out.println("unicode转字符串结果：" + s);
		
		
		
		String a="";
		if(StringUtils.isEmpty(a.trim())){
			System.out.println("兩個相等---2");
		}else{
			
			System.out.println("兩個不相等----1");
		}
	System.out.println(new String().format("\"Code\":\"{%s}\",\"Name\":\"{%s}\",)", "hahhaha","hehehhehe"));	
 
	}
 
	/**
	 * 字符串转unicode
	 * 
	 * @param str
	 * @return
	 */
	public static String stringToUnicode(String str) {
		StringBuffer sb = new StringBuffer();
		char[] c = str.toCharArray();
		for (int i = 0; i < c.length; i++) {
			sb.append("\\u" + Integer.toHexString(c[i]));
		}
		return sb.toString();
	}
 
	/**
	 * unicode转字符串
	 * 
	 * @param unicode
	 * @return
	 */
	public static String unicodeToString(String unicode) {
		StringBuffer sb = new StringBuffer();
		String[] hex = unicode.split("\\\\u");
		for (int i = 1; i < hex.length; i++) {
			int index = Integer.parseInt(hex[i], 16);
			sb.append((char) index);
		}
		return sb.toString();
	}
}
