package com.boot.entity.req;

/**
 * 请求GetItemsPlus方法的数据封装
 * 
 * @author yangyingyong
 * @Date 2019-09-08
 *
 */

public class contextInfoReq {
	private String SPName;
	private ParamsReq Params;
	
	public String getSPName() {
		return SPName;
	}

	public void setSPName(String sPName) {
		SPName = sPName;
	}

	public ParamsReq getParams() {
		return Params;
	}

	public void setParams(ParamsReq params) {
		Params = params;
	}

}
