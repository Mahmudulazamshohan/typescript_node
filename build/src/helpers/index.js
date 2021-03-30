"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugPrint = void 0;
const process_1 = __importDefault(require("process"));
exports.debugPrint = process_1.default.env.NODE_ENV === "development" ? console.log : () => { };
