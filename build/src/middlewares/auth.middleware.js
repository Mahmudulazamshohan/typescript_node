"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const AuthMiddleware = (req, res, next) => {
    console.log("auth");
    next();
};
exports.AuthMiddleware = AuthMiddleware;
