package com.boot.entity.req;


/**
 * GetTrustData 请求参数处理
 * @author yangyingyong
 *
 */
public class GetTrustDataReq {
	private String SPName;
	private GetTrustDataParamsReq Params;
	public String getSPName() {
		return SPName;
	}
	public void setSPName(String sPName) {
		SPName = sPName;
	}
	public GetTrustDataParamsReq getParams() {
		return Params;
	}
	public void setParams(GetTrustDataParamsReq params) {
		Params = params;
	}
}
