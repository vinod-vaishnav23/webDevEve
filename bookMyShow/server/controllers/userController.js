const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const EmailHelper = require("../utils/emailHelper");

const createUser = async function (req, res) {
  try {
    const userExists = await UserModel.findOne({ email: req.body.email });
    if (userExists) {
      return res.send({
        success: false,
        message: "User already registered",
      });
    }

    const newUser = await UserModel(req.body);
    await newUser.save();
    res.send({
      success: true,
      message: "Registration successfull, Please Login",
    });
  } catch (err) {
    console.log(err);
    res.send({
      success: false,
      message: "An error occured, please try again later.",
    });
  }
};

const readUser = async function (req, res) {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.send({
        success: false,
        message: "User does not exist, Please register",
      });
    }

    //check for password for the time being we have stored password as plain text
    if (user.password !== req.body.password) {
      return res.send({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"1d"})
    console.log(token);
    res.send({
      success: true,
      message: "Login Successful",
      data:token
    });
  } catch (err) {
    console.log(err);
    res.send({
      success: false,
      message: "An error occured, please try again later.",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await UserModel.findById(userId).select("-password");
    res.send({
      success: true,
      message: "You are Authenticated",
      data: user,
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
}

const generateOtp = ()=>{
  const otp = Math.floor(Math.random()*100000) + 90000;
  return otp;
}

const forgotPassword = async (req,res)=>{
  try{
    //1. you can ask for email
    //2. check if the email exists
        //2.1 if it exists, create an OTP and send it to the user email
        //2.2 if it does not exist, send a response that it does not exist
    //3 generate an OTP and expiry store it in the database corresponding to the user email
    //4. res with otp.
    //5. send the otp to the user email
    if(req.body.email === undefined){
      return res.send({
        success:false,
        message:"Email is required"
      })
    }
    const user = await UserModel.findOne({email:req.body.email});
    if(!user){
      return res.send({
        success:false,
        message:"User with Email does not exist"
      })
    }
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5*60*1000;
    await user.save();
    res.send({
      success:true,
      message:"OTP sent to your email"
    })
    await EmailHelper("otp.html",user.email,{name:user.name,otp:user.otp})
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
}

module.exports = { createUser, readUser,getCurrentUser,forgotPassword };
