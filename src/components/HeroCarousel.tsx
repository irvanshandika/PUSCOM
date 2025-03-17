import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/src/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/src/components/ui/carousel";
import Image from "next/image";

const imageUrls = [
  "https://res.cloudinary.com/dszhlpm81/image/upload/v1742194469/assets/puscom/d070075c1d5b8d094d43a36ea431d44c_qwxshb.webp",
  "https://res.cloudinary.com/dszhlpm81/image/upload/v1742194469/assets/puscom/56789cec8a420e48c8203cc2d13c2027_f5mzgq.webp",
  "https://res.cloudinary.com/dszhlpm81/image/upload/v1742194469/assets/puscom/204e905bfc7f55c45f3a0eeddc2431c9_uegsju.webp",
  "https://res.cloudinary.com/dszhlpm81/image/upload/v1742194469/assets/puscom/89ad1f413de58358e757b6da8444709f_so0czl.webp",
  "https://res.cloudinary.com/dszhlpm81/image/upload/v1742194469/assets/puscom/f418da4ac21b933722ea0a9738447461_ttzd75.webp",
];

export default function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <Carousel 
      plugins={[plugin.current]} 
      className="w-[280px] sm:w-[330px] md:w-[380px] lg:w-[420px]"
      onMouseEnter={plugin.current.stop} 
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {imageUrls.map((url, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="border-none bg-transparent">
                <CardContent className="relative aspect-square p-0">
                  <Image 
                    src={url} 
                    alt={`Image ${index + 1}`} 
                    fill 
                    className="object-cover rounded-xl" 
                    priority 
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 330px, (max-width: 1024px) 380px, 420px"
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}