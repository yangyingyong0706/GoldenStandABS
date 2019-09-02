package com.boot.convert;

import java.util.ArrayList;
import java.util.List;

/**
 * 进行接收前端传入的完成json数据信息使用
 * @author yangyingyonog
 * @date 2019-08-29
 */

public class ExecuteParam {
	/**
	 * 调用的存储过程名字
	 * 如：[dbo].[usp_GetProjectFilters]数据库.存储过程名称
	 */
	public String SPName;
	
    public List<SQLParam> SQLParams = new ArrayList<SQLParam>();
    
    
	public String getSPName() {
		return SPName;
	}
	public void setSPName(String sPName) {
		SPName = sPName;
	}
	public List<SQLParam> getSQLParams() {
		return SQLParams;
	}
	public void setSQLParams(List<SQLParam> sQLParams) {
		SQLParams = sQLParams;
	}
    
    
}
