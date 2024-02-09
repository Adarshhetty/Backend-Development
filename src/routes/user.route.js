import { Router } from "express";
import { loginUser, logoutUser, registerUser, requestAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();
//Here now this will go to /register from here the control is handed over to registerUser 

//In registerUser controller we have handled only data inputs that is username password and stuffs
//But for files we cannot do that way ,thats the reason we created a middleware multer which will handle it
//Now the role of the middleware is that before performing certain task execute middleware and go
//Therefore just before executing registerUser controller {upload} middleware(multer) is executed
userRouter.route("/register").post(upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]), registerUser)

//login
userRouter.route("/login").post(loginUser)

//secured routes
//logout
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/refresh-token").post(requestAccessToken)

export { userRouter }