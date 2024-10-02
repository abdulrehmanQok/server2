import User from "../model/usermodel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redis } from "../middleware/redis.js";

const generatetoken = (userid) => {
    const accesstoken = jwt.sign({ userid }, process.env.secretkey, {
        expiresIn: '15m'
    });
    const refreshtoken = jwt.sign({ userid }, process.env.secretkey1, {
        expiresIn: '7d'
    });
    return { accesstoken, refreshtoken };
}

const storetoken = async (userid, refreshtoken) => {
    await redis.set(`refreshtoken ${userid}`, refreshtoken);
}

const setCookies = (res, accesstoken, refreshtoken) => {
    res.cookie("accesstoken", accesstoken, {
        httpOnly: true,
        secure: process.env.Node_env === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    });
    res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        secure: process.env.Node_env === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashpassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashpassword });

        const { accesstoken, refreshtoken } = generatetoken(user._id);
        setCookies(res, accesstoken, refreshtoken);
        await storetoken(user._id, refreshtoken);

        res.status(200).json({
            message: "User created successfully",
            user,
            accesstoken,
            refreshtoken
        });
    } catch (error) {
        res.status(500).json({
            message: "Error while registering",
            error
        });
    }
};

export const GetUser = async (req, res) => {
    try {
        const detail = await User.find();
        res.status(200).json({
            message: "User details",
            detail
        });
    } catch (error) {
        res.status(500).json({
            message: "Error getting user details",
            error
        });
    }
};

export const UpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateinfo = req.body;
        const updatedetail = await User.findByIdAndUpdate(id, updateinfo);
        res.status(200).json({
            message: "User details updated successfully",
            updatedetail
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating user details",
            error
        });
    }
};

export const DeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteuser = await User.findByIdAndDelete(id);
        res.status(200).json({
            message: "User deleted successfully",
            deleteuser
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting user",
            error
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExist = await User.findOne({ email });

        if (!userExist) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const { accesstoken, refreshtoken } = generatetoken(userExist._id);
        setCookies(res, accesstoken, refreshtoken);
        await storetoken(userExist._id, refreshtoken);

        res.status(200).json({
            message: "User logged in successfully",
            user: userExist,
            accesstoken,
            refreshtoken
        });
    } catch (error) {
        res.status(401).json({
            message: "Error logging in user",
            error
        });
    }
};

export const Logout = async (req, res) => {
    try {
        const refreshtoken = req.cookies.refreshtoken;
        if (!refreshtoken) {
            return res.status(400).json({ message: "No refresh token found" });
        }

        // Try decoding the refresh token
        try {
            const decode = jwt.verify(refreshtoken, process.env.secretkey1);

            console.log("Decoded token:", decode);

            // Optionally, verify if the user exists using decode.userid
            const user = await User.findById(decode.userid);
            if (!user) {
                return res.status(400).json({ message: "Invalid refresh token, user not found" });
            }

            console.log("User found:", user);

            // Clear the stored refresh token in Redis
            await redis.del(`refreshtoken ${decode.userid}`);

            // Clear cookies
            res.clearCookie("accesstoken");
            res.clearCookie("refreshtoken");

            return res.status(200).json({ message: "Logged out successfully" });
        } catch (err) {
            console.log("Token verification error:", err);
            return res.status(400).json({ message: "Invalid refresh token", error: err });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error logging out", error });
    }
};

export const refreshtoken = async (req, res) => {
    try {
        const refreshtoken = req.cookies.refreshtoken;
        if (!refreshtoken) {
            return res.status(400).json({ message: "No refresh token found" });
        }

        const decode = jwt.verify(refreshtoken, process.env.secretkey1);
        if (!decode) {
            return res.status(400).json({ message: "Invalid refresh token" });
        }

        const storedToken = await redis.get(`refreshtoken ${decode.userid}`);
        if (storedToken !== refreshtoken) {
            return res.status(403).json({ message: "Invalid refresh token, no match in Redis" });
        }

        // Generate a new access token
        const { accesstoken } = generatetoken(decode.userid);
        res.cookie("accesstoken", accesstoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({ message: "Access token refreshed successfully", accesstoken });
    } catch (error) {
        return res.status(500).json({ message: "Error refreshing access token", error });
    }
};
