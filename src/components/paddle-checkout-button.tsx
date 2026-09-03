"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { Button } from "@/components/ui/button";

export function PaddleCheckoutButton({
  priceId,
  userId,
  email,
  children,
  activatingLabel,
  variant,
}: {
  priceId: string;
  userId: string;
  email: string;
  children: React.ReactNode;
  activatingLabel: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const paddleRef = useRef<Paddle | null>(null);
  const [ready, setReady] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;
    let cancelled = false;

    initializePaddle({
      token,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      eventCallback(event) {
        if (event.name === "checkout.completed") {
          setIsActivating(true);
          // El webhook de Paddle tarda unos segundos en llegar y actualizar el
          // plan en la base; refrescamos la página unas cuantas veces mientras tanto.
          let attempts = 0;
          const interval = setInterval(() => {
            attempts += 1;
            router.refresh();
            if (attempts >= 6) clearInterval(interval);
          }, 1500);
        }
      },
    }).then((instance) => {
      if (!cancelled && instance) {
        paddleRef.current = instance;
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  function openCheckout() {
    if (!paddleRef.current || !priceId) return;
    paddleRef.current.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email },
      customData: { userId },
    });
  }

  return (
    <Button onClick={openCheckout} disabled={!ready || isActivating || !priceId} variant={variant}>
      {isActivating ? activatingLabel : children}
    </Button>
  );
}
