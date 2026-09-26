const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const emailService = require('../services/email.service')
const tokenBlackListModel=require('../models/blackList.model')

const userRegisterController = async(req,res)=>{
  
  const {email,password,name} = req.body;

  const isExist = await userModel.findOne({
    email:email
  })

  if(isExist) {
    return res.status(422).json({
      message:"User already exist with the same email",
      status:"failed"
    })
  }

  const user = await userModel.create({
    email, password, username:name
  })

  const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn: '3d'})

  res.cookie("token",token)

  res.status(201).json({
    message:"User created successfully",
    user: {
      id: user._id,
      email: user.email,
      name: user.username
    }
  })

  await emailService.sendRegistrationEmail(user.email,user.username)

}

const userLoginController = async(req,res)=>{

  const {email,password} = req.body;

  const user = await userModel.findOne({
    email
  }).select('+password')

  if(!user) {
    return res.status(401).json({message:"Invalid Credentials"})
  }

  const isValidPassword = await user.comparePassword(password);

  if(!isValidPassword) {
    return res.status(401).json({message:"Invalid Password"})
  }

  const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn: '3d'})

  res.cookie("token",token)

  res.status(200).json({
    message:"User logged in successfully",
    user:{
      userId:user._id,
      name:user.username,
      email:user.email
    }
  })

}

const userLogoutController = async(req,res)=>{
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

  if(!token) {
    return res.status(200).json({message:"User loggged out successfully"})
  }

  await tokenBlackListModel.create({
    token:token
  })

  res.clearCookie("token")

  res.status(200).json({
    message:"User logged out successfully"
  })
}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController
}