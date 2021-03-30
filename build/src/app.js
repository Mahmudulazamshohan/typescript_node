"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("./routes/index");
const logger_helpers_1 = __importDefault(require("./helpers/logger.helpers"));
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const user_model_1 = __importDefault(require("./models/user/user.model"));
const index_2 = require("./helpers/index");
function log(target, key, value) {
    return {
        value: function (...args) {
            var a = args.map((a) => JSON.stringify(a)).join();
            var result = value.value.apply(this, args);
            var r = JSON.stringify(result);
            console.log(`Call: ${key}(${a}) => ${r}`);
            return result;
        },
    };
}
const URI = "mongodb+srv://shohan:NsFlYwsXCfutbYvf@cluster0.uykkj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose_1.default.connect(URI, { useNewUrlParser: true }).then(() => {
    index_2.debugPrint("MongoDB server Connected");
    user_model_1.default.find({}).then((d) => console.log(d.getChildrenTree()));
});
const app = express_1.default();
app.use(compression_1.default());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(logger_helpers_1.default);
const PORT = 4000;
app.use("/auth", index_1.AuthRouter);
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var user1 = new user_model_1.default({
        email: "a@gmail.com",
        password: "123456",
    });
    var user2 = new user_model_1.default({
        email: "b@gmail.com",
        password: "123456",
        parent: user1
    });
    var user3 = new user_model_1.default({
        email: "c@gmail.com",
        password: "123456",
        parent: user2
    });
    yield user1.save();
    yield user2.save();
    yield user3.save();
    res.json({});
}));
app.listen(PORT, () => {
    console.log(`PORT ${PORT}`);
});
