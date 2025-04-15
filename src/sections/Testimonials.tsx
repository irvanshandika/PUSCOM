'use client'
import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/src/components/ui/carousel";
import { Card, CardContent } from "@/src/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import Autoplay from 'embla-carousel-autoplay';

// Testimonial data
const testimonialData = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Small Business Owner",
    quote: "The team at Pusat Komputer provided exceptional service! They helped me set up my entire office network and have been available whenever I needed support.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 2,
    name: "Ahmad Rahman",
    role: "Graphic Designer",
    quote: "I've been buying all my tech gear from Pusat Komputer for years. Their prices are competitive and the product quality is always top-notch.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/54.jpg",
  },
  {
    id: 3,
    name: "Lisa Chen",
    role: "University Student",
    quote: "When my laptop crashed right before finals, Pusat Komputer saved me! They recovered all my data and fixed the issue within 24 hours.",
    rating: 4,
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    id: 4,
    name: "Budi Santoso",
    role: "IT Manager",
    quote: "As someone who manages IT for a medium-sized company, I rely on Pusat Komputer for bulk orders. Their business support is truly reliable.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 5,
    name: "Maya Wijaya",
    role: "Content Creator",
    quote: "The custom PC they built for me handles video editing like a dream. The staff really understood my needs and delivered beyond expectations.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/32.jpg",
  },
];

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-[hsl(var(--puscom))]">Customers</span> Say
          </h2>
          <p className="text-lg text-foreground/70">
            Hear from our satisfied customers about their experiences with our products and services.
          </p>
        </div>

        <Carousel 
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonialData.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 basis-full sm:basis-2/3 md:basis-1/2 lg:basis-1/3">
                <div className="h-full">
                  <Card className="h-full border-none shadow-md bg-white/70 dark:bg-black/30 backdrop-blur-lg border border-white/20 dark:border-white/10">
                    <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                      <div className="mb-4">
                        <RatingStars rating={testimonial.rating} />
                      </div>
                      <blockquote className="flex-grow italic mb-6 text-base sm:text-lg">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>
                      <div className="flex items-center gap-3 mt-auto">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[hsl(var(--puscom))]"
                          width={48}
                          height={48}
                        />
                        <div>
                          <h4 className="font-semibold text-sm sm:text-base">{testimonial.name}</h4>
                          <p className="text-xs sm:text-sm text-foreground/70">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Removed CarouselPrevious and CarouselNext buttons for a cleaner mobile look */}
        </Carousel>

        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default Testimonials;