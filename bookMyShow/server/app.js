const express = require('express');
const connectDB = require('./config/db');
const userRoute = require('./routes/userRoutes');

require('dotenv').config();// load the environment variables

//connect to the database
connectDB(process.env.DB_URL);

const app = express();
const PORT = 8080;

app.use(express.json());//parse incoming json request
app.use('/api/user',userRoute)



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})