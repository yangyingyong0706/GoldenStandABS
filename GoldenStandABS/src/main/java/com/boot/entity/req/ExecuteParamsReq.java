package com.boot.entity.req;

import java.util.List;

/**
 *  执行存储过程的参数信息
 * @author yangyingyong
 *
 */
public class ExecuteParamsReq {
	private String SPName;//属于哪个存储过程
	private List<SQLParamsReq> SQLParams;//执行的语句参数信息值
	
	public String getSPName() {
		return SPName;
	}
	public void setSPName(String sPName) {
		SPName = sPName;
	}
	public List<SQLParamsReq> getSQLParams() {
		return SQLParams;
	}
	public void setSQLParams(List<SQLParamsReq> sQLParams) {
		SQLParams = sQLParams;
	}

}
