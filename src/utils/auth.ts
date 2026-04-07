import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "my-secret-key";

export function signToken(
  payload: string | object | Buffer,
  options: SignOptions = { expiresIn: "1h" }
) {
  return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as string | JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
