"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const _1 = require(".");
exports.default = (req, res, next) => {
    _1.debugPrint(url_1.default.format({
        protocol: req.protocol,
        host: req.get("host"),
        pathname: req.originalUrl,
    }));
    next();
};
