import { db } from "./config/db.ts";
import { Router } from "express";

const router = Router();
/**
async function profile(req, res) {
    let body = "";

    req.on("data", chunk => {
        body += chunk
    });

    req.on("end", async () => {
        console.log("Raw body received:", body);
        try {
            const data = JSON.parse(body);
            const { token } = data;

            if (!token) {
                res.writeHead(400, jsonContentType);
                res.end(JSON.stringify({ error: "Missing data!" }));
                return;
            }
        

            jwt.verify(token, tokenSecret, (err, decoded) => {
                if (err) {
                    res.writeHead(400, jsonContentType);
                    res.end(JSON.stringify({error: "Invalid token!"}));
                    return;
                }

                const getDataQuery = `
                    SELECT * FROM users WHERE id = ?
                `;

                console.log(decoded.user_id);

                db.query(getDataQuery, [decoded.user_id], (err, result) => {
                    if (err) {
                        res.writeHead(500, jsonContentType);
                        res.end(JSON.stringify({error: "Database error"}));
                        return;
                    }

                    console.log(result);

                    try {
                        res.writeHead(200, jsonContentType);
                        res.end(JSON.stringify({
                            profile: {
                                first_name: result[0].first_name,
                                last_name: result[0].last_name,
                                birthday_d: result[0].birthday_d,
                                birthday_m: result[0].birthday_m,
                                birthday_y: result[0].birthday_y,
                                email: result[0].email,
                                user: result[0].user
                            }
                        }));
                    }
                    catch (err) {
                        res.writeHead(400, jsonContentType);
                        res.end(JSON.stringify({ error: "User doesn't exist!" }))
                    }

                })
            })

        } catch (err) {
            console.error("JSON parse error:", err);
            res.writeHead(400, jsonContentType);
            res.end(JSON.stringify({ error: "Invalid JSON!" }));
        }
    });
}

async function login(req, res) {
    let body = "";

    req.on("data", chunk => {
        body += chunk
    });

    req.on("end", async () => {
        console.log("reg_req");
        console.log("Raw body received:", body);
        try {
            const data = JSON.parse(body);
            const { user, password } = data;

            if (!user || !password) {
                res.writeHead(400, jsonContentType);
                res.end(JSON.stringify({ error: "Missing data!" }));
                return;
            }

            const hash = crypto.createHash("sha256").update(password).digest("hex");

            const checkHash = `
                SELECT * FROM users WHERE hash = ? AND user = ?
            `;

            db.query(checkHash, [hash, user], (err, result) => {
                if (err) {
                    console.error("Insert error:", err);
                    res.writeHead(500, jsonContentType);
                    res.end(JSON.stringify({ error: "Database error" }));
                    return;
                }

                if (result.length === 0) {
                    res.writeHead(401, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Invalid username or password!" }));
                    return;
                }

                const token = jwt.sign(
                    {user_id: result[0].id, username: result[0].user, password: password},
                    tokenSecret
                )

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Login successful", token }));
            });

        } catch (err) {
            console.error("JSON parse error:", err);
            res.writeHead(400, jsonContentType);
            res.end(JSON.stringify({ error: "Invalid JSON!" }));
        }
    });
}
**/

export default router;