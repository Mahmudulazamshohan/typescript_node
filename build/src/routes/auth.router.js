"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("./../middlewares/auth.middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.Router();
router.get("/login", (req, res) => {
    const { email, password } = req.query;
    console.log(email);
    var token = jsonwebtoken_1.default.sign({
        email,
        password,
    }, "somesecret", {
        expiresIn: "1m",
    });
    res.json({ token });
});
router.get("/verify", auth_middleware_1.AuthMiddleware, (req, res) => {
    var { token } = req.query;
    var data = jsonwebtoken_1.default.verify(String(token).toString(), "somesecret");
    res.json({
        data,
    });
});
exports.AuthRouter = router;
