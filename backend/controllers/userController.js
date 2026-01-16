import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        
        const userId = req.userData.id;
        if (!userId) {
            res.status(500).json({
                success: false,
                message:"Please login again"
            })
        }

        const allUsers = await User.find({_id:{$ne:userId}})

        res.status(200).json({
            success: true,
            message: "Successfully fetched all users data",
            users:allUsers
        })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong during fetching users. \nError:" + error.message,
            
        })
    }
}