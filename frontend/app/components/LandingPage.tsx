'use client';

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Users, WalletCardsIcon as Cards, Lock, Wallet, Shield } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import * as LucideIcons from 'lucide-react';

export default function LandingPage() {

  const { Play, Monitor, Headphones} = LucideIcons;

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-300 dark bg-gray-900 text-gray-50"
    >
      <div className="flex-1">
        <div className="relative py-20 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-amber-500/10" />
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="w-fit bg-purple-600 text-white hover:bg-purple-700">New Game</Badge>
                  <h5 className="font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent animate-gradient">
                    Bet, Hold, and Win Big in the Ultimate Card Clash Game!
                  </h5>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Experience the thrill of strategic betting across multiple decks while holding your winning card.
                    Join thousands of players in this unique card game experience.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                    <Link href="/signup">
                      <div className="flex justify-center items-center gap-2">
                        <Play strokeWidth={2} size={10}/>
                        <div>Play Now</div>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-purple-600 text-purple-600 hover:bg-purple-50 hover:bg-purple-900/30" asChild>
                    <Link href="/try-demo">
                      <div className="flex justify-between items-center gap-2">
                        <Monitor strokeWidth={2} size={24}/>
                        <div>Try Demo</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-amber-500/20 rounded-lg blur-3xl" />
                  <Image
                    src="/landing-page.webp"
                    width={700}
                    height={600}
                    alt="Hold & Bet Gameplay Preview"
                    className="rounded-lg shadow-2xl relative"
                    priority
                  />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="py-10 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-900/30">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
              Game Features
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Discover what makes Hold & Bet the most exciting card game platform
            </p>
          </div>
          <div className="grid gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "One User, One Game",
                description: "Focus on your strategy with our one-game-per-user system, ensuring an immersive experience."
              },
              {
                icon: Cards,
                title: "Multiple Game Rooms",
                description: "Games auto-create as players join, ensuring you're always ready to play."
              },
              {
                icon: Lock,
                title: "Hold One Card",
                description: "Strategic gameplay with the ability to hold one card while betting on multiple decks."
              },
              {
                icon: Shield,
                title: "Game Manager",
                description: "Secure and efficient money transactions handled by our automated system."
              },
              {
                icon: Wallet,
                title: "Wallet Integration",
                description: "Seamless deposits and withdrawals powered by Stripe's secure payment system."
              },
              {
                icon: Coins,
                title: "Bet on Three Decks",
                description: "Triple the excitement with betting opportunities across three different decks."
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-purple-500/10 transition-all duration-300 dark:bg-gray-800">
                <CardContent className="p-6 space-y-2">
                  <feature.icon className="h-12 w-12 mb-4 text-purple-600 group-hover:text-amber-500 transition-colors" />
                  <h3 className="text-xl font-bold group-hover:text-purple-600 transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div id="benefits" className="py-20 px-6">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-[1fr_600px] lg:gap-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-amber-500/20 rounded-lg blur-3xl" />
                <Image
                  src="/landing-page2.webp"
                  width={500}
                  height={250}
                  alt="Hold & Bet Benefits"
                  className="relative rounded-lg shadow-xl"
                />
              </div>
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                  Why Choose Hold & Bet?
                </h2>
                <p className="text-muted-foreground">
                  Experience a new level of card gaming with our unique features and secure platform.
                </p>
              </div>
              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "Secure and Fast Payouts",
                    description: "Powered by Stripe for maximum security and speed."
                  },
                  {
                    icon: Users,
                    title: "Real-Time Multiplayer",
                    description: "Play against others in real-time with instant game creation."
                  },
                  {
                    icon: Cards,
                    title: "Strategic Gameplay",
                    description: "Hold cards and place strategic bets to maximize your winnings."
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-2 group">
                    <benefit.icon className="h-6 w-6 text-purple-600 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                    <div>
                      <h3 className="font-bold group-hover:text-purple-600 transition-colors">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="faq" className="py-20 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-900/30">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Find answers to common questions about Hold & Bet
            </p>
          </div>
          <div className="mx-auto max-w-3xl mt-12">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question: "How do I join a game?",
                  answer: "Simply sign up, deposit funds into your wallet, and click 'Join Game'. Our system will automatically place you in an available game room or create a new one for you."
                },
                {
                  question: "What are the rules for betting?",
                  answer: "You can bet on up to three different decks simultaneously. Each deck has its own odds and potential payouts. You can also hold one card to improve your chances of winning."
                },
                {
                  question: "How are winnings calculated?",
                  answer: "Winnings are calculated based on the odds of each deck and your bet amount. The game manager automatically handles all calculations and payouts."
                },
                {
                  question: "Is my payment information secure?",
                  answer: "Yes, all payments are processed through Stripe, a leading payment processor with bank-level security. Your payment information is never stored on our servers."
                }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`} className="group">
                  <AccordionTrigger className="hover:text-purple-600 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      <div className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-amber-500/10" />
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                Ready to Bet and Win?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Join thousands of players and experience the thrill of Hold & Bet today.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                <Link href="/signup">
                  <div className="flex justify-center items-center gap-2">
                    <Play size={24} strokeWidth={2}/>
                    <span>Start Playing Now</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30" asChild>
                <Link href="/contact">
                  <div className="flex justify-center items-center gap-2">
                    <Headphones size={24} strokeWidth={2}/>
                    <span>Contact Support</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

