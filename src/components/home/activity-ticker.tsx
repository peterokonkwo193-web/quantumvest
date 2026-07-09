"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";

const ACTIVITIES = [
  { name: "James K.",     country: "United States",   flag: "🇺🇸", amount: 850  },
  { name: "Sarah M.",     country: "United Kingdom",  flag: "🇬🇧", amount: 1200 },
  { name: "Mohammed A.",  country: "UAE",              flag: "🇦🇪", amount: 3000 },
  { name: "Chidi O.",     country: "Nigeria",          flag: "🇳🇬", amount: 500  },
  { name: "Priya S.",     country: "India",            flag: "🇮🇳", amount: 750  },
  { name: "Lucas B.",     country: "Brazil",           flag: "🇧🇷", amount: 920  },
  { name: "Amara D.",     country: "Ghana",            flag: "🇬🇭", amount: 400  },
  { name: "Oliver T.",    country: "Australia",        flag: "🇦🇺", amount: 1500 },
  { name: "Fatima A.",    country: "Saudi Arabia",     flag: "🇸🇦", amount: 2500 },
  { name: "David N.",     country: "South Africa",     flag: "🇿🇦", amount: 650  },
  { name: "Wei C.",       country: "Singapore",        flag: "🇸🇬", amount: 1800 },
  { name: "Emma R.",      country: "Canada",           flag: "🇨🇦", amount: 1100 },
  { name: "Kwame A.",     country: "Ghana",            flag: "🇬🇭", amount: 300  },
  { name: "Anna K.",      country: "Germany",          flag: "🇩🇪", amount: 2000 },
  { name: "Sipho Z.",     country: "South Africa",     flag: "🇿🇦", amount: 450  },
  { name: "Marie P.",     country: "France",           flag: "🇫🇷", amount: 1350 },
  { name: "Rahul V.",     country: "India",            flag: "🇮🇳", amount: 600  },
  { name: "Ngozi E.",     country: "Nigeria",          flag: "🇳🇬", amount: 800  },
  { name: "Harry S.",     country: "United Kingdom",   flag: "🇬🇧", amount: 970  },
  { name: "Aisha M.",     country: "UAE",              flag: "🇦🇪", amount: 4000 },
  { name: "Pedro L.",     country: "Brazil",           flag: "🇧🇷", amount: 550  },
  { name: "Sofia B.",     country: "Spain",            flag: "🇪🇸", amount: 1250 },
  { name: "Michael J.",   country: "United States",    flag: "🇺🇸", amount: 2200 },
  { name: "Zanele M.",    country: "South Africa",     flag: "🇿🇦", amount: 380  },
  { name: "Omar F.",      country: "Egypt",            flag: "🇪🇬", amount: 700  },
  { name: "Charlotte W.", country: "Australia",        flag: "🇦🇺", amount: 1600 },
  { name: "Kofi A.",      country: "Ghana",            flag: "🇬🇭", amount: 250  },
  { name: "Mei L.",       country: "Singapore",        flag: "🇸🇬", amount: 2100 },
  { name: "Emeka U.",     country: "Nigeria",          flag: "🇳🇬", amount: 950  },
  { name: "Noah P.",      country: "Canada",           flag: "🇨🇦", amount: 1400 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function timeAgo() {
  const options = ["just now", "1 min ago", "2 min ago", "3 min ago", "5 min ago", "7 min ago"];
  return options[Math.floor(Math.random() * options.length)];
}

export function ActivityTicker() {
  const pathname = usePathname();
  const [visible, setVisible]   = useState(false);
  const [show, setShow]         = useState(false);
  const [index, setIndex]       = useState(0);
  const [items]                 = useState(() => shuffle(ACTIVITIES));
  const [time, setTime]         = useState("just now");

  // Hide on dashboard / admin / auth pages
  const isApp = pathname.startsWith("/dashboard") ||
                pathname.startsWith("/admin")     ||
                pathname === "/login"              ||
                pathname === "/signup";

  useEffect(() => {
    if (isApp) return;

    // Initial delay before first popup
    const init = setTimeout(() => {
      setTime(timeAgo());
      setVisible(true);
      setShow(true);
    }, 4000);

    return () => clearTimeout(init);
  }, [isApp]);

  useEffect(() => {
    if (!visible) return;

    // Show for 5s, hide for 3s, then next
    const hideTimer = setTimeout(() => setShow(false), 5000);
    const nextTimer = setTimeout(() => {
      setIndex((i) => (i + 1) % items.length);
      setTime(timeAgo());
      setShow(true);
    }, 8000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [visible, index, items.length]);

  if (isApp) return null;

  const item = items[index];

  return (
    <div
      className="fixed bottom-6 left-4 z-50 transition-all duration-500"
      style={{
        transform: show ? "translateY(0)" : "translateY(120%)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/90 px-4 py-3 shadow-2xl backdrop-blur-xl max-w-[280px]">
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neon/10">
          <TrendingUp className="h-4 w-4 text-neon" />
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white leading-snug">
            {item.flag} {item.name}{" "}
            <span className="text-neon">
              earned ${item.amount.toLocaleString()}
            </span>
          </p>
          <p className="text-[11px] text-white/40 mt-0.5">
            {item.country} · {time}
          </p>
        </div>
      </div>
    </div>
  );
}
