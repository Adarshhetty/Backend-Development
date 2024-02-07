import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req, res) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")
        //In the above step token is accessed either from req.cookies this cookies is acccesed both
        //by res and req because of cookie-parser middleware
        //In some cases the frontend can send header
        //in jwt header mostly consists of Authorization(key)-->Bearer <token>(value)
        //we just need token value from the header so we are just replaceing whole string to get desired token
        if (!token)
            throw new ApiError(401, "Unauthorized request")
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