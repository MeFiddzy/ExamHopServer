const mysql = require("mysql2");
const crypto = require("crypto");


const api = [
    {
        url: "register",
        func: register
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

const jsonContentType = {"Content-Type": "aplication/json"};

function isUserCorrect(username) {
    for (const element of username) {
        if (!usernameAllowedChar.contains(element)) {
            return 0;
        }
    }

    if (username.length < 3 || username.length < 20)
        return false;

    var count;
    db.query("SELECT COUNT(*) AS count FROM users WHERE user = ?", [username], (err, results) => {
        if (err) {
            console.error(`error while checking user count: ${err}`);
        }

        count = results[0].count;
    });

    if (count > 0)
        return false;

    return true;
}

function register(res, req) {
    let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", () => {
        try {
            const data = JSON.parse(body);
            const {
                first_name, 
                last_name, 
                user,
                email, 
                birthday_d, 
                birthday_m, 
                birthday_y, 
                password 
            } = data;

            if (!first_name || !last_name || !birthday_d || !birthday_m || !birthday_y || !hash) {
                res.writeHead(400, jsonContentType);
                res.end('{error: "Missing data!"}');
                return;
            }

            const insertQuery = `INSERT INTO users (first_name, last_name, user, email, birthday_d, birthday_m, birthday_y, hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

            if (!isUserCorrect(user))
                return;

            const hash = crypto.createHash("sha256").update(password).digest("hex");

            db.query(insertQuery, [first_name, last_name, user, email, birthday_d, birthday_m, birthday_y], (err, result) => {
                if (err) {
                    res.writeHead(500, jsonContentType);
                    res.end('{error: "Database error"}')
                }

                res.writeHead(200, jsonContentType);
                res.end(`{message: "User registered succesfully!", user_id: ${result.insertId}}`);
            });
        }
        catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(`{"error": "Invalid JSON!"}`);
        }
    });
}

function evalReq(res, req) {
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
