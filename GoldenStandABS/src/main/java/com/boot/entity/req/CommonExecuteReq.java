package com.boot.entity.req;
/**
 * 公共的请求参数信息值
 * @author yyy
 * @Date 2019-09-04 
 */
public class CommonExecuteReq {
	private String appDomain;// 属于哪个库
	private ExecuteParamsReq executeParams;// 需要执行的存储过程参数信息
	private String resultType;
	public String getAppDomain() {
		return appDomain;
	}
	public void setAppDomain(String appDomain) {
		this.appDomain = appDomain;
	}
	public ExecuteParamsReq getExecuteParams() {
		return executeParams;
	}
	public void setExecuteParams(ExecuteParamsReq executeParams) {
		this.executeParams = executeParams;
	}
	public String getResultType() {
		return resultType;
	}
	public void setResultType(String resultType) {
		this.resultType = resultType;
	}
}
