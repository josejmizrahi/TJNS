'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { CheckCircle, GitBranch, Network, Globe } from 'lucide-react';

const roadmapSteps = [
  {
    title: 'Phase 1: Identity Foundation',
    description: 'Establish secure JewishID system with multi-level verification',
    status: 'In Progress',
    icon: CheckCircle,
  },
  {
    title: 'Phase 2: Community Integration',
    description: 'Implement rabbi verification and community attestations',
    status: 'Upcoming',
    icon: GitBranch,
  },
  {
    title: 'Phase 3: Network Expansion',
    description: 'Launch governance features and expand community reach',
    status: 'Planned',
    icon: Network,
  },
  {
    title: 'Phase 4: Global Scale',
    description: 'Scale infrastructure and establish international partnerships',
    status: 'Future',
    icon: Globe,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
    },
  },
};

export function RoadmapSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Project Roadmap</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our journey to building a comprehensive identity system for the Jewish Network State
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {roadmapSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {step.description}
                        </CardDescription>
                        <div className="mt-4">
                          <span className="text-sm font-medium text-muted-foreground">
                            Status: {step.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
