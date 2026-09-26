const mongoose=require('mongoose')
const bcrypt = require('bcryptjs')

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new mongoose.Schema({
  email:{
    type:String,
    required:[true,"Email is required"],
    trim:true,
    lowercase:true,
    match:[emailRegex,"Invalid Email"],
    unique:[true,"Email already exists"],
  },
  username:{
    type:String,
    required:[true,'Name is required']
  },
  password:{
    type:String,
    required:[true,"Password is Required"],
    minlength:[6,'Password should be atleast 6 characters'],
    select: false
  },
  systemUser:{
    type:Boolean,
    default:false,
    immutable:true,
    select:false
  }
}, {
  timestamps: true
})

userSchema.pre("save", async function (){

  if(!this.isModified("password")) {
    return next();
  }

  const hash=await bcrypt.hash(this.password,10);
  this.password = hash

  return
})

userSchema.methods.comparePassword = async function (password) {

  return await bcrypt.compare(password,this.password)

}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel