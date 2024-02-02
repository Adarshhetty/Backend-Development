import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
    // Steps while registering user
    //1.Get user information from the frontend
    //We can make use of postman to check if the req has data
    const { username, email, fullname, password } = req.body
    console.log("username:", username, "\nemail:", email, "\nfullname:", fullname);

    //2.Validation of the input data
    //We can make use of simple if else statement like
    /*
    if(username==="")throw new ApiError(400,"Username required") //this ApiError is from utils
    
    Below is another way in which we can validate bcoz we have multiple fields to validate
    */
    if (
        [username, email, fullname, password].some(
            (fields) => fields?.trim() === "")
    )
        throw new ApiError(400, "All fields are required !")
    //this will trim all the whitespaces and check if it is equal to "" i.e empty it will return true

    //3.Now to check if user already exists ,to do so we can make use of models created which will
    //directly communicate with mongoDB

    //User.findOne({ email }) //one can check this way as well . But while dealing with multiple 
    //fields we can use below method

    const existedUser = User.findOne(
        {
            $or: [{ email }, { username }] //based on your needs
        }
    ) //As name suggests this will find the first object that has similar credentials

    if (existedUser)
        throw new ApiError(409, "User with this email or username already exists !!")


    //4.Handle input images
    //Multer provides additional feature to req that is files inside which we have avatar
    //and cover image and at the first position we have path at which it is stored
    //NOTE:THIS FILE IS NOT YET UPLOADED TO CLOUDINARY ITS JUST UPLAOD TO SERVER RIGHT NOW

    const avatarLocalFilePath = req.files?.avatar[0]?.path

    const coverImageLocalFilePath = req.files?.coverImage[0]?.path

    //Since avatar is required field we have to check if its present or not

    if (!avatarLocalFilePath)
        throw new ApiError(408, "Avatar image is required !")

    //5. Upload the images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalFilePath)
    const coverImage = await uploadOnCloudinary(coverImageLocalFilePath)

    //again check if avatar is present or not

    if (!avatar)
        throw new ApiError(408, "Avatar is required !")

    //6. Add user to DB
    const user = await User.create({
        username,
        email,
        fullname,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "" //here we have not validated if cover image is present or not so we are preventing DB from crashing
    })
    const createdUser = await User.findById(user._id).select(
        "-password -requestToken"
    )//What this will do is remove password and refreshToken field white returning the object
    //which is not required for user to know

    //now check if user is present
    if (!createdUser)
        throw new ApiError(500, "Error while registering the user")//Our error so 500 statusCode

    //7. Return the response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully !")
    )
})
export { registerUser }