"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function WaBanner() {
  const [message, setMessage] = useState("");

  const handleSendWa = () => {
    if (!message.trim()) return;
    // Nomor WA Admin
    const phone = "6282292229500";
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-sky-100">
          <div className="px-6 py-14 text-center sm:px-12 sm:py-20">
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl lg:text-4xl">
              Punya Pertanyaan Seputar 22Mart?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Jangan ragu untuk bertanya! Ketik pertanyaan Anda di bawah ini dan Admin kami akan segera membantu Anda melalui WhatsApp.
            </p>
            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketik pertanyaan Anda di sini..."
                className="h-12 flex-1 rounded-full border-0 bg-white px-5 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                onKeyDown={(e) => e.key === 'Enter' && handleSendWa()}
              />
              <Button 
                size="lg" 
                onClick={handleSendWa}
                className="h-12 rounded-full bg-primary px-8 font-semibold text-primary-foreground hover:brightness-95"
              >
                Kirim ke WA
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
