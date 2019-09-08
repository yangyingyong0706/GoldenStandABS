package com.boot.entity.req;
/**
 * 执行的语句信息
 * @author yangyingyong
 *
 */
public class SQLParamsReq {
	private String Name;//字段名称
	private String Value;//值
	private String DBType;//类型
	public String getName() {
		return Name;
	}
	public void setName(String name) {
		Name = name;
	}
	public String getValue() {
		return Value;
	}
	public void setValue(String value) {
		Value = value;
	}
	public String getDBType() {
		return DBType;
	}
	public void setDBType(String dBType) {
		DBType = dBType;
	}
}
