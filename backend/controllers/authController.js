import bcrypt from 'bcryptjs';
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
//Registration
export const signup = async (req, res) => {
    try {
      const { fullname, email, password } = req.body;
      if (!fullname || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the input fields",
        });
      }

      const user = await User.findOne({ email });

      //Whether user already registered or not
      if (user) {
        console.log("This email is already registered with another account");
        res.status(400).json({
          success: false,
          message: "This email is already registered with another account",
        });
      }

      //Profile Picture
      const names = fullname.split(" ");
      const profilePicture = `https://api.dicebear.com/9.x/initials/svg?seed=${names[0]}%20${names[1]}`;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("allright here");

      //Create user
      const newUser = await User.create({
        fullname,
        email,
        password: hashedPassword,
        profilePicture,
      });
      //Generating token
      const payload = {
        fullname,
        id: newUser._id,
      };
      const secretKey = process.env.JWT_SECRET_KEY;
      const token = jwt.sign(payload, secretKey, { expiresIn: "5d" });
      //return response
      return res.status(200).json({
        success: false,
        message: "SignUp Successfully",
        token
      });
    } catch (error) {
        console.log("Something went wrong. \n error:", error.message);
        res.status(500).json({
            success: false,
            message:error.message
        })
    }
}

//Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:"Please fill all input fields"
            })
        }
        
        // whether email is registered or not
        const user = await User.findOne({ email });
        if (!user) {
           return res.status(400).json({
                success: false,
                message:"No user found"
            })
        }
        
        // Check password
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            res.status(400).json({
                success: false,
                message:"Invalid credentials"
            })
        }

        //Generating token
        const payload = {
            fullname: user.fullname,
            id:user._id
        }
        const secretKey = process.env.JWT_SECRET_KEY;
        const token = jwt.sign(payload, secretKey, { expiresIn: '5d' });

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token
        })

    } catch (error) {
        console.log("Something went wrong during login");
        res.status(400).json({
            success: false,
            message:"Login error: "+error.message
        })
    }
}
