import jwt from "jsonwebtoken";

const token = jwt.sign({ userId: 1, role: "admin" }, "my-secret-key");

console.log("TOKEN:", token);
