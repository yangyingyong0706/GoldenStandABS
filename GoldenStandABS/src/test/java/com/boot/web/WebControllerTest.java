package com.boot.web;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.junit4.SpringRunner;

import com.boot.baseTest.SpringTestCase;
/**
 * 测试web连接访问
 * @author DELL
 *
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class WebControllerTest extends SpringTestCase{
	Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
    private TestRestTemplate restTemplate;
    @Test
    public void getName() {
        String name = restTemplate.getForObject("/name", String.class);
        System.out.println(name);
        Assert.assertEquals("Adam", name);
    }
	@Test  
    public void Test(){  
	
		
	}	
	
}
