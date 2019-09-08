package com.boot.entity.req;

import java.util.List;

/**
 * GetTrustData 请求参数处理
 * @author yangyingyong
 *
 */
public class GetTrustDataReq {
	private String SPName;
	private List<GetTrustDataParamsReq> Params;
	public String getSPName() {
		return SPName;
	}
	public void setSPName(String sPName) {
		SPName = sPName;
	}
	public List<GetTrustDataParamsReq> getParams() {
		return Params;
	}
	public void setParams(List<GetTrustDataParamsReq> params) {
		Params = params;
	}
	
	
}
