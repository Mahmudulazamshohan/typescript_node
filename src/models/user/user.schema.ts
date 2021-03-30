import { Schema, Document } from "mongoose";
const { Types } = Schema;
interface IUser extends Document {
  email?: string;
  password?: string;
  getUser:()=>string;
  
}
const UserSchema = new Schema({
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
UserSchema.pre<IUser>("save", function (next: Function) {
  next();
});
UserSchema.statics.getUser = function () {
  return this.find({}).exec();
};
UserSchema.statics.getChildrenTree = function () {
  return "abcd";
};
UserSchema.methods.getChildrenTree = function () {
  return this.constructor
};

export default UserSchema;
