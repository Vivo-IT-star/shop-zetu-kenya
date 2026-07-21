import { useState, useEffect } from "react";
import { Zap, Star } from "lucide-react";
import { cn } from "../lib/utils";

const BlackNovemberCountdownPage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Black November starts November 1st, 2025 at midnight EAT (UTC+3)
  const targetDate = new Date("2025-11-01T00:00:00+03:00");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="relative group">
      <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse" />
      <div className="relative bg-linear-to-br from-card to-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 md:p-8 shadow-2xl transform group-hover:scale-105 transition-all duration-300">
        <div className="text-4xl md:text-6xl lg:text-7xl font-bold bg-linear-to-br from-primary via-accent to-warning bg-clip-text text-transparent animate-fade-in font-mono">
          {value.toString().padStart(2, "0")}
        </div>
        <div className="text-xs md:text-sm uppercase tracking-wider mt-2 font-semibold">
          {label}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden bg-linear-to-br from-background via-background to-primary/5 py-12 md:py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "absolute text-primary/20 animate-pulse",
              i % 2 === 0 ? "w-4 h-4" : "w-3 h-3"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
            fill="currentColor"
          />
        ))}
      </div>

      <div className="px-4 relative z-10 flex flex-col items-center justify-center text-center">
  {/* Header */}
  <div className="mb-8 md:mb-12 space-y-4 animate-fade-in">
    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-2 backdrop-blur-sm">
      <Zap className="w-5 h-5 text-primary animate-pulse" fill="currentColor" />
      <span className="text-sm font-semibold text-primary uppercase tracking-wide">
        Coming Soon
      </span>
    </div>

    <div className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
      <span className="bg-primary bg-clip-text text-transparent">
        Countdown to
      </span>
      <br />
      <span className="bg-linear-to-r from-primary via-accent to-accent bg-clip-text text-transparent animate-fade-in">
        Black November!
      </span>
    </div>

    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
      The biggest shopping event of the year. Unmissable deals await!
    </p>
  </div>

  {/* Countdown Grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
    <TimeUnit value={timeLeft.days} label="Days" />
    <TimeUnit value={timeLeft.hours} label="Hours" />
    <TimeUnit value={timeLeft.minutes} label="Minutes" />
    <TimeUnit value={timeLeft.seconds} label="Seconds" />
  </div>

  {/* Call to action */}
  <div className="text-center mt-8 md:mt-12 animate-fade-in">
    <div className="inline-flex items-center gap-2 text-sm md:text-base text-muted-foreground">
      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
      <span>Get ready for exclusive deals and mega discounts</span>
    </div>
  </div>
</div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default BlackNovemberCountdownPage;
