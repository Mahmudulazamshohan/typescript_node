import Express, { Response, Request, NextFunction } from "express";
import Mongoose from "mongoose";
import { AuthRouter } from "./routes/index";
import Logger from "./helpers/logger.helpers";
import BodyParser from "body-parser";
import Compression from "compression";
import User from "./models/user/user.model";
import { debugPrint } from "./helpers/index";
function log(target: Function, key: string, value: any) {
  return {
    value: function (...args: any[]) {
      var a = args.map((a) => JSON.stringify(a)).join();
      var result = value.value.apply(this, args);
      var r = JSON.stringify(result);
      console.log(`Call: ${key}(${a}) => ${r}`);
      return result;
    },
  };
}
const URI =
  "mongodb+srv://shohan:NsFlYwsXCfutbYvf@cluster0.uykkj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
Mongoose.connect(URI, { useNewUrlParser: true }).then(() => {
  debugPrint("MongoDB server Connected");
});
import {Document, model, Model, Schema,QueryWithHelpers} from 'mongoose';
import UserSchema from './models/user/user.schema'

interface IUserDocument extends Document {
  email:string;
  password:string;
  abcd:()=>string;
  getUser:()=>string;
}
interface IUserModel extends Model<IUserDocument> {
  getChildrenTree: () => QueryWithHelpers<Array<IUserDocument>,IUserDocument,any>;
 
  // abcd: () => QueryWithHelpers<Array<IUserDocument>,IUserDocument,any>;
}
UserSchema.plugin((schema:Schema<IUserDocument>,options:any)=>{
  schema.static('getUser',function(){
    return 'getUser';
  })
  schema.method('abcd',function(){
    return 'abcd'
  })
});
var UserModel: IUserModel = model<IUserDocument, IUserModel>('User', UserSchema);
// UserModel.getChildrenTree()
// .then(d=>console.log(d))


UserModel.findOne({})
.then(d=>console.log(d.abcd()))

const app = Express();
app.use(Compression());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());
app.use(Logger);
const PORT = 4000;

app.use("/auth", AuthRouter);
app.get("/save",async (req: Request, res: Response) => {
  var user1 = new User({
    email: "a@gmail.com",
    password: "123456",
  });
  var user2 = new User({
    email: "b@gmail.com",
    password: "123456",
    parent:user1
  });
  var user3 = new User({
    email: "c@gmail.com",
    password: "123456",
    parent:user2
  });
  await user1.save();
  await user2.save();
  await user3.save();
  res.json({})

});
app.get("/",(req:Request,res:Response)=>{
  User.findOne({})
  .then(d=>console.log(d))
  res.json({})
})
app.listen(PORT, () => {
  console.log(`PORT ${PORT}`);
});
