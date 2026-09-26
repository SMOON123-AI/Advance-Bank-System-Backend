const accountModel = require('../models/account.model')

const createAccountController = async (req,res)=>{

  const user = req.user

  const account = await accountModel.create({
    user:user._id,
    currency:req.body.currency
  })

  res.status(201).json({
    account
  })
}

const getUserAccountsController=async(req,res)=>{
  const accounts=await accountModel.find({user:req.user._id})

  res.status(200).json({
    accounts
  })
}

const getUserBalanceController=async(req,res)=>{
  const {accountId}=req.params;

  const account=await accountModel.findOne({
    _id:accountId,
    user:req.user._id
  })

  if(!account) {
    return res.status(404).json({message:"account not found"})
  }

  const balance=await account.getBalance();

  res.status(201).json({
    account:accountId,
    balance
  })
}

module.exports = {
  createAccountController,
  getUserAccountsController,
  getUserBalanceController
}