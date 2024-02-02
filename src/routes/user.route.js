import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const userRouter=Router();
//Here now this will go to /register from here the control is handed over to registerUser 
userRouter.route("/register").post(registerUser)


export {userRouter}