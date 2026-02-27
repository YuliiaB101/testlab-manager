import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const hashPassword = async (password) => bcrypt.hash(password, 10);
export const verifyPassword = async (password, hash) => bcrypt.compare(password, hash);
export const signToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
export const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing token" });
    }
    const token = header.replace("Bearer ", "");
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid token" });
    }
};
