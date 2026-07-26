import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';

// Inline Lottie animation data for success checkmark
const successAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { t: 15, s: [0, 0, 100], e: [110, 110, 100] },
          { t: 30, s: [110, 110, 100], e: [100, 100, 100] },
          { t: 40, s: [100, 100, 100] }
        ]}
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  c: false,
                  v: [[-30, 0], [-10, 20], [30, -20]],
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]]
                }
              }
            },
            {
              ty: "tm",
              s: { a: 0, k: 0 },
              e: { a: 1, k: [
                { t: 20, s: [0], e: [100] },
                { t: 40, s: [100] }
              ]},
              o: { a: 0, k: 0 }
            },
            {
              ty: "st",
              c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
              w: { a: 0, k: 6 },
              lc: 2,
              lj: 2
            },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 1, k: [
            { t: 0, s: [0, 0], e: [120, 120] },
            { t: 15, s: [120, 120], e: [100, 100] },
            { t: 25, s: [100, 100] }
          ]},
          nm: "Circle"
        },
        {
          ty: "st",
          c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
          w: { a: 0, k: 4 },
          lc: 2,
          lj: 2
        }
      ]
    }
  ]
};

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  size?: number;
  message?: string;
}

export function SuccessAnimation({ show, onComplete, size = 120, message }: SuccessAnimationProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div className="flex flex-col items-center gap-4">
            <div style={{ width: size, height: size }}>
              <Lottie animationData={successAnimation} loop={false} />
            </div>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-semibold text-white drop-shadow-lg"
              >
                {message}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
