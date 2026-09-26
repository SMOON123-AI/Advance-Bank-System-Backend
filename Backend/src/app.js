const express = require('express')
const cookieParser=require('cookie-parser')


const app=express()

app.use(express.json())
app.use(cookieParser())


/**
 * - Routes required
 */
const authRouter = require('./routes/auth.routes')
const accountRouter = require('./routes/account.routes')
const transactionRouter = require('./routes/transaction.routes')

/**
 * - Use Routes
 */
app.use('/api/auth',authRouter)
app.use('/api/accounts',accountRouter)
app.use('/api/transactions',transactionRouter)

/**
 * Dummy Route to check whether the backend is running after deploying it (ex:deploy it on render)
 */
app.get("/",(req,res)=>{
  res.send("Ledger Server is up and running")
})


module.exports = app