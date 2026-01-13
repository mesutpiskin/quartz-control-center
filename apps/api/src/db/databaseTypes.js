"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseType = void 0;
/**
 * Supported database types
 */
var DatabaseType;
(function (DatabaseType) {
    DatabaseType["POSTGRESQL"] = "postgresql";
    DatabaseType["SQL_SERVER"] = "sqlserver";
    DatabaseType["MYSQL"] = "mysql";
})(DatabaseType || (exports.DatabaseType = DatabaseType = {}));
