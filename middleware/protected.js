import jwt from "jsonwebtoken";
import User from "../model/usermodel.js";
export const protectedroutes = async (req, res, next) => {
  try {
    const refreshtoken = req.cookies.refreshtoken;
    if (!refreshtoken) {
      return res.status(403).json({
        message: "No refresh token provided",
      });
    }
    const decode = jwt.verify(refreshtoken, process.env.secretkey);
    const user = User.findOne(decode.userId).select("-password");
    if (!user) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      message: "error validating token",
      error,
    });
  }
};

export const adminroutes = async (req, res , next) => {
  const user = req.user;
  if (user.role && req.user.role === "admin") {
   return next();
  } else {
    return res.json({
      message: "admin access denied",
    });
  }
};
