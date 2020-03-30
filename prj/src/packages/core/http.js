/**
 * HTTP
 * @author Jakit
 * @data 2020/03/27
 */

import axios from "axios";

class HTTP {
  static MIME = {
    plain: "text/plain",
    html: "text/html",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp4: "video/mp4",
    json: "application/json",
    stream: "application/octet-stream"
  }

  constructor(hostname, port) {
    this.hostname = hostname;
    this.baseURL = "http://" + hostname;
    this.port = 80;

    if (typeof port == "number") {
      this.port = port;
    }

    this.sender = axios.create({
      baseURL: this.baseURL + ":" + String(port)
    });

    console.log(this.sender);
  }

  static contentTypeChecker = (function (mimeTypes) {
    var typeCheck = {};

    for (var mimeType in mimeTypes) {
      if (!mimeTypes.hasOwnProperty(mimeType)) {
        continue;
      }

      (function (checker, typeName, typeText) {
        Object.defineProperty(checker, typeName, {
          get() {
            return this.type.includes(typeText);
          }
        });
      })(typeCheck, mimeType, mimeTypes[mimeType]);
    }

    return Object.freeze(typeCheck);
  })(HTTP.MIME);

  parseHeader(response) {
    var checker = Object.assign(
      Object.create(HTTP.contentTypeChecker),
      {
        type: "unknown"
      });

    var result = Object.assign({
      status: 0,
      headers: {},
      ok: false,
      is: checker
    }, result);

    if ("status" in response) {
      result.status = response.status;

      if (response.status >= 200
        && response.status < 300) {
        result.ok = true;
      }
    }

    if ("headers" in response) {
      result.headers = response.headers;
    }

    if ("content-type" in result.headers) {
      result.is.type = result.headers["content-type"];
    }

    return result;
  }

  parseResponse(response) {
    var result = this.parseHeader(response);

    result.data = undefined;

    if ("data" in response) {
      result.data = response.data;
    }

    return result;
  }

  async head(path, headers, appendix) {
    if (typeof headers == "undefined") {
      headers = {};
    }

    if (typeof appendix == "undefined") {
      appendix = {};
    }

    var config = Object.assign({
      headers: headers,
    }, appendix);

    var response = await this.sender.head(path, config);

    return this.parseResponse(response);
  }

  async get(path, headers, appendix) {
    if (typeof headers == "undefined") {
      headers = {};
    }

    if (typeof appendix == "undefined") {
      appendix = {};
    }

    var config = Object.assign({
      headers: headers,
    }, appendix);

    var response = await this.sender.get(path, config);

    return this.parseResponse(response);
  }

  async post(path, data, headers, appendix) {
    if (typeof data == "undefined") {
      data = {};
    }

    if (typeof headers == "undefined") {
      headers = {};
    }

    if (typeof appendix == "undefined") {
      appendix = {};
    }

    var config = Object.assign({
      headers: headers,
    }, appendix);

    var response = await this.sender.post(path, data, config);

    return this.parseResponse(response);
  }

  async put(path, data, headers, appendix) {
    if (typeof data == "undefined") {
      data = {};
    }

    if (typeof headers == "undefined") {
      headers = {};
    }

    if (typeof appendix == "undefined") {
      appendix = {};
    }

    var config = Object.assign({
      headers: headers,
    }, appendix);

    var response = await this.sender.put(path, data, config);

    return this.parseResponse(response);
  }

  async patch(path, data, headers, appendix) {
    if (typeof data == "undefined") {
      data = {};
    }

    if (typeof headers == "undefined") {
      headers = {};
    }

    if (typeof appendix == "undefined") {
      appendix = {};
    }

    var config = Object.assign({
      headers: headers,
    }, appendix);

    var response = await this.sender.patch(path, data, config);

    return this.parseResponse(response);
  }

  async delete(path, headers, appendix) {
    if (typeof headers == "undefined") {
      headers = {};
    }

    if (typeof appendix == "undefined") {
      appendix = {};
    }

    var config = Object.assign({
      headers: headers,
    }, appendix);

    var response = await this.sender.delete(path, config);

    return this.parseResponse(response);
  }
}

export {
  HTTP
}
