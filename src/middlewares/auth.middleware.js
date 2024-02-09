import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

//Since there is no need of res ,so we can replace it with underscore
export const verifyJWT = asyncHandler(async (req, _,next) => {
    try {
        console.log(req.cookies);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        //In the above step token is accessed either from req.cookies this cookies is acccesed both
        //by res and req because of cookie-parser middleware
        //In some cases the frontend can send header
        //in jwt header mostly consists of Authorization(key)-->Bearer <token>(value)
        //we just need token value from the header so we are just replaceing whole string to get desired token
        if (!token){
            // console.log("Hi");
            throw new ApiError(401,"Unauthorized request")
        }
        //now our main issue is to get user from db which we want to logout
        //for that to happen we need some data through which we can query to db eg:user_id
        //while generating accessToken we used jwt sign
        /*
         _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        */
        //so through this jwt can verify and decode the data
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //Find the user from the db
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Unable to get access token")
        }
        //now you can create your own object inside req for eg req.user,this can be then used for further implementations
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid access token")
    }

})