/// <reference types="node" />

import mysql = require('mysql')
interface Table {
  /**
   * Get方法，Select别名，用于查询数据库，返回一个Promise对象
   * @returns Promise对象，resolve时传入查询结果
   */
  get(
    /**
     * 一个对象，key为列名，value为值
     */
    params?: { [x: string]: string | null | number },
    /**
     * 依照什么排序，key为列名，value为是否ASC升序，false为DESC降序，true则为ASC升序
     */
    orderBy?: { [x: string]: boolean }
  ): Promise<any>
  /**
   * Select方法，参数为两个对象，key为列名，value为值，第二个参数可选
   * @returns Promise对象，resolve时传入查询结果
   */
  select(
    /**
     * 一个对象，key为列名，value为值
     */
    params?: { [x: string]: string | null | number },
    /**
     * 依照什么排序，key为列名，value为是否ASC升序，false为DESC降序，true则为ASC升序
     */
    orderBy?: { [x: string]: boolean }
  ): Promise<any>
  /**
   * Insert方法，以在表中插入一个新行
   * @returns Promise对象，resolve时传入insert结果
   */
  insert(
    /**
     * 所有新行的参数，按照表顺序传入
     */
    params: Array<string | number | null>
  ): Promise<any>
  /**
   * Update，更新表中若干行，参考Select方法来找到目标行
   * @returns Promise对象，resolve时传入update结果
   */
  update(
    /**
     * 键值对1，用于表明要更新的内容
     */
    params1: { [x: string]: string | null | number },
    /**
     * 键值对2，用于查找对应的行
     */
    params2?: { [x: string]: string | null | number }
  ): Promise<any>
  /**
   * Delete方法，删除行
   * @returns 一个对象，包含confirm方法，只有在confirm后才会返回一个Promise对象并执行删除操作，resolve时传入delete结果
   */
  delete(): {
    /**
     * 确认执行操作的方法，如果确认，将删除该表所有行，返回一个Promise对象，resolve时传入delete结果
     * @returns Promise对象，resolve时传入delete结果
     */
    confirm(): Promise<any>
  }
  /**
   * Delete方法，删除行
   * @returns Promise对象，resolve时传入delete结果
   */
  delete(
    /**
     * 一个对象，key为列名，value为值
     */
    params?: { [x: string]: string | null | number }
  ): Promise<any>
  /**
   * 直接对数据库执行查询，表名并不会起到任何作用
   * @return {Promise<any>} 返回一个Promise对象，resolve时传入该语句查询结果
   */
  // query: (
  //   /**
  //    * SQL语句，使用"??"、"?"作为占位符
  //    */
  //   sqlStr: string,
  //   /**
  //    * 数组，按顺序包含SQL语句的所有占位符对应的值
  //    */
  //   params: Array<string | number | null>
  // ) => Promise<any>
}
/**
 * 直接对数据库本身执行查询操作
 */
declare const directQuery: (
  /**
   * SQL语句，使用"??"、"?"作为占位符
   */
  sqlStr: string,
  /**
   * 数组，按顺序包含SQL语句的所有占位符对应的值
   */
  params?: Array<string | number | null>
) => Promise<any>
/**
 * 连接数据库，返回一个DataBase对象以进行操作
 */
function connect(p: string | mysql.PoolConfig): DataBase
/**
 * 数据库对象实例
 */
interface DataBase {
  /**
   * 数据库中的所有表
   */
  tables: { [x: string]: Table }
  /**
   * 直接对数据库本身执行查询操作
   */
  query: (
    /**
     * SQL语句，使用"??"、"?"作为占位符
     */
    sqlStr: string,
    /**
     * 数组，按顺序包含SQL语句的所有占位符对应的值
     */
    params?: Array<string | number | null>
  ) => Promise<any>
}
export { connect }
