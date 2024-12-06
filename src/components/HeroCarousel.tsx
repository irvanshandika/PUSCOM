import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/src/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/src/components/ui/carousel";
import Image from "next/image";

const imageUrls = [
  "https://i.pinimg.com/736x/f4/18/da/f418da4ac21b933722ea0a9738447461.jpg",
  "https://i.pinimg.com/736x/89/ad/1f/89ad1f413de58358e757b6da8444709f.jpg",
  "https://i.pinimg.com/736x/20/4e/90/204e905bfc7f55c45f3a0eeddc2431c9.jpg",
  "https://i.pinimg.com/736x/56/78/9c/56789cec8a420e48c8203cc2d13c2027.jpg",
  "https://i.pinimg.com/736x/d0/70/07/d070075c1d5b8d094d43a36ea431d44c.jpg",
];

export default function HeroCarousel() {
  const plugin = React.useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  return (
    <Carousel plugins={[plugin.current]} className="size-[26.7vw]" onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.reset}>
      <CarouselContent>
        {imageUrls.map((url, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="relative aspect-square p-0">
                  <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover rounded-lg" priority />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
