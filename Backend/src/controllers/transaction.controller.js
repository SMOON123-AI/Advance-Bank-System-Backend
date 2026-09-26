const transactionModel=require('../models/transaction.model')
const accountModel=require('../models/account.model')
const emailService=require('../services/email.service')
const ledgerModel = require('../models/ledger.model')

const mongoose=require('mongoose')


/**
 * - Create transaction for initial funds
 */
const createInitialFundsTransaction=async(req,res)=>{
  const {toAccount, amount, idempotencyKey}=req.body

  if(!toAccount || !idempotencyKey || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      message:"toaccount, Amount and Idempotency Key are required"
    })
  }

  const toUserAccount=await accountModel.findById(toAccount);

  if(!toUserAccount) {
    return res.status(400).json({
      message:"Invalid Account"
    })
  }

  const fromUserAccount = await accountModel.findOne({
    user:req.user._id
  })

  if(!fromUserAccount) {
    return res.status(400).json({
      message:"System user account not found"
    })
  }

  const session=await mongoose.startSession()

  session.startTransaction()

  const transaction=new transactionModel({
    fromAccount:fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status:"PENDING",
  })

  const debitLedgerEntry=await ledgerModel.create([{
    account:fromUserAccount._id,
    amount,
    transaction:transaction._id,
    type:"DEBIT"
  }],{session})

  const creditLedgerEntry=await ledgerModel.create([{
    account:toUserAccount._id,
    amount,
    transaction:transaction._id,
    type:"CREDIT"
  }],{session})

  transaction.status = "COMPLETED"

  await transaction.save({session})

  await session.commitTransaction()
  session.endSession()

  return res.status(201).json({
    message:"Initial funds transaction successfully completed",
    transaction: transaction
  })
}

/**
 * - Create a new transaction
 */
const createTransaction=async(req,res)=>{

  /**
   * 1. Validate Request
   */
  const {fromAccount,toAccount,amount,idempotencyKey}=req.body

  if(!fromAccount || !toAccount || !idempotencyKey || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      message:"FromAccount, ToAccount, Amount and Idempotency Key are required"
    })
  }

  const fromUserAccount=await accountModel.findOne({
    _id:fromAccount,
    user:req.user._id
  })

  const toUserAccount=await accountModel.findOne({
    _id:toAccount
  })

  if(!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message:"Invalid fromAccount or toAccount"
    })
  }

  if (fromAccount === toAccount) {
    return res.status(400).json({
      message: "Cannot transfer money to the same account"
    })
  }

  /**
   * 2. Validate Idempotency Key
   */
  const isTransactionAlreadyExists=await transactionModel.findOne({
    idempotencyKey
  })

  if(isTransactionAlreadyExists) {
    if(isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message:"Transaction already processed",
        transaction:isTransactionAlreadyExists
      })
    }

    if(isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message:"Transaction is still processing"
      })
    }

    if(isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message:"Transaction processing failed, please try again"
      })
    }

    if(isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message:"Transaction was reversed, please retry"
      })
    }
  }

  /**
   * 3. Check account status
   */
  if(fromUserAccount.status !=='ACTIVE' || toUserAccount.status!=='ACTIVE') {
    return res.status(400).json({
      message:"Both fromAccount and toAccount should be active to process a transaction"
    })
  }


  /**
   * 4. Derive Sender Balance from Ledger
   */
  const currentBalance= await fromUserAccount.getBalance();

  if(currentBalance<amount) {
    return res.status(400).json({
      message:`Insufficient Balance. Current Balance=${currentBalance}. Requested Amount is ${amount}`
    })
  }

  /**
   * 5. Create Transactionc(PENDING)
   */
  
  let session;

  try {
    session=await mongoose.startSession()
    session.startTransaction()

    //Array destructuring, create of array documents return an array
    //So technically we are doing result =create(). transaction=result[0]
    const [transaction]=await transactionModel.create([{
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status:"PENDING"
    }],{session})

    const debitLedgerEntry=await ledgerModel.create([{
      account:fromAccount,
      amount,
      transaction:transaction._id,
      type:"DEBIT"
    }],{session})

    const creditLedgerEntry=await ledgerModel.create([{
      account:toAccount,
      amount,
      transaction:transaction._id,
      type:"CREDIT"
    }],{session})

    transaction.status='COMPLETED'

    await transaction.save({session})

    await session.commitTransaction()

    await emailService.sendSuccessfulTransactionEmail(req.user.email,req.user.username,amount,transaction._id)

    return res.status(201).json({
      message: "Transaction successfully completed",
      transaction: transaction
    })

  } catch (error) {
    if (session) {
      await session.abortTransaction()
    }

    await emailService.sendFailedTransactionEmail(req.user.email,req.user.username,amount,error)

    return res.status(500).json({
      message: "Transaction failed",
      error: error.message
    })

  } finally {
    if (session) {
      session.endSession()
    }

  }


  /**
   * 10. Send email notification(Done above)
   */
}


module.exports={
  createInitialFundsTransaction,
  createTransaction
}