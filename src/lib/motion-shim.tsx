import React from 'react';

type MotionProps<T extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[T] & {
  initial?: any;
  animate?: any;
  transition?: any;
  exit?: any;
  whileHover?: any;
  whileTap?: any;
};

const createMotionComponent = <T extends keyof React.JSX.IntrinsicElements>(tag: T) => {
  const Component = React.forwardRef<any, MotionProps<T>>(
    ({ initial, animate, transition, exit, whileHover, whileTap, ...props }, ref) => {
      return React.createElement(tag, { ref, ...props });
    }
  );
  Component.displayName = `motion.${tag}`;
  return Component;
};

export const motion = {
  div: createMotionComponent('div'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  p: createMotionComponent('p'),
  span: createMotionComponent('span'),
  button: createMotionComponent('button'),
  a: createMotionComponent('a'),
  section: createMotionComponent('section'),
  article: createMotionComponent('article'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
};

export default motion;
