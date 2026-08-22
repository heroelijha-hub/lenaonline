'use client';
import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!targetDate) return;
    
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isMounted) {
    // Avoid hydration mismatch
    return (
      <>
        <span>00 <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Days</span></span>
        <span className="text-gray-300">:</span>
        <span>00 <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Hrs</span></span>
        <span className="text-gray-300">:</span>
        <span>00 <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Mins</span></span>
        <span className="text-gray-300">:</span>
        <span>00 <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Secs</span></span>
      </>
    );
  }

  return (
    <>
      <span>{String(timeLeft.days).padStart(2, '0')} <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Days</span></span>
      <span className="text-gray-300">:</span>
      <span>{String(timeLeft.hours).padStart(2, '0')} <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Hrs</span></span>
      <span className="text-gray-300">:</span>
      <span>{String(timeLeft.minutes).padStart(2, '0')} <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Mins</span></span>
      <span className="text-gray-300">:</span>
      <span>{String(timeLeft.seconds).padStart(2, '0')} <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Secs</span></span>
    </>
  );
}
