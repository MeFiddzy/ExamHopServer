
import { db } from "../db";
import { Router } from "express";

const router = Router();

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


async function register(req, res) {
    let body = "";

    req.on("data", chunk => {
        body += chunk
    });

    req.on("end", async () => {
        console.log("Raw body received:", body);
        try {
            const data = JSON.parse(body);
            const { first_name, last_name, user, email, birthday_d, birthday_m, birthday_y, password } = data;

            if (!first_name || !last_name || !user || !birthday_d || !birthday_m || !birthday_y || !password) {
                res.writeHead(400, jsonContentType);
                res.end(JSON.stringify({ error: "Missing data!" }));
                return;
            }


            if (!isValidEmail(email)) {
                res.writeHead(400, jsonContentType);
                res.end(JSON.stringify({error: "Invalid email!"}));
                return;
            }

            if (!isValidPassword(password)) {
                res.writeHead(400, jsonContentType);
                res.end(JSON.stringify({error: "Invalid password!"}))
                return;
            }

            if (!await isUserCorrect(user)) {
                res.writeHead(400, jsonContentType);
                res.end(JSON.stringify({ error: "Invalid username" }));
                return;
            }


            if (!await isUserTaken(user)) {
                res.writeHead(400, jsonContentType);
                res.end(JSON.stringify({ error: "Username taken" }));
                return;
            }

            const hash = crypto.createHash("sha256").update(password).digest("hex");

            const insertQuery = `
                INSERT INTO users (first_name, last_name, user, email, birthday_d, birthday_m, birthday_y, hash) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(insertQuery, [first_name, last_name, user, email, birthday_d, birthday_m, birthday_y, hash], (err, result) => {
                if (err) {
                    console.error("Insert error:", err);
                    res.writeHead(500, jsonContentType);
                    res.end(JSON.stringify({ error: "Database error" }));
                    return;
                }

                res.writeHead(200, jsonContentType);
                res.end(JSON.stringify({ message: "User registered successfully!", user_id: result.insertId }));
            });

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

function evalReq(req : Request, res : Response) {
    const route = req.url.split('/')[2];
    for (let i = 0; i < api.length; i++) {
        if (api[i].url === route) {
            api[i].func(req, res);
            return;
        }
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("API route not found");
}

export default router;