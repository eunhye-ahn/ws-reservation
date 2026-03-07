import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useEffect, useState } from 'react';
import React from 'react';
import dayjs from 'dayjs';

const localizer = momentLocalizer(moment);


function App() {

  // const [events, setEvents] = useState([]);
  const [reservedDates, setReservedDates] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/reservations/reserved-dates')
      .then(res => res.json())
      .then(data => {
        setReservedDates(data.reservedDates.map(date => dayjs(date).format("YYYY-MM-DD")));
        // const converted = data.reservedDates.map(item => ({
        //   start: new Date(item),
        //   end: new Date(item)
        // }));
        // setEvents(converted);
      })
  }, [])

  const dayPropGetter = (date) => {
    const isReserved = reservedDates.includes(dayjs(date).format("YYYY-MM-DD"));
    if (isReserved) {
      return {
        style: {
          backgroundColor: "gray",
          cursor: "not-allowed"
        }
      }
    }
  }


  //event 상태로 관리
  //예약 조회 api fetch > 데이터 > event 객체로 생성 > set

  return (
    <div >
      <Calendar
        localizer={localizer}
        events={[]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}

        dayPropGetter={dayPropGetter}
      />
    </div>
  );
}

export default App;
