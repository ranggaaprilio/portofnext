"use client";
import { Card, Carousel } from "@/components/ui/apple-cards-carousel";
import Image from "next/image";
import type React from "react";

export function Project() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} layout={false} />
  ));

  return (
    <div className="w-full h-full">
      <h2 className="text-3xl lg:text-3xl md:text-2xl font-bold">Projects</h2>
      <Carousel items={cards} />
    </div>
  );
}

type ProjectItem = {
  id: string;
  title: string;
  description: string;
  image: string;
};

const Content = () => {
  const projects: ProjectItem[] = [
    {
      id: "project-1",
      title: "AI Development Platform",
      description:
        "An advanced platform for developing and deploying machine learning models with intuitive interfaces and powerful analytics.",
      image: "https://assets.aceternity.com/macbook.png",
    },
    {
      id: "project-2",
      title: "Productivity Suite",
      description:
        "A comprehensive suite of tools designed to enhance workflow efficiency and team collaboration in modern workspaces.",
      image: "https://assets.aceternity.com/macbook.png",
    },
    {
      id: "project-3",
      title: "Innovation Hub",
      description:
        "A central platform for innovation management, connecting ideas with resources and tracking project development lifecycle.",
      image: "https://assets.aceternity.com/macbook.png",
    },
  ];

  return (
    <>
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4"
        >
          <p className="text-neutral-600 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700">{project.title}</span>{" "}
            {project.description}
          </p>
          <Image
            src={project.image}
            alt={`Project screenshot - ${project.title}`}
            height={500}
            width={500}
            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
          />
        </div>
      ))}
    </>
  );
};

type ProjectData = {
  category: string;
  title: string;
  src: string;
  content: React.ReactNode;
};

const data: ProjectData[] = [
  {
    category: "Artificial Intelligence",
    title: "AI-Powered Development Tools",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <Content />,
  },
  {
    category: "Productivity",
    title: "Enterprise Collaboration Platform",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <Content />,
  },
  {
    category: "Product",
    title: "Next-Gen Development Environment",
    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <Content />,
  },
  {
    category: "Product",
    title: "Mobile Development Framework",
    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <Content />,
  },
  {
    category: "Development",
    title: "Cloud Integration Platform",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <Content />,
  },
];
