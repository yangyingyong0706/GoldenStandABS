/**
  * Copyright 2019 bejson.com 
  */
package com.boot.xml.accountRule;

/**
 * Auto-generated: 2019-09-05 11:31:6
 *
 * @author bejson.com (i@bejson.com)
 * @website http://www.bejson.com/java2pojo/
 */
public class Account {

    private VirtualAccounts VirtualAccounts;
    private String Code;
    private static String Name;
    public void setVirtualAccounts(VirtualAccounts VirtualAccounts) {
         this.VirtualAccounts = VirtualAccounts;
     }
     public VirtualAccounts getVirtualAccounts() {
         return VirtualAccounts;
     }

    public void setCode(String Code) {
         this.Code = Code;
     }
     public String getCode() {
         return Code;
     }

    public void setName(String Name) {
         this.Name = Name;
     }
     public String getName() {
         return Name;
     }

}