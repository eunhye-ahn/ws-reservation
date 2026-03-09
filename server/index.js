const express = require("express");
const cors = require("cors");
const dayjs = require("dayjs");
const db = require("./db");
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
})
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000"
}));


io.on('connection', (socket) => {
    //캘린더구독 신청 > reservation 방 입장시킴
    socket.on('subscribe:calendar', () => {
        socket.join('reservation')
    })

    //모달구독 신청
    socket.on('subscribe:date', (date) => {
        socket.join(`reservation:${date}`)
    })

})



const getFullDates = (callback) => {
    db.query(
        "SELECT DATE(start_at) as reservedDates FROM reservations GROUP BY DATE(start_at) HAVING COUNT(*)=3",
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: "서버 오류" });
            }
            const fullDates = result.map(item => dayjs(item.reservedDates).format("YYYY-MM-DD"));
            callback(fullDates);
        }
    )
}

//예약된날짜조회
app.get("/api/reservations/reserved-dates", (req, res) => {
    getFullDates((fullDates) => {
        res.status(200).json({ reservedDates: fullDates })
    })
});

//예약된시간조회
app.get("/api/reservations/reserved-times", (req, res) => {
    const { date } = req.query;
    db.query(
        "SELECT TIME(start_at) as reservedTimes FROM reservations WHERE DATE(start_at) = ?",
        [date],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: "서버 오류" });
            }
            return res.status(200).json({ reservedTimes: result.map(item => item.reservedTimes) });
        }



    )
})


//예약 생성
app.post("/api/reservations", (req, res) => {
    const { start_at } = req.body; //구조분해할당
    const end_at = dayjs(start_at).add(1, "hour").format("YYYY-MM-DD HH:mm:ss");


    if (!start_at) {
        return res.status(400).json({ error: "start_at 없음" })
    }

    //중복체크
    db.query(
        "SELECT * FROM reservations WHERE start_at = ?",
        [start_at],
        (err, result) => {
            //쿼리 에러 -> 전역핸들러로 변경예정
            if (err) {
                return res.status(500).json({ error: "서버 오류" });
            }

            // 중복체크
            if (result.length > 0) {
                return res.status(409).json({ error: "이미 예약됨" });
            }


            db.query(
                "INSERT INTO reservations (start_at, end_at, status) VALUES (?, ?, ?)",
                [start_at, end_at, "reserved"],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: "서버오류" });
                    }
                    const date = dayjs(start_at).format("YYYY-MM-DD");
                    const time = dayjs(start_at).format("HH:mm:ss");
                    getFullDates((fullDates) => {
                        const isFull = fullDates.includes(date);
                        io.to('reservation').emit('update:calendar', { date, isFull });
                    })
                    // reservation 방 유저들에게 브로드캐스트

                    io.to(`reservation:${date}`).emit('update:time', { time });
                    return res.status(201).json({ message: "예약완료" });
                })


        }
    )

})


//전체 예약 조회
app.get("/api/reservations", (req, res) => {
    return res.json([...reservations.values()])
});


httpServer.listen(4000, () =>
    console.log("서버 구동")
);