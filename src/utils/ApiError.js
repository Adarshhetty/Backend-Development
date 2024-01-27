class ApiError extends Error{
    constructor(statusCode,stack,message="Something went wrong :(",errors=[]){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.errors=errors
        this.success=false

        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export {ApiError}