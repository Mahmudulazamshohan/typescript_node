"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mpath_1 = __importDefault(require("../../helpers/mpath"));
const { Types } = mongoose_1.Schema;
const UserSchema = new mongoose_1.Schema({
    email: {
        type: Types.String,
        unique: true,
        required: true,
    },
    password: {
        type: Types.String,
        required: true,
    },
});
UserSchema.plugin(mpath_1.default);
exports.default = UserSchema;
