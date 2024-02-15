import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File uploaded successfully to cloudinary", response);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        //since upload got failed the file that is saved temporarily in local system has to be removed
        fs.unlinkSync(localFilePath)
        console.log("Error in file upload", error);
        return null
    }
}

const deleteFromCloudinary = async (imageUrl) => {
    try {
        const splitArray = imageUrl.split('/')
        const imageFormat = splitArray[splitArray.length - 1]
        const publicIdAndFormat = imageFormat.split('.')
        const publicId = publicIdAndFormat[0]
        const response =await cloudinary.v2.api
            .resource_by_asset_id(publicId)
            .then(console.log)
        return response
    } catch (error) {
        console.log("Error while deleting the file");
    }

}

export { uploadOnCloudinary,deleteFromCloudinary }
