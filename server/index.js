

// const express = require("express");
// const cors = require("cors");
// const app = express();
// const http = require("http");
// const WebSocket = require("ws");

// //미들웨어는 라우터 위로
// app.use(cors());
// app.use(express.json());

// const server = http.createServer(app);


// const reservations = new Map();

// app.post("/api/reservations", (req, res) => {
//     const { userId, date } = req.body;

//     if (reservations.has(date)) {
//         return res.status(409).json({ error: "이미 예약된 날짜입니다." });
//     }

//     const reservation = {
//         id: crypto.randomUUID(),
//         userId,
//         date,
//         status: "reserved",
//     };

//     reservations.set(date, reservation);
//     res.status(201).json(reservation);
// })



// //listen은 항상 마지막
// app.listen(4000, () => {
//     console.log("서버 실행 중!");
// });

const express = require("express");

const app = express();
app.use(express.json());

const reservations = new Map();

//예약 생성
app.post("/api/create/reservation", (req, res) => {
    const { userId, date, time } = req.body; //구조분해할당

    //중복체크
    if (reservations.has(`${date}-${time}`)) {
        return res.status(409).json({ error: "이미 예약되었습니다." });
    };

    const reservation = {
        id: crypto.randomUUID(),
        userId,
        date,
        time,
        status: "reserved",
    };

    reservations.set(`${date}-${time}`, reservation);
    return res.status(201).json("예약완료");
})

//예약 조회
app.get("/api/reservations", (req, res) => {
    return res.json([...reservations.values()])
});

app.listen(4000, () =>
    console.log("서버 구동")
);