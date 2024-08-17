import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight } from 'lucide-react';

const FeatureCard = ({ title, description, href }) => (
  <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button asChild className="w-full mt-4" variant="outline">
        <Link href={href} className="flex items-center justify-center">
          Go to {title}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardContent>
  </Card>
);

const Home = () => {
  const features = [
    {
      title: "Notes",
      description: "Create and manage your notes with AI assistance",
      href: "/notes"
    },
    {
      title: "Projects",
      description: "Manage your business projects efficiently",
      href: "/projects"
    },
    {
      title: "Tasks",
      description: "Organize and prioritize your tasks",
      href: "/tasks"
    },
    {
      title: "AI Tools",
      description: "Access powerful AI-driven tools",
      href: "/tools"
    },
    {
      title: "Brainstorm Board",
      description: "Visualize and expand ideas with AI assistance",
      href: "/brainstorm"
    },
    {
      title: "Settings",
      description: "Configure your AI Assistant and add OpenAI token",
      href: "/settings"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-extrabold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
        Welcome to AI Assistant
      </h1>
      <p className="text-xl text-center mb-12 text-muted-foreground">
        Your intelligent companion for enhanced productivity and creativity
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default Home;