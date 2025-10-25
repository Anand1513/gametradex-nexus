import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SuccessStory {
  _id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
}

const SuccessStoriesCarousel: React.FC = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/success/stories');
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        } else {
          // Fallback to dummy data if API is not available
          const dummyStories = [
            {
              _id: '1',
              imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
              caption: 'Successfully traded my Fortnite account for a rare skin collection! The process was smooth and secure.',
              createdAt: new Date('2024-01-15').toISOString()
            },
            {
              _id: '2',
              imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
              caption: 'Amazing experience trading my Valorant account. GameTradeX made it so easy and safe!',
              createdAt: new Date('2024-01-20').toISOString()
            },
            {
              _id: '3',
              imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop',
              caption: 'Got my dream CS:GO inventory through GameTradeX. Highly recommended for all gamers!',
              createdAt: new Date('2024-01-25').toISOString()
            },
            {
              _id: '4',
              imageUrl: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=600&fit=crop',
              caption: 'Traded my League of Legends account for a better one. The escrow system is perfect!',
              createdAt: new Date('2024-02-01').toISOString()
            },
            {
              _id: '5',
              imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
              caption: 'Minecraft premium account trade was seamless. Great platform for gaming transactions!',
              createdAt: new Date('2024-02-05').toISOString()
            },
            {
              _id: '6',
              imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&h=600&fit=crop',
              caption: 'Apex Legends account exchange completed successfully. Highly trusted marketplace!',
              createdAt: new Date('2024-02-10').toISOString()
            }
          ];
          setStories(dummyStories);
        }
      } catch (error) {
        console.error('Error fetching success stories:', error);
        // Fallback to dummy data on error
        const dummyStories = [
          {
            _id: '1',
            imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
            caption: 'Successfully traded my Fortnite account for a rare skin collection! The process was smooth and secure.',
            createdAt: new Date('2024-01-15').toISOString()
          },
          {
            _id: '2',
            imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
            caption: 'Amazing experience trading my Valorant account. GameTradeX made it so easy and safe!',
            createdAt: new Date('2024-01-20').toISOString()
          },
          {
            _id: '3',
            imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop',
            caption: 'Got my dream CS:GO inventory through GameTradeX. Highly recommended for all gamers!',
            createdAt: new Date('2024-01-25').toISOString()
          },
          {
            _id: '4',
            imageUrl: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=600&fit=crop',
            caption: 'Traded my League of Legends account for a better one. The escrow system is perfect!',
            createdAt: new Date('2024-02-01').toISOString()
          },
          {
            _id: '5',
            imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
            caption: 'Minecraft premium account trade was seamless. Great platform for gaming transactions!',
            createdAt: new Date('2024-02-05').toISOString()
          },
          {
            _id: '6',
            imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&h=600&fit=crop',
            caption: 'Apex Legends account exchange completed successfully. Highly trusted marketplace!',
            createdAt: new Date('2024-02-10').toISOString()
          }
        ];
        setStories(dummyStories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Auto-scroll functionality - continuous loop
  useEffect(() => {
    if (stories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 3000); // Auto-scroll every 3 seconds for faster movement

    return () => clearInterval(interval);
  }, [stories.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  // State for payment screenshots from admin
  const [paymentScreenshots, setPaymentScreenshots] = useState<SuccessStory[]>([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState(true);

  // Fetch payment screenshots from admin
  useEffect(() => {
    const fetchPaymentScreenshots = async () => {
      try {
        const response = await fetch('/api/success/stories');
        if (response.ok) {
          const data = await response.json();
          setPaymentScreenshots(data);
        } else {
          // Fallback to dummy data if API is not available
          const dummyScreenshots = [
            {
              _id: '1',
              imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=360&fit=crop',
              caption: 'PayPal Payment Screenshot',
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=360&fit=crop',
              caption: 'Stripe Payment Screenshot',
              createdAt: new Date().toISOString()
            },
            {
              _id: '3',
              imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=360&fit=crop',
              caption: 'Razorpay Payment Screenshot',
              createdAt: new Date().toISOString()
            },
            {
              _id: '4',
              imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=360&fit=crop',
              caption: 'PayU Payment Screenshot',
              createdAt: new Date().toISOString()
            },
            {
              _id: '5',
              imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=360&fit=crop',
              caption: 'Square Payment Screenshot',
              createdAt: new Date().toISOString()
            },
            {
              _id: '6',
              imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=360&fit=crop',
              caption: 'Adyen Payment Screenshot',
              createdAt: new Date().toISOString()
            }
          ];
          setPaymentScreenshots(dummyScreenshots);
        }
      } catch (error) {
        console.error('Error fetching payment screenshots:', error);
        // Fallback to dummy data on error
        const dummyScreenshots = [
          {
            _id: '1',
            imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=360&fit=crop',
            caption: 'PayPal Payment Screenshot',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=360&fit=crop',
            caption: 'Stripe Payment Screenshot',
            createdAt: new Date().toISOString()
          },
          {
            _id: '3',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=360&fit=crop',
            caption: 'Razorpay Payment Screenshot',
            createdAt: new Date().toISOString()
          },
          {
            _id: '4',
            imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=360&fit=crop',
            caption: 'PayU Payment Screenshot',
            createdAt: new Date().toISOString()
          },
          {
            _id: '5',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=360&fit=crop',
            caption: 'Square Payment Screenshot',
            createdAt: new Date().toISOString()
          },
          {
            _id: '6',
            imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=360&fit=crop',
            caption: 'Adyen Payment Screenshot',
            createdAt: new Date().toISOString()
          }
        ];
        setPaymentScreenshots(dummyScreenshots);
      } finally {
        setIsPaymentLoading(false);
      }
    };

    fetchPaymentScreenshots();
  }, []);

  // Duplicate payment screenshots for seamless loop
  const duplicatedScreenshots = [...paymentScreenshots, ...paymentScreenshots, ...paymentScreenshots];

  // Brand carousel animation
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let animationId: number;
    let position = 0;
    const speed = 1; // pixels per frame

    const animate = () => {
      if (!isPaused) {
        position -= speed;
        carousel.style.transform = `translateX(${position}px)`;
        
        // Reset position when we've scrolled through one set of brands
        if (Math.abs(position) >= carousel.scrollWidth / 3) {
          position = 0;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused]);

  if (isLoading) {
    return (
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading success stories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (stories.length === 0) {
    return (
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Success Stories</h2>
            <p className="text-muted-foreground text-lg">Real transactions from our verified community</p>
          </div>
          
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Success Stories Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              We're working on showcasing our community's success stories. Check back soon!
            </p>
            <Link to="/success">
              <Button variant="outline" className="hover:bg-primary/10">
                <ExternalLink className="w-4 h-4 mr-2" />
                View All Success Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-muted-foreground text-lg">Real transactions from our verified community</p>
        </div>

        {/* Payment Screenshots Carousel */}
        <div className="mb-12">
          {isPaymentLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading payment screenshots...</p>
            </div>
          ) : (
            <div 
              className="relative overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
            <div 
              ref={carouselRef}
              className="flex items-center space-x-4 py-4"
              style={{ width: 'fit-content' }}
            >
              {duplicatedScreenshots.map((screenshot, index) => (
                <Link
                  key={`${screenshot._id}-${index}`}
                  to="/success"
                  className="flex-shrink-0 bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 min-w-[600px] h-[360px] cursor-pointer"
                >
                  <img
                    src={screenshot.imageUrl}
                    alt={screenshot.caption}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}
            </div>
            
            {/* Gradient overlays for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link to="/success">
            <Button variant="outline" className="hover:bg-primary/10">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All Success Stories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesCarousel;
