package com.boot.util;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.RandomAccessFile;

//如果文件存在，则追加内容；如果文件不存在，则创建文件，追加内容的三种方法
public class AppendContentToFile {
	@SuppressWarnings("static-access")
	public static void main(String[] args) {
		AppendContentToFile a = new AppendContentToFile();
		a.method1();
		a.method2("E:\\dd.txt", "222222222222222");
		a.method3("E:\\dd.txt", "33333333333");
	}

	public void method1() {
		FileWriter fw = null;
		try {
			// 如果文件存在，则追加内容；如果文件不存在，则创建文件
			File f = new File("E:\\dd.txt");
			fw = new FileWriter(f, true);
		} catch (IOException e) {
			e.printStackTrace();
		}
		PrintWriter pw = new PrintWriter(fw);
		pw.println("追加内容");
		pw.flush();
		try {
			fw.flush();
			pw.close();
			fw.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static void method3(String fileName, String content) {
		try {
			// 打开一个随机访问文件流，按读写方式
			RandomAccessFile randomFile = new RandomAccessFile(fileName, "rw");
			// 文件长度，字节数
			long fileLength = randomFile.length();
			// 将写文件指针移到文件尾。
			randomFile.seek(fileLength);
			randomFile.writeBytes(content + "\r\n");
			randomFile.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	/**
     * 
     * @Title: writeFile
     * @Description: 写文件
     * @param @param filePath 文件路径
     * @param @param fileContent    文件内容
     * @return void    返回类型
     * @throws
     */
    public static void writeFile(String filePath, String fileContent) {
        try {
            File f = new File(filePath);
            if (!f.exists()) {
                f.createNewFile();
            }
            OutputStreamWriter write = new OutputStreamWriter(new FileOutputStream(f), "UTF-8");
            BufferedWriter writer = new BufferedWriter(write);
            writer.write(fileContent);
            writer.close();
        } catch (Exception e) {
            System.out.println("写文件内容操作出错");
            e.printStackTrace();
        }
    }
	
	
	public static void method2(String file, String conent) {
		BufferedWriter out = null;
		try {
			/*out = new BufferedWriter(new OutputStreamWriter(
					new FileOutputStream(file, true),"UTF-8"));*/
			 out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file,true), "UTF-8"));
			
			out.write(conent);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				out.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
}