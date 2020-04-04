const express = require('express')
// Connect to the database and get models
require('./db/mongoose')
// Setup routers
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
// Setupd express and listening port
const app = express()
const port = process.env.PORT
// Use express extracting json
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
// Start listening port
app.listen(port, () => {
  console.log(`Server is up on port ${port}.`)
})