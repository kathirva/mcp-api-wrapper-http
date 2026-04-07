import jwt, { type SignOptions } from "jsonwebtoken";
export declare function signToken(payload: string | object | Buffer, options?: SignOptions): string;
export declare function verifyToken(token: string): string | jwt.JwtPayload;
//# sourceMappingURL=auth.d.ts.map