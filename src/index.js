// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';
dotenv.config({ path: './env' })
connectDB()
    .then(() => {
        app.on("error",(error)=>{
            console.log("Server error occured",error);
        })
        app.listen(process.env.PORT||8000, () => {
            console.log(`⚙️  Server running on PORT:${process.env.PORT||8000}`);
        })
    })
    .catch((error) => {
        console.log("MONGODB connection failed !!!", error);
    })
/*
const app=express()
(async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Error",(error)=>{
            console.log("Error:",error);
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App running on port:${process.env.PORT}`);
        })
    } catch (error) {
        console.error("Error:",error);
    }
})()
*/ 