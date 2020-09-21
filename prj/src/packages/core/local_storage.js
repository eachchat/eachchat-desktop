/**
 * LocalStorage
 * @author Jakit
 * @date 2020/04/17
 */

class LocalStorage {
  constructor() {
    var storage = null;

    if (typeof window === "object" &&
      window.hasOwnProperty("localStorage")) {
      storage = window.localStorage;
    }

    this.storage = storage;
  }

  async connect() {
    return;
  }

  async disconnect() {
    return;
  }

  _createIndex(storage, index, fields, primaryKeys) {
    var defaults = {
      index: index,
      fields: fields,
      primaryKeys: primaryKeys,
      data: []
    };

    storage.setItem(index, JSON.stringify(defaults));

    return defaults;
  }

  _checkIndex(storage, index) {
    if (!storage.hasOwnProperty(index)) {
      return null;
    }

    var item = storage.getItem(index);
    var dataObject = null;

    try {
      dataObject = JSON.parse(item);

    } catch (e) {
      console.log(e);
    }

    return dataObject;
  }

  _saveIndex(storage, index, dataObject) {
    try {
      storage.setItem(index, JSON.stringify(dataObject));

    } catch (e) {
      console.log(e);
    }
  }

  async add(index, data) {
    var storage = this.storage;

    if (storage == null) {
      return null;
    }

    var dataObject = this._checkIndex(storage, index);

    if (dataObject == null) {
      return null;
    }

    var primaryValues = [];

    for (var i = 0; i < dataObject.primaryKeys.length; i++) {
      var primaryKey = dataObject.primaryKeys[i];

      if (!(primaryKey in data)) {
        continue;
      }

      primaryValues.push([primaryKey, data[primaryKey]]);
    }

    if (primaryValues.length > 0) {
      var found = dataObject.data.filter((dataItem) => {
        for (var primaryKey in primaryValues) {
          if (!(primaryKey in dataItem)) {
            continue;
          }

          if (dataItem[primaryKey] === primaryValues[primaryKey]) {
            return true;
          }
        }

        return false;
      });

      if (found.length > 0) {
        console.log('Data is duplicate!');
        return null;
      }
    }
  }

  async update(index, data, search) {
    var dataList = this._getDataList();

    if (dataList == null) {
      return null;
    }
  }
}
