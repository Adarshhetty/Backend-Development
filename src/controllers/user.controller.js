import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        //find user with provided userId
        const user = await User.findById(userId)
        //then generate access and refresh tokens
        const accessToken = user.generateAccessToken()  //defined in User model
        const refreshedToken = user.generateRefreshToken() //defined in User model
        //then store refresh token in user model
        user.refreshToken = refreshedToken
        // now save,while saving by default the database tries to validate again for the input fields 
        //which we do not want hence validateBeforeSave is set to false
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshedToken }
    } catch (error) {
        throw new ApiError(500, "Error while generating access and refresh tokens")
    }
}
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
    ) {
        throw new ApiError(400, "All fields are required !")
    }
    //this will trim all the whitespaces and check if it is equal to "" i.e empty it will return true

    //3.Now to check if user already exists ,to do so we can make use of models created which will
    //directly communicate with mongoDB

    //User.findOne({ email }) //one can check this way as well . But while dealing with multiple 
    //fields we can use below method

    const existedUser = await User.findOne(
        {
            $or: [{ username }, { email }] //based on your needs
        }
    ) //As name suggests this will find the first object that has similar credentials

    if (existedUser)
        throw new ApiError(409, "User with this email or username already exists !!")


    //4.Handle input images
    //Multer provides additional feature to req that is files inside which we have avatar
    //and cover image and at the first position we have path at which it is stored
    //NOTE:THIS FILE IS NOT YET UPLOADED TO CLOUDINARY ITS JUST UPLAOD TO SERVER RIGHT NOW
    const avatarLocalFilePath = req.files?.avatar[0]?.path
    console.log(avatarLocalFilePath);
    console.log(req.files);
    let coverImageLocalFilePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalFilePath = req.files.coverImage[0].path
    }
    console.log(coverImageLocalFilePath);

    //Since avatar is required field we have to check if its present or not

    if (!avatarLocalFilePath)
        throw new ApiError(406, "Avatar image is required !")

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

//Login User
const loginUser = asyncHandler(async (req, res) => {
    //1.Get data points from req.body
    const { username, email, password } = req.body
    //2.Check if username or email is present
    if (!username || !email) {
        throw new ApiError(400, "Username or email is required !")
    }
    //3.Search if the user with given username or email is present
    const regsiteredUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    //4.Check if user is present
    if (!regsiteredUser)
        throw new ApiError(408, "User does not exist !")
    //5.If yes check if password is correct
    if (!await regsiteredUser.isPasswordCorrect(password))
        throw new ApiError(400, "Incorrect password")

    //6.Generate access token and refresh token 
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(regsiteredUser._id)

    //7. Since refreshToken is not modified for registerUser we can access loggedIn user in two ways
    //1. Using .save()
    // registerUser.refreshToken=refreshToken
    // await registerUser.save({validateBeforeSave:false})
    //2. By querying into the database
    const loggedInUser = await User.findById(regsiteredUser._id).select("-password -refreshToken")
    //8.Send data via cookies
    const options = {
        httpOnly: true,
        secure: true
    }
    //This option enables a feature -->only server can change the data sent via cookies not the frontend of the website

    //9. Return reponse and cookie
    return res.status(200).
        cookies("accessToken", accessToken, options).
        cookies("refreshToken", refreshToken, options).
        json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken //Why to send accessToken and refreshToken again?
                    //Well the answer is that it might be stored in localstoarge of the device or if a mobile app is built

                },
                "User Logged In Sucessfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, {
        //this will set your refreshToken to undefined
        $set: { refreshToken: undefined }
    },
        //this tells that the db has to be modified(new) version after update
        {
            new: true
        })

    //now we need to clear cookies as well
    const options = {
        httpOnly: true,
        secure: true
    }

    //return response
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out")
        )
})
export { registerUser, loginUser, logoutUser }