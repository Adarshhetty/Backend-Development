const asyncHandler=(requestHandler)=>{
    //Promise method
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
    //try catch method

    /*
    const asyncHandler=>(requestHandler)=>async(req,res,next)=>{
        try{
           await requestHandler(req,res,next)
        }
        catch(err)=>{
            res.status(err.code||500).json({
                success:false,
                message:err.message
            })
        }
    }
    */
}
export {asyncHandler}