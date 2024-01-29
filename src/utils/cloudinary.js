import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("File uploaded successfully to cloudinary",response.url);
        return response;
    } catch (error) {
        //since upload got failed the file that is saved temporarily in local system has to be removed
        fs.unlinkSync(localFilePath)
        console.log("Error in file upload",error);
        return null
    }
}

export {uploadOnCloudinary}
