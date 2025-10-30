import mysql from "mysql2";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fs from 'fs';

const api = [
    {
        url: "register",
        func: register
    },
    {
        url: "login",
        func: login
    }
];

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "qwerty12",
    database: "exam_hop"
});

db.connect((err) => {
    if (err) {
        console.error("db connection failed:", err);
        return;
    }
    console.log("connected to db");
});

const usernameAllowedChar = "abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?`~";

const tokenSecret = fs.readFileSync("./secret.txt");

const jsonContentType = {"Content-Type": "application/json"};

function isUserCorrect(username) {
    return new Promise((resolve, reject) => {
        for (const element of username) {
            if (!usernameAllowedChar.includes(element)) {
                resolve(false);
                return;
            }
        }

        if (username.length < 3 || username.length > 20) {
            resolve(false);
            return;
        }

        db.query("SELECT COUNT(*) AS count FROM users WHERE user = ?", [username], (err, results) => {
            if (err) {
                console.error("Error checking username:", err);
                resolve(false);
                return;
            }

            if (results[0].count > 0) resolve(false);
            else resolve(true);
        });
    });
}


async function register(req, res) {
    let body = "";

    req.on("data", chunk => {
        body += chunk
    });

    req.on("end", async () => {
        console.log("reg_req");
        console.log("Raw body received:", body);
        try {
            const data = JSON.parse(body);
            const { first_name, last_name, user, email, birthday_d, birthday_m, birthday_y, password } = data;

            if (!first_name || !last_name || !user || !birthday_d || !birthday_m || !birthday_y || !password) {
                res.writeHead(400, jsonContentType);
                res.end(JSON.stringify({ error: "Missing data!" }));
                return;
            }


            if (!await isUserCorrect(user)) {
                res.writeHead(400, jsonContentType);
                res.end(JSON.stringify({ error: "Invalid username or already taken" }));
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

function evalReq(req, res) {
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

export { evalReq }
