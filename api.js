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
    },
    {
        url: "profile",
        func: profile
    },
    {
        url: "account_delete",
        func: account_delete
    }
];

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: fs.readFileSync("./db_pass.txt"),
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

const passwordAllowedChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?`~";

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

        resolve(true);
    });
}

function isUserTaken(username) {
    return new Promise((resolve, reject) => {
        db.query("SELECT COUNT(*) AS count FROM users WHERE user = ?", [username], (err, results) => {
            if (err) {
                console.error("Error checking username:", err);
                resolve(false);
                return;
            }

            if (results[0].count > 0)
                resolve(false);
            else
                resolve(true);
        });
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(pass) {
    if (pass.length < 8)
        return false;

    const numbers = "1234567890";
    const lettersLowercase = "abcdefghijklmnopqrstuvwxyz";
    const lettersUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let numLettersLow = 0;
    let numLettersUp = 0;
    let numNum = 0;
    let numSpecialChar = 0;

    for (const char of pass) {
        if (!passwordAllowedChar.includes(char))
            return false;

        if (numbers.includes(char)) {
            numNum++;
        }
        else if (lettersLowercase.includes(char)) {
            numLettersLow++;
        }
        else if (lettersUppercase.includes(char)) {
            numLettersUp++;
        }
        else {
            numSpecialChar++;
        }
    }

    return (numNum && numLettersLow && numLettersUp && numSpecialChar);
}

async function account_delete(req, res) {
    let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", async () => {
        try {
            const { user, password } = JSON.parse(body);

            const hash = crypto.createHash('sha256').update(password).digest('hex');

            const searchQuery = `
                SELECT * FROM users WHERE user = ? AND hash = ?
            `;

            db.query(searchQuery, [user, hash], (err, result) => {
                if (err) {
                    res.writeHead(500, jsonContentType);
                    res.end(JSON.stringify({error: "Database error"}));
                    return;
                }

                const deleteQuery = `
                    DELETE FROM users WHERE id = ?
                `;

                db.query(deleteQuery, [result[0].id], error => {
                    if (error) {
                        res.writeHead(500, jsonContentType);
                        res.end(JSON.stringify({error: "Database error"}));
                        return;
                    }
                });
            });

            res.writeHead(200, jsonContentType);
            res.end(JSON.stringify({message: "Account deleted!"}));
        }
        catch(err) {
            console.log("Error parsing JSON: ", err);
            res.writeHead(400, jsonContentType);
            res.end(JSON.stringify({error: "Invalid JSON!"}));
        }
    });
}

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
