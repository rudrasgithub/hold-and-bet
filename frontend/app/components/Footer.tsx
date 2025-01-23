import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Lock } from 'lucide-react'

export default function Footer() {
    const { Github, Linkedin, Twitter, FileText, MessageCircle, Clipboard, Star } = LucideIcons;
    return (
        <div className="border-t px-10 dark bg-gray-900 text-gray-50 border-purple-600/10 py-6 md:py-0" >
            <div className="container px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 md:py-12">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="font-bold">Hold & Bet</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            The ultimate card betting platform for strategic players.
                        </p>
                    </div>
                    {[
                        {
                            title: "Quick Links",
                            links: [
                                { href: "#features", label: "Features", icon: <Star size={18} strokeWidth={1}/> },
                                { href: "#benefits", label: "Benefits", icon: <Clipboard size={18} strokeWidth={1} />},
                                { href: "#faq", label: "FAQ", icon: <FileText size={18} strokeWidth={1} /> }
                            ]
                        },
                        {
                            title: "Legal",
                            links: [
                                { href: "/terms", label: "Terms of Service", icon: <FileText size={18} strokeWidth={1} /> },
                                { href: "/privacy", label: "Privacy Policy", icon: <Lock size={18} strokeWidth={1} /> }
                            ]
                        },
                        {
                            title: "Connect",
                            links: [
                                { href: "/contact", label: "Contact Us", icon: <MessageCircle size={18} strokeWidth={1} /> },
                                { href: "https://x.com/rudrastwt", label: "Twitter / X", icon: <Twitter size={18} strokeWidth={1} /> },
                                { href: "https://www.github.com/rudrasgithub", label: "GitHub", icon: <Github size={18} strokeWidth={1} /> },
                                { href: "https://www.linkedin.com/in/rudramanaidupasupuleti", label: "Linkedin", icon: <Linkedin size={18} strokeWidth={1} /> },
                            ]
                        }
                    ].map((section, index) => (
                        <div key={index} className="space-y-4">
                            <h4 className="font-bold">{section.title}</h4>
                            <ul className="space-y-2 text-sm">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex} className="flex items-center space-x-2">
                                        {link.icon && <span>{link.icon}</span>}
                                        <Link href={link.href} className="text-muted-foreground hover:text-purple-600 transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t border-purple-600/10 py-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Hold & Bet | All rights reserved.
                    <br />Made with ❤️ by Rudra.
                </div>
            </div>
        </div>
    );
}
