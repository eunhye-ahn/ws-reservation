import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { isCursorAtEnd } from "@testing-library/user-event/dist/utils";

const ALL_TIMES = ["10:00:00", "11:00:00", "12:00:00"];

const ReservationModal = ({ date, onClose }) => {
    const [reservedTimes, setReservedTimes] = useState([]);
    const [seletedTime, setSeletedTime] = useState(null);

    const fetchReservedTimes = async (date) => {
        try {
            const selectedDate = dayjs(date).format("YYYY-MM-DD")
            const res = await fetch(`http://localhost:4000/api/reservations/reserved-times?date=${selectedDate}`);
            const data = await res.json();
            setReservedTimes(data.reservedTimes);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchReservedTimes(date)
        setSeletedTime(null)
    }, [date]);

    //예약생성
    const fetchCreateReservation = async (time) => {
        const res = await fetch("http://localhost:4000/api/reservations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_at: `${dayjs(date).format("YYYY-MM-DD")} ${time}` })
        });
        const data = await res.json();

    }

    const handleTimeClick = async (time) => {
        try {
            await fetchCreateReservation(time);
            setSeletedTime(time)
            onClose()
        } catch (err) {
            console.error(err)
        }
    }


    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                top: 0, left: 0,
                width: "100%", height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white",
                    borderRadius: "8px",
                    padding: "40px",
                    width: "30%",
                    position: "relative",
                    overflowY: "auto"
                }}>
                <button onClick={onClose} style={{
                    position: "absolute",
                    top: "10px", right: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                }}>X</button>
                <div style={{
                    fontSize: "30px",
                    fontWeight: "bold"
                }}>{dayjs(date).format("YYYY-MM-DD")}</div>
                <hr style={{ margin: "15px 0" }} />
                <div>
                    <div style={{
                        fontSize: "20px",
                        fontWeight: "bold"
                    }}>
                        예약 가능한 시간
                    </div>
                    <div style={{
                        display: "flex",
                    }}>
                        {ALL_TIMES.map((time) => {
                            const isReserved = reservedTimes.includes(time)
                            return (
                                <div key={time}
                                    onClick={() => setSeletedTime(time)}

                                    style={{
                                        padding: "10px 20px",
                                        margin: "10px 5px",
                                        border: isReserved ? "1px solid rgba(0,0,0,0.2)" : "1px solid black",
                                        color: isReserved ? "rgba(0,0,0,0.2)" : "black",
                                        borderRadius: "8px",
                                        backgroundColor: "transparent",
                                        cursor: isReserved ? "not-allowed" : "pointer",
                                        pointerEvents: isReserved ? "none" : "auto"
                                    }}>
                                    {time.slice(0, 5)}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "center"
                }}>

                    <button
                        onClick={() => handleTimeClick(seletedTime)}
                        disabled={!seletedTime}
                        style={{
                            backgroundColor: 'transparent',
                            borderRadius: "8px",
                            border: !seletedTime ? "solid rgba(0,0,0,0.2) 1px" : "solid black 1px",
                            margin: "15px 0",
                            padding: "5px 30px",
                            width: "80%"
                        }}
                    >
                        예약하기
                    </button>
                </div>



            </div>
        </div >
    )
}


export default ReservationModal;