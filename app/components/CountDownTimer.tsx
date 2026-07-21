import { useEffect, useState } from "react";

const BLACK_NOVEMBER_START = new Date("2025-11-01T00:00:00+03:00"); // EAT
const BLACK_NOVEMBER_END = new Date("2025-11-30T23:59:59+03:00"); // EAT

function getTimeRemaining(target: Date) {
  const now = new Date();
  const total = target.getTime() - now.getTime();

  const seconds = Math.max(Math.floor((total / 1000) % 60), 0);
  const minutes = Math.max(Math.floor((total / 1000 / 60) % 60), 0);
  const hours = Math.max(Math.floor((total / (1000 * 60 * 60)) % 24), 0);
  const days = Math.max(Math.floor(total / (1000 * 60 * 60 * 24)), 0);

  return { total, days, hours, minutes, seconds };
}

export default function BlackNovemberTimer() {
  const [time, setTime] = useState(getTimeRemaining(BLACK_NOVEMBER_START));
  const isLive = new Date() >= BLACK_NOVEMBER_START && new Date() <= BLACK_NOVEMBER_END;
  const isEnded = new Date() > BLACK_NOVEMBER_END;

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        getTimeRemaining(isLive ? BLACK_NOVEMBER_END : BLACK_NOVEMBER_START)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  if (isEnded) {
    return (
      <div className="text-center bg-black text-white py-8">
        <h2 className="text-3xl font-bold">Black November Ended 🎉</h2>
      </div>
    );
  }

  return (
   <div className="md:w-full sticky top-0 z-40 flex flex-col md:flex-row items-center justify-center bg-[#111111] text-white py-2 text-center md:gap-12">
  {/* Heading */}
  <h2 className="text-xl text-lime-400 md:text-xl font-bold tracking-wider font-sans">
    {isLive ? "BLACK NOVEMBER IS LIVE 🔥" : "BLACK NOVEMBER - COMING SOON"}
  </h2>

  {/* Countdown */}
  <div className="flex justify-center gap-6">
    {[
      { label: "DAYS", value: time.days },
      { label: "HOURS", value: time.hours },
      { label: "MINUTES", value: time.minutes },
      { label: "SECONDS", value: time.seconds },
    ].map((item) => (
      <div
        key={item.label}
        className=" w-8 rounded-lg  flex flex-col items-center justify-center"
      >
        <div className="text-xl md:text-2xl font-bold tabular-nums">
          {String(item.value).padStart(2, "0")}
        </div>
        <div className="text-[10px] md:text-[10px]  text-lime-400">
          {item.label}
        </div>
      </div>
    ))}
  </div>
</div>

  );
}
