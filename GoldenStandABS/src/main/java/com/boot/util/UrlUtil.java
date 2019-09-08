package com.boot.util;
import java.io.UnsupportedEncodingException;
/**
 * url转码、解码
 *
 * @author YYY 
 * @date 2019-8-28 下午04:09:35
 */
public class UrlUtil {
    private final static String ENCODE = "UTF-8"; 
    /**
     * URL 解码
     *
     * @return String
     * @author lifq
     * @date 2015-3-17 下午04:09:51
     */
    public static String getURLDecoderString(String str) {
        String result = "";
        if (null == str) {
            return "";
        }
        try {
            result = java.net.URLDecoder.decode(str, ENCODE);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return result;
    }
    /**
     * URL 转码
     *
     * @return String
     * @author lifq
     * @date 2015-3-17 下午04:10:28
     */
    public static String getURLEncoderString(String str) {
        String result = "";
        if (null == str) {
            return "";
        }
        try {
            result = java.net.URLEncoder.encode(str, ENCODE);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 
     * @return void
     * @author lifq
     * @date 2015-3-17 下午04:09:16
     */
    public static void main(String[] args) {
//        String str = "测试1";
//        System.out.println(getURLEncoderString(str));
    	String str="%7B%22SPName%22%3A%22usp_StructureDesign_GetPeriods%22%2C%22SQLParams%22%3A%5B%7B%22Name%22%3A%22TrustID%22%2C%22Value%22%3A%223612%22%2C%22DBType%22%3A%22int%22%7D%5D%7D";
        System.out.println(getURLDecoderString(str));
        
    }

}