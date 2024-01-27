import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express();
//app.use() is used when you want to configure or setup middlewares
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
//used when the data is accessed from body for eg formdata
app.use(express.json({
    limit:"16kb"
}))

//used when data is accessed from the url
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

//this is used when you want to save certain files sent to server in public folder
app.use(express.static("public"))

//used to setup cookies
app.use(cookieParser())

export {app}