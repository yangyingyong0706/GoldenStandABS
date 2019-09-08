package com.boot.web;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.boot.entity.req.ExecuteDataTableReq;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MyTest {
    @Autowired
    private WebApplicationContext wac;

    private MockMvc mockMvc;
    
    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
    }

    @After
    public void after() throws Exception {
        mockMvc = null;
    }

    @Test
    public void testJson() throws Exception {//测试提交参数为JSON格式
        
        ExecuteDataTableReq req=new ExecuteDataTableReq();
        req.setConnectionName("TrustManagement");
//        req.setParam("{\"SPName\":\"usp_StructureDesign_GetPeriods\",\"SQLParams\":[{\"Name\":\"TrustID\",\"Value\":\"3612\",\"DBType\":\"int\"}]}");
        req.setParam("%7B%22SPName%22%3A%22usp_StructureDesign_GetPeriods%22%2C%22SQLParams%22%3A%5B%7B%22Name%22%3A%22TrustID%22%2C%22Value%22%3A%223612%22%2C%22DBType%22%3A%22int%22%7D%5D%7D");
        
        ObjectMapper mapper = new ObjectMapper();
        ObjectWriter ow = mapper.writer().withDefaultPrettyPrinter();
        java.lang.String requestJson = ow.writeValueAsString(req);
        
        mockMvc.perform(MockMvcRequestBuilders.post("/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/ExecuteDataTable")
                .contentType(MediaType.APPLICATION_JSON).content(requestJson))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn().getResponse().getContentAsString();

        System.out.println("ok!!!");
    }
    
    
    @Test
    public void testJson() throws Exception {//测试提交参数为JSON格式
        
        ExecuteDataTableReq req=new ExecuteDataTableReq();
        req.setConnectionName("TrustManagement");
//        req.setParam("{\"SPName\":\"usp_StructureDesign_GetPeriods\",\"SQLParams\":[{\"Name\":\"TrustID\",\"Value\":\"3612\",\"DBType\":\"int\"}]}");
        req.setParam("%7B%22SPName%22%3A%22usp_StructureDesign_GetPeriods%22%2C%22SQLParams%22%3A%5B%7B%22Name%22%3A%22TrustID%22%2C%22Value%22%3A%223612%22%2C%22DBType%22%3A%22int%22%7D%5D%7D");
        
        ObjectMapper mapper = new ObjectMapper();
        ObjectWriter ow = mapper.writer().withDefaultPrettyPrinter();
        java.lang.String requestJson = ow.writeValueAsString(req);
        
        mockMvc.perform(MockMvcRequestBuilders.post("/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/GetRulesAndAccountsFromXMLFile")
//                .contentType(MediaType.APPLICATION_JSON).content(requestJson))
                .contentType(MediaType.ALL_VALUE).content(requestJson))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn().getResponse().getContentAsString();

        System.out.println("ok!!!");
    }
    

   /* @Test
    public void testKv() throws Exception {//测试提交参数为键值对格式
        Author req = new Author();
        req.setName("chenqu");
        req.setDesc("foolish");
        req.setSex(EnumSex.Male);
        
        ObjectMapper mapper = new ObjectMapper();
        ObjectWriter ow = mapper.writer().withDefaultPrettyPrinter();
        java.lang.String requestJson = ow.writeValueAsString(req);
        
        mockMvc.perform(MockMvcRequestBuilders.post("/api/authors/kv/1?t=108")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED).content(requestJson))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn().getResponse().getContentAsString();

        System.out.println("ok!!!");
    }*/
}