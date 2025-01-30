import jwt from "jsonwebtoken"

export const userAuth= async (req,res,next)=>{
    const {token}= req.cookies;

    if(!token){
        return res.json({success:false, message:"Not Authorized, Login again"});

    }
    try{
   const toeknDecoded=jwt.verify(token, process.env.JWT_SECRET);
   if(toeknDecoded.id){
    req.body.userId =toeknDecoded.id;
   }
   else{
    return res.json({
        success:false, message:"Not authorized, login again"
    })
   }
   next();

    }
    catch(error){
        res.json({success:false, message:error.mesaa})
    }
}
