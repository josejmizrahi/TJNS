'use client';

import * as React from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Button } from '../ui/button';

export function ScrollToTop() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 200);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-12 w-12"
        onClick={scrollToTop}
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
    </motion.div>
  );
}
