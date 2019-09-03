package com.boot.entity;

/**
 * Copyright 2019 bejson.com 
* Auto-generated: 2019-08-31 18:1:34
*
* @author yangyingyong
* @website http://www.bejson.com/java2pojo/
  @Date 2019-08-30
  调用获取信任信息
*/
import com.fasterxml.jackson.annotation.JsonProperty;

public class TrustInfo {

   private String Category;
   private String DataType;
   private String EndDate;
   private boolean IsCalculated;
   private boolean IsCompulsory;
   private boolean IsPrimary;
   private String ItemAliasValue;
   private String ItemCode;
   private String ItemId;
   private String ItemValue;
   private String Precise;
   private String SPCode;
   private String SPId;
   private String SPRItemCode;
   private String SequenceNo;
   private String StartDate;
   private String TBId;
   private String UnitOfMeasure;
   public void setCategory(String Category) {
        this.Category = Category;
    }
   //大小写不转换
   @JsonProperty("Category")
    public String getCategory() {
        return Category;
    }

   public void setDataType(String DataType) {
        this.DataType = (DataType==null)?"":DataType;
    }
   @JsonProperty("DataType")
    public String getDataType() {
        return DataType;
    }

   public void setEndDate(String EndDate) {
        this.EndDate = (EndDate==null)?"":EndDate;
    }
   @JsonProperty("EndDate")
    public String getEndDate() {
        return EndDate;
    }

   public void setIsCalculated(boolean IsCalculated) {
        this.IsCalculated = IsCalculated;
    }
   @JsonProperty("IsCalculated")
    public boolean getIsCalculated() {
        return IsCalculated;
    }

   public void setIsCompulsory(boolean IsCompulsory) {
        this.IsCompulsory = IsCompulsory;
    }
   @JsonProperty("IsCompulsory")
    public boolean getIsCompulsory() {
        return IsCompulsory;
    }

   public void setIsPrimary(boolean IsPrimary) {
        this.IsPrimary = IsPrimary;
    }
   @JsonProperty("IsPrimary")
    public boolean getIsPrimary() {
        return IsPrimary;
    }

   public void setItemAliasValue(String ItemAliasValue) {
        this.ItemAliasValue = (ItemAliasValue==null)?"":ItemAliasValue;
    }
   @JsonProperty("ItemAliasValue")
    public String getItemAliasValue() {
        return ItemAliasValue;
    }

   public void setItemCode(String ItemCode) {
        this.ItemCode = (ItemCode==null)?"":ItemCode;
    }
   @JsonProperty("ItemCode")
    public String getItemCode() {
        return ItemCode;
    }

   public void setItemId(String ItemId) {
        this.ItemId = (ItemId==null)?"":ItemId;
    }
   @JsonProperty("ItemId")
    public String getItemId() {
        return ItemId;
    }

   public void setItemValue(String ItemValue) {
        this.ItemValue = (ItemValue==null)?"":ItemValue;
    }
   @JsonProperty("ItemValue")
    public String getItemValue() {
        return ItemValue;
    }

   public void setPrecise(String Precise) {
        this.Precise = (Precise==null)?"":Precise;
    }
   @JsonProperty("Precise")
    public String getPrecise() {
        return Precise;
    }

   public void setSPCode(String SPCode) {
        this.SPCode =(SPCode==null)?"":SPCode; 
    }
   @JsonProperty("SPCode")
    public String getSPCode() {
        return SPCode;
    }

   public void setSPId(String SPId) {
        this.SPId = (SPId==null)?"":SPId;
    }
   @JsonProperty("SPId")
    public String getSPId() {
        return SPId;
    }

   public void setSPRItemCode(String SPRItemCode) {
        this.SPRItemCode = (SPRItemCode==null)?"":SPRItemCode;
    }
   @JsonProperty("SPRItemCode")
    public String getSPRItemCode() {
        return SPRItemCode;
    }

   public void setSequenceNo(String SequenceNo) {
        this.SequenceNo = SequenceNo;
    }
   @JsonProperty("SequenceNo")
    public String getSequenceNo() {
        return SequenceNo;
    }

   public void setStartDate(String StartDate) {
        this.StartDate =  (StartDate==null)?"":StartDate;
    }
   @JsonProperty("StartDate")
    public String getStartDate() {
        return StartDate;
    }

   public void setTBId(String TBId) {
        this.TBId = (TBId==null)?"":TBId; 
    }
   @JsonProperty("TBId")
    public String getTBId() {
        return TBId;
    }

   public void setUnitOfMeasure(String UnitOfMeasure) {
        this.UnitOfMeasure = (UnitOfMeasure==null)?"":UnitOfMeasure;
    }
   @JsonProperty("UnitOfMeasure")
    public String getUnitOfMeasure() {
        return UnitOfMeasure;
    }

}