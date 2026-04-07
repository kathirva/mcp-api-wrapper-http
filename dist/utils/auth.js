import jwt, {} from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET ?? "my-secret-key";
export function signToken(payload, options = { expiresIn: "1h" }) {
    return jwt.sign(payload, SECRET, options);
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET);
    }
    catch (error) {
        throw new Error("Invalid or expired token");
    }
}
//# sourceMappingURL=auth.js.map