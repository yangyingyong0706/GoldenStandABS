package com.boot.entity.req;

/**
 * 产品管理 请求参数信息
 * @author yangyingyong
 * @Date  2019-09-03
 * *
 */
public class TrustListDataReq {
	private int start;//分页使用，开始值
	private int end;//分页使用，结束值
	private String orderby;//管理的信息 TrustId
	private String direction;//排序 升序还是倒序  desc
	private String where;//查询条件
	private String UserName;//登录的用户名 如#goldenstand
	
	public int getStart() {
		return start;
	}
	public void setStart(int start) {
		this.start = start;
	}
	public int getEnd() {
		return end;
	}
	public void setEnd(int end) {
		this.end = end;
	}
	public String getOrderby() {
		return orderby;
	}
	public void setOrderby(String orderby) {
		this.orderby = orderby;
	}
	public String getDirection() {
		return direction;
	}
	public void setDirection(String direction) {
		this.direction = direction;
	}
	public String getWhere() {
		return where;
	}
	public void setWhere(String where) {
		this.where = where;
	}
	public String getUserName() {
		return UserName;
	}
	public void setUserName(String userName) {
		UserName = userName;
	}
	
	
}
