"use client";
import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface AutoSliderProps {
  items: React.ReactNode[];
  autoPlayInterval?: number;
  className?: string;
  slideClassName?: string;
}

export default function AutoSlider({ items, autoPlayInterval = 5000, className, slideClassName }: AutoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const resetAutoPlayTimer = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }

    if (isAutoPlaying) {
      autoPlayTimerRef.current = setTimeout(() => {
        nextSlide();
      }, autoPlayInterval);
    }
  }, [isAutoPlaying, nextSlide, autoPlayInterval]);

  // Handle auto play
  useEffect(() => {
    resetAutoPlayTimer();

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, resetAutoPlayTimer]);

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div className={cn("relative overflow-hidden w-full", className)} onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)} ref={sliderRef}>
      <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {items.map((item, index) => (
          <div key={index} className={cn("flex-shrink-0 w-full", slideClassName)}>
            {item}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 dark:bg-background/50 text-foreground p-2 rounded-full shadow-md hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
          setIsAutoPlaying(false);
          setTimeout(() => setIsAutoPlaying(true), 10000);
        }}
        aria-label="Previous slide">
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 dark:bg-background/50 text-foreground p-2 rounded-full shadow-md hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
          setIsAutoPlaying(false);
          setTimeout(() => setIsAutoPlaying(true), 10000);
        }}
        aria-label="Next slide">
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={cn("w-2.5 h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary", currentIndex === index ? "bg-primary w-6" : "bg-primary/30 hover:bg-primary/50")}
            onClick={() => {
              goToSlide(index);
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
