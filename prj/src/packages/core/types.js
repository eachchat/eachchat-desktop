/**
 * Types
 * @author Jakit
 * @date 2020/03/27
 */

const serial = Symbol("serial");

// 数字整形 委托变量
const integer = Symbol("integer");

// 字符串 委托变量
const string = Symbol("string");

// 浮点数 委托变量
const float = Symbol("float");

// 日期 委托变量
const date = Symbol("date");

export {
  serial,
  integer,
  string,
  float,
  date
}
