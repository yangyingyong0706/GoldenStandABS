package com.boot.entity.req;
/**
 * 
 * @author yangyingyong
 *
 */
public class ExecuteDataTableReq {
	private String connectionName;
	private String param;

	public String getConnectionName() {
		return connectionName;
	}

	public void setConnectionName(String connectionName) {
		this.connectionName = connectionName;
	}

	public String getParam() {
		return param;
	}

	public void setParam(String param) {
		this.param = param;
	}

}
