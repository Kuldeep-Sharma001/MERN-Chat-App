import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    try {
        const tokenString = req?.headers?.authorization;
        if (!tokenString) {
           return res.status(401).json({ success: false, message: "Token not provided" });
        }
        const token = tokenString.split(" ")[1] || tokenString;
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        const decoded = jwt.verify(token, jwtSecretKey);

        req.user = decoded;
        next();

    } catch (error) {
        console.log(error.message);
        res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
}