import { userModel } from "../models/userModel.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { transporter } from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";


export const register = async(req,res)=>{
    const {name,email,password}= req.body;
    if(!name || !email || !password){
        return res.json({
            success: false,
            message:"Missing Details"
        })
    }
    try{
        const existingUser= await userModel.findOne({email})
        if(existingUser){
            return res.json({success:false, message:"User already exist"})
        }
        const hashedPassword= await bcrypt.hash(password,10);
        const user= new userModel({name,email,password:hashedPassword});
        await user.save();

        const token= jwt.sign({id:user._id}, process.env.JWT_SECRET,
            {expiresIn:"7d"});

        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"? "none": "strict",
            maxAge:7*24*60*60*1000
        })

        // sending welcome email

        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to: email,
            subject:"Welcome to mern authenication system",
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOptions);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
            } else {
              console.log("Email sent:", info.response);
            }
          });





        return res.json({success:true})
        
    
    }
    catch(error){
        res.json({success:false, message:error.message})
    }
}

//login

export const login= async (req,res)=>{
    const{email,password}= req.body;
    if(!email || !password){
        return res.json({success:false,message:"Email an passord are required"})
    }
    try{
        const user= await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message: "Invalid email"})
        }
        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message: "Invalid password"})
        }
        const token= jwt.sign({id:user._id}, process.env.JWT_SECRET,
            {expiresIn:"7d"});

        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"? "none": "strict",
            maxAge:7*24*60*60*1000
        })
        return res.json({success:true, message:"Logged In"})
       


    }
    catch(error){
        return res.json({success:false,message:error.message})
    }
}


//logout

export const logout= async (req,res)=>{
    try{
        

        res.clearCookie("token",{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"? "none": "strict",
        })
        return res.json({success:true,message:"Logged out"})
    }
    catch(error){
        return res.json({success:false,message:error.message})
    }
}

// send verification OTP to user'email
export const sendVerifyOtp= async(req,res)=>{
  try{

    const {userId}= req.body;
   const user= await userModel.findById(userId);
   if(user.isAccountVerified){
    return res.json({ success:false, message:"Account alraedy verified"})
   }
   const otp= String(Math.floor(100000+ Math.random()*900000));

   user.verifyOtp=otp;
   user.verifyOtpExpiresAt= Date.now()+24*60*60*1000;
   await user.save();

   
   const mailOptions={
    from: process.env.SENDER_EMAIL,
    to: user.email,
    subject:"Account Verification OTP",
    html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
}

  await transporter.sendMail(mailOptions);
  res.json({success:true, message:"Verification OTP send to your email"})


  }
  catch(error){
    res.json({success: false, message: error.message})
  }


}

// verify email using otp

export const verifyEmail= async(req,res)=>{
    const {userId,otp}=req.body;
    if(!userId || !otp){
        return res.json({success:false, message:"Missing Details"});}

    try{
     const user= await userModel.findById(userId);
     if(!user){
        return res.json({success:false, message:"User not found"})
     } 
     if(user.verifyOtp===""|| user.verifyOtp!==otp ){
        return res.json({success:false, message:"Invalid OTp, try again"})
     }
     if(user.verifyOtpExpiresAt<Date.now()){
        return res.json({success:false, message:"OTP expired"})

     }
     user.isAccountVerified= true;
     user.verifyOtp= "";
     user.verifyOtpExpiresAt=0;
     await user.save();
     return res.json({success:true, message:"Email verified successfully"})


    }
    catch(error){
        res.json({success: false, message: error.message})
    }

    
}

// Important note: how we get the userId, as we are getting a token stored in cookie, we need a middleware to get the cookie then toekn and then get the userId.



// check if user is authenicated
export const isAuthenticated=  async(req,res)=>{
    try{
       return res.json({success:true})


    }
    catch(error){
       return res.json({success:false,message:error.message})
    }



}

//Send password Reset OTP

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }
  
      const otp = String(Math.floor(100000 + Math.random() * 900000));
  
      // Use resetOtp and resetOtpExpiresAt for password reset
      user.resetOtp = otp;
      user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000; // OTP expires in 15 minutes
      await user.save();
  
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Password Reset OTP",
        html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
      };
  
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  };

// Reset User password

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: "Email, OTP, and new password are required!" });
    }
  
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }
  
      // Validate the reset OTP
      if (user.resetOtp === "" || user.resetOtp !== otp) {
        return res.json({ success: false, message: "Invalid OTP!" });
      }
  
      // Check if the OTP has expired
      if (user.resetOtpExpiresAt < Date.now()) {
        return res.json({ success: false, message: "OTP expired" });
      }
  
      // Hash the new password and save it
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
  
      // Clear the reset OTP fields
      user.resetOtp = "";
      user.resetOtpExpiresAt = 0;
  
      await user.save();
      return res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  };


