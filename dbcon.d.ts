/// <reference types="node" />

import mysql = require('mysql')
interface DataBaseTool {
  /**
   * Get方法，用于查询数据库，返回一个Promise对象，参数为两个对象，key为列名，value为值，第二个参数可选
   * @param params 一个对象，key为列名，value为值
   * @param orderBy 依照什么排序，key为列名，value为是否ASC升序，false为DESC降序，true则为ASC升序
   * @returns Promise对象，resolve时传入查询结果
   */
  get(
    params: { [x: string]: string | null | number },
    orderBy: { [x: string]: string | null | number }
  ): Promise<any>
  /**
   * Select方法，Get别名，参数为两个对象，key为列名，value为值，第二个参数可选
   * @param params 一个对象，key为列名，value为值
   * @param orderBy 依照什么排序，key为列名，value为是否ASC升序，false为DESC降序，true则为ASC升序
   * @returns Promise对象，resolve时传入查询结果
   */
  select(
    params: { [x: string]: string | null | number },
    orderBy: { [x: string]: string | null | number }
  ): Promise<any>
  /**
   * Insert方法，插入一个新行
   * @param params 所有新行的参数，按照表顺序传入
   * @returns Promise对象，resolve时传入insert结果
   */
  insert(params: Array<string | number | null>): Promise<any>
  /**
   * Update，更新行，类似于Select的玩法
   * @param params1 键值对1，用于表明要更新的内容
   * @param params2 键值对2，用于查找对应的行
   * @returns Promise对象，resolve时传入update结果
   */
  update(
    params1: { [x: string]: string | null | number },
    params2: { [x: string]: string | null | number }
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
   *  @param params 一个对象，key为列名，value为值
   * @returns Promise对象，resolve时传入delete结果
   */
  delete(params: { [x: string]: string | null | number }): Promise<any>
}
/**
 * 连接数据库并创建一个连接池
 */
declare const connect: (p: string | mysql.PoolConfig) => void
interface DataBase {
  [x: string]: DataBaseTool
}
/**
 * 整个数据库对象
 */
declare const database: DataBase
export { database, connect }
