const api = [
    {
        url: "sayHello",
        func: sayHello
    }
];

const jsonContentType = {"Content-Type": "aplication/json"};

function sayHello(res, req) {
    console.log("Hello World!");

    res.writeHead(200, jsonContentType);
    res.end('{"message": "Hello World!"}');
}

function evalReq(res, req) {
    const route = req.url.split('/')[2];
    for (let i = 0; i < api.length; i++) {
        if (api[i].url === route) {
            api[i].func(res, req);
            return;
        }
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("API route not found");
}

export { evalReq }
