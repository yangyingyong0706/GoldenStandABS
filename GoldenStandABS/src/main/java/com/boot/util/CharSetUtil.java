package com.boot.util;

import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author tian
 *
 */
public class CharSetUtil {

 /**
  * 解码 Unicode \\uXXXX
  * @param str
  * @return
  */
 public static String decodeUnicode(String str) {
  Charset set = Charset.forName("UTF-16");
  Pattern p = Pattern.compile("\\\\u([0-9a-fA-F]{4})");
  Matcher m = p.matcher( str );
  int start = 0 ;
  int start2 = 0 ;
  StringBuffer sb = new StringBuffer();
  while( m.find( start ) ) {
   start2 = m.start() ;
   if( start2 > start ){
    String seg = str.substring(start, start2) ;
    sb.append( seg );
   }
   String code = m.group( 1 );
   int i = Integer.valueOf( code , 16 );
   byte[] bb = new byte[ 4 ] ;
   bb[ 0 ] = (byte) ((i >> 8) & 0xFF );
   bb[ 1 ] = (byte) ( i & 0xFF ) ;
   ByteBuffer b = ByteBuffer.wrap(bb);
   sb.append( String.valueOf( set.decode(b) ).trim() );
   start = m.end() ;
  }
  start2 = str.length() ;
  if( start2 > start ){
   String seg = str.substring(start, start2) ;
   sb.append( seg );
  }
  return sb.toString() ;
 }
 
 public static void main(String[] args) {
  System.out.println( decodeUnicode("%7B%22SPName%22%3A%22usp_StructureDesign_GetPeriods%22%2C%22SQLParams%22%3A%5B%7B%22Name%22%3A%22TrustID%22%2C%22Value%22%3A%223612%22%2C%22DBType%22%3A%22int%22%7D%5D%7D"));
 }
}
