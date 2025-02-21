'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Shield, Users, Wallet, Award } from 'lucide-react';

const trustLevels = [
  {
    title: 'Baseline Trust',
    description: 'Email and phone verification for basic identity confirmation',
    icon: Shield,
    color: 'text-primary',
  },
  {
    title: 'Community Trust',
    description: 'Rabbi reference and Hebrew name verification for community integration',
    icon: Users,
    color: 'text-primary',
  },
  {
    title: 'Financial Trust',
    description: 'KYC and video verification for financial transactions',
    icon: Wallet,
    color: 'text-primary',
  },
  {
    title: 'Governance Trust',
    description: 'Multi-party verification for participation in network governance',
    icon: Award,
    color: 'text-primary',
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
    },
  },
};

export function TrustLevelsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Progressive Trust System</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our multi-level verification system ensures the highest standards of identity verification
            while maintaining privacy and security.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {trustLevels.map((level, index) => {
            const Icon = level.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{level.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {level.description}
                        </CardDescription>
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
