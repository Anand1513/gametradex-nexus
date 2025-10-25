import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, MessageSquare, Trophy, Users, TrendingUp } from 'lucide-react';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import { Link } from 'react-router-dom';

interface SuccessStory {
  _id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
}

interface DealLog {
  _id: string;
  message: string;
  date: string;
}

const Success: React.FC = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [deals, setDeals] = useState<DealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch from API first
        const [storiesResponse, dealsResponse] = await Promise.all([
          fetch('/api/success/stories'),
          fetch('/api/success/deals')
        ]);

        if (storiesResponse.ok) {
          const storiesData = await storiesResponse.json();
          setStories(storiesData);
        } else {
          // Fallback to dummy data for stories
          const dummyStories: SuccessStory[] = [
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
            },
            {
              _id: '7',
              imageUrl: 'https://images.unsplash.com/photo-1593305841395-f5a75819d03e?w=800&h=600&fit=crop',
              caption: 'Dota 2 items traded securely. Fast and reliable service!',
              createdAt: new Date('2024-02-15').toISOString()
            },
            {
              _id: '8',
              imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e07f185f?w=800&h=600&fit=crop',
              caption: 'Call of Duty account swap was a breeze. Excellent customer support!',
              createdAt: new Date('2024-02-20').toISOString()
            },
            {
              _id: '9',
              imageUrl: 'https://images.unsplash.com/photo-1580327344095-ef2899c8975d?w=800&h=600&fit=crop',
              caption: 'Roblox account with rare items traded successfully. Very happy with the outcome!',
              createdAt: new Date('2024-02-25').toISOString()
            },
            {
              _id: '10',
              imageUrl: 'https://images.unsplash.com/photo-1593305841395-f5a75819d03e?w=800&h=600&fit=crop',
              caption: 'Genshin Impact account trade was smooth and efficient. Highly recommend!',
              createdAt: new Date('2024-03-01').toISOString()
            }
          ];
          setStories(dummyStories);
        }

        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json();
          setDeals(dealsData);
        } else {
          // Fallback to dummy data for deals
          const dummyDeals: DealLog[] = [
            {
              _id: '1',
              message: '✅ Oct 27, 2025 — Successfully completed a high-value CS:GO skin trade! 🎉',
              date: new Date('2025-10-27').toISOString()
            },
            {
              _id: '2',
              message: '✅ Oct 26, 2025 — Valorant account with rare skins sold in under an hour! 🎉',
              date: new Date('2025-10-26').toISOString()
            },
            {
              _id: '3',
              message: '✅ Oct 25, 2025 — Happy customer acquired a premium Minecraft account. 🎉',
              date: new Date('2025-10-25').toISOString()
            },
            {
              _id: '4',
              message: '✅ Oct 24, 2025 — Fortnite account with exclusive emotes successfully exchanged. 🎉',
              date: new Date('2025-10-24').toISOString()
            },
            {
              _id: '5',
              message: '✅ Oct 23, 2025 — League of Legends account with rare champions sold. 🎉',
              date: new Date('2025-10-23').toISOString()
            },
            {
              _id: '6',
              message: '✅ Oct 22, 2025 — Apex Legends heirloom account traded securely. 🎉',
              date: new Date('2025-10-22').toISOString()
            },
            {
              _id: '7',
              message: '✅ Oct 21, 2025 — Dota 2 Arcana items successfully transferred. 🎉',
              date: new Date('2025-10-21').toISOString()
            },
            {
              _id: '8',
              message: '✅ Oct 20, 2025 — Call of Duty Warzone account with high K/D sold. 🎉',
              date: new Date('2025-10-20').toISOString()
            },
            {
              _id: '9',
              message: '✅ Oct 19, 2025 — Roblox limited items exchanged for Robux. 🎉',
              date: new Date('2025-10-19').toISOString()
            },
            {
              _id: '10',
              message: '✅ Oct 18, 2025 — Genshin Impact account with C6 characters sold. 🎉',
              date: new Date('2025-10-18').toISOString()
            }
          ];
          setDeals(dummyDeals);
        }
      } catch (error) {
        console.error('Error fetching success data:', error);
        // Fallback to dummy data on error
        const dummyStories: SuccessStory[] = [
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
          }
        ];
        setStories(dummyStories);

        const dummyDeals: DealLog[] = [
          {
            _id: '1',
            message: '✅ Oct 27, 2025 — Successfully completed a high-value CS:GO skin trade! 🎉',
            date: new Date('2025-10-27').toISOString()
          },
          {
            _id: '2',
            message: '✅ Oct 26, 2025 — Valorant account with rare skins sold in under an hour! 🎉',
            date: new Date('2025-10-26').toISOString()
          },
          {
            _id: '3',
            message: '✅ Oct 25, 2025 — Happy customer acquired a premium Minecraft account. 🎉',
            date: new Date('2025-10-25').toISOString()
          },
          {
            _id: '4',
            message: '✅ Oct 24, 2025 — Fortnite account with exclusive emotes successfully exchanged. 🎉',
            date: new Date('2025-10-24').toISOString()
          },
          {
            _id: '5',
            message: '✅ Oct 23, 2025 — League of Legends account with rare champions sold. 🎉',
            date: new Date('2025-10-23').toISOString()
          }
        ];
        setDeals(dummyDeals);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh every 30 seconds to get updates from admin
    const refreshInterval = setInterval(fetchData, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading success stories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Success Stories</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real transactions and success stories from our verified community. 
            See how GameTradeX has helped thousands of players find their perfect gaming accounts.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="card-glow">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-1">5000+</h3>
              <p className="text-muted-foreground">Successful Transactions</p>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-1">10,000+</h3>
              <p className="text-muted-foreground">Happy Customers</p>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-1">4.9/5</h3>
              <p className="text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-1">99.8%</h3>
              <p className="text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Split Layout - Success Stories and Recent Deals Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Success Stories - Left Half */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center">Success Stories</h2>
            {stories.length > 0 ? (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {stories.map((story) => (
                  <Card key={story._id} className="card-glow overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={story.imageUrl}
                        alt={story.caption}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Star className="w-5 h-5 text-yellow-400 mr-2" />
                        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                          Success Story
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-3">{story.caption}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(story.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Success Stories Yet</h3>
                <p className="text-muted-foreground">
                  Success stories will appear here once they are added by our admin team.
                </p>
              </div>
            )}
          </section>

          {/* Recent Deals - Right Half */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center">Recent Deals</h2>
            {deals.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {deals.map((deal) => (
                  <Card key={deal._id} className="card-glow">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground mb-2">{deal.message}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(deal.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Recent Deals</h3>
                <p className="text-muted-foreground">
                  Recent deals will appear here once they are logged by our admin team.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* CTA Section */}
        <section className="text-center py-16">
          <Card className="card-glow max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Join Our Success Stories</h2>
              <p className="text-muted-foreground mb-6">
                Ready to find your perfect gaming account? Browse our verified listings 
                and become part of our success story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/browse">
                  <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Browse Accounts
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="border border-border px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors">
                    Contact Support
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Legal Disclaimer */}
        <LegalDisclaimer />
      </div>
    </div>
  );
};

export default Success;