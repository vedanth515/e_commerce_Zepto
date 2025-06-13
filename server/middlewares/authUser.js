

// middlewares/authUser.js
import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  // const { token } = req.cookies;

  try {
    const token = req.cookies.token;

    
    // Debug logs for backend
    console.log("authUser middleware hit");
    console.log("Cookies:", req.cookies);

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

     if(!decoded || !decoded.id){
            return res.json({success: false, message: "Not authorized"});
        }

    req.id = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authUser;












