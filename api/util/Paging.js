import configKeys from "../config/keys.config.js";

export const normalizePaging = (page, pageSize) => {
    const normalizedPage = page ? Math.max(page, 1) : 1;
    const normalizedPageSize = !pageSize || pageSize === 'null'
      ? configKeys.maxPageSize
      : Math.max(Math.min(pageSize, configKeys.maxPageSize), 1);
  
    return {
      page: normalizedPage,
      from: (normalizedPage - 1) * normalizedPageSize,
      pageSize: normalizedPageSize,
    };
  };