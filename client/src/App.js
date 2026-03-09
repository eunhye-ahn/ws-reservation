import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ReservationModal from './component/ReservationModal';
import { useSocket } from './hooks/useSocket';


const localizer = momentLocalizer(moment);

function App() {

  const [reservedDates, setReservedDates] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const socketRef = useSocket();

  useEffect(() => {
    socketRef.current.emit('subscribe:calendar')
    socketRef.current.on('update:calendar', (data) => {
      console.log(data);
      if (data.isFull) setReservedDates(prev => [...prev, data.date]);
    })

    const fetchReservedDates = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/reservations/reserved-dates');
        const data = await res.json();
        setReservedDates(data.reservedDates);
      } catch (err) {
        console.log(err);
      }
    }
    fetchReservedDates();
  }, []);

  //예약마감된 날짜 표시
  const dayPropGetter = (date) => {
    const isReserved = reservedDates.includes(dayjs(date).format("YYYY-MM-DD"));
    if (isReserved) {
      return {
        style: {
          backgroundColor: "gray",
          cursor: "not-allowed",
        }
      }
    }
  }


  const handleDateClick = ({ start }) => {
    setSelectedDate(start)
    if (reservedDates.includes(dayjs(start).format("YYYY-MM-DD"))) return;
    setIsOpen(true)
  }


  return (
    <div >
      <Calendar
        localizer={localizer}
        events={[]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}

        dayPropGetter={dayPropGetter}

        selectable
        onSelectSlot={handleDateClick}
      />
      {isOpen && <ReservationModal date={selectedDate} onClose={() => setIsOpen(false)} />}
    </div>
  );
}

export default App;


