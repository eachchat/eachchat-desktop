/**
 * Storage
 * @author Jakit
 * @date 2020/03/27
 */

const types = {};

/**
==========
Search DSL
==========
var search = {
  a: 1,              // a == 1
  _b: 2,             // or b == 2
  c: [1, 2, 3],      // c in [1, 2, 3]
  d: {
    gt: 1,           // d > 1
    gte: 5,          // and d >= 5
    lte: 50,         // and d <= 50
    lt: 100          // and d < 100
  },
  e: '%something'    // like %something%
  $offset: 0,
  $size: 20,
  $order: {          // order by a desc
    by: 'a',
    reverse: true
  }
}
*/

class Storage {
  constructor(config) {
    if (typeof config != "object") {
      config = {};
    }

    this.config = config;
  }

  async open() {
    await this.connect();

    return this;
  }

  async close() {
    await this.disconnect();

    return this;
  }

  async get(index, search) {
    return await this.fetch(index, search);
  }

  async post(index, data) {
    return await this.add(index, data);
  }

  async put(index, data, search) {
    return await this.update(index, data, search);
  }

  async delete(index, search) {
    return await this.drop(index, search);
  }
}

export {
  Storage
}
