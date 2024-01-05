export class Response {
  code;
  message;
  doc;
  docs;

  constructor({ code, message, doc, docs }) {
    this.code = code;
    this.message = message;
    this.doc = doc;
    this.docs = docs;
  }
}

export class PagedResponse {
  code;
  message;
  page;
  pageSize;
  total;
  docs;

  constructor({ code, message, page, pageSize, total, docs }) {
    this.code = code;
    this.message = message;
    this.page = page;
    this.pageSize = pageSize;
    this.total = total;
    this.docs = docs;
  }
}

