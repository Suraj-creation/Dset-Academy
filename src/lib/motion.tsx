'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';

type StyleMap = Record<string, string | number>;

interface MotionTransition {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  staggerChildren?: number;
  delayChildren?: number;
  type?: string;
  repeat?: number;
}

interface MotionViewport {
  once?: boolean;
  amount?: number | string;
  margin?: string;
}

interface MotionProps {
  initial?: StyleMap | string | boolean;
  animate?: StyleMap | string;
  whileInView?: StyleMap | string;
  exit?: StyleMap | string;
  transition?: MotionTransition;
  variants?: Record<string, StyleMap | Record<string, unknown>>;
  viewport?: MotionViewport;
  whileHover?: StyleMap;
  whileTap?: StyleMap;
  layout?: boolean | string;
  layoutId?: string;
  style?: React.CSSProperties;
  className?: string;
  children?: ReactNode;
}

function toCSS(map: StyleMap): React.CSSProperties {
  const css: React.CSSProperties = {};
  const transforms: string[] = [];

  for (const [key, val] of Object.entries(map)) {
    switch (key) {
      case 'opacity': css.opacity = val as number; break;
      case 'y': transforms.push(`translateY(${val}px)`); break;
      case 'x': transforms.push(`translateX(${val}px)`); break;
      case 'scale': transforms.push(`scale(${val})`); break;
      case 'scaleX': transforms.push(`scaleX(${val})`); break;
      case 'scaleY': transforms.push(`scaleY(${val})`); break;
      case 'rotate': transforms.push(`rotate(${val}deg)`); break;
      case 'width': css.width = typeof val === 'number' ? `${val}px` : (val as string); break;
      case 'height': css.height = typeof val === 'number' ? `${val}px` : (val as string); break;
    }
  }

  if (transforms.length) css.transform = transforms.join(' ');
  return css;
}

function createMotionComponent(tag: string) {
  const MotionEl = React.forwardRef<HTMLElement, MotionProps & Record<string, unknown>>(
    function MotionEl(allProps, forwardedRef) {
      const {
        initial, animate, whileInView, transition, variants, viewport,
        exit: _exit, whileHover: _wh, whileTap: _wt, layout: _l, layoutId: _lid,
        style, className, children,
        ...rest
      } = allProps as MotionProps & Record<string, unknown>;

      const innerRef = useRef<HTMLElement>(null);
      const resolvedRef = (forwardedRef ?? innerRef) as React.RefObject<HTMLElement>;
      const [active, setActive] = useState(false);

      const duration = transition?.duration ?? 0.5;
      const delay = transition?.delay ?? 0;
      const hasWIV = !!whileInView;

      function resolve(val: StyleMap | string | boolean | undefined): StyleMap {
        if (!val || typeof val === 'boolean') return {};
        if (typeof val === 'string') {
          const v = (variants ?? {})[val];
          return (v as StyleMap | undefined) ?? {};
        }
        return val as StyleMap;
      }

      const initStyle = resolve(initial as StyleMap | string | boolean | undefined);
      const targetStyle = resolve(
        (hasWIV ? whileInView : animate) as StyleMap | string | boolean | undefined
      );

      useEffect(() => {
        if (hasWIV) {
          const el = resolvedRef.current;
          if (!el) return;
          const amount = typeof viewport?.amount === 'number' ? viewport.amount : 0.1;
          const obs = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setActive(true);
                if (viewport?.once !== false) obs.disconnect();
              }
            },
            { threshold: amount }
          );
          obs.observe(el);
          return () => obs.disconnect();
        } else if (animate !== undefined) {
          const id = requestAnimationFrame(() => setActive(true));
          return () => cancelAnimationFrame(id);
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const currentCSS = toCSS(active ? targetStyle : initStyle);

      const computedStyle: React.CSSProperties = {
        ...currentCSS,
        transition: `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`,
        ...(style as React.CSSProperties | undefined),
      };

      const Tag = tag as React.ElementType;
      return (
        <Tag
          ref={resolvedRef as React.Ref<HTMLElement>}
          className={className}
          style={computedStyle}
          {...(rest as Record<string, unknown>)}
        >
          {children}
        </Tag>
      );
    }
  );

  MotionEl.displayName = `motion.${tag}`;
  return MotionEl;
}

const cache: Record<string, ReturnType<typeof createMotionComponent>> = {};

export const motion = new Proxy({} as Record<string, ReturnType<typeof createMotionComponent>>, {
  get(_, prop: string) {
    if (!cache[prop]) cache[prop] = createMotionComponent(prop);
    return cache[prop];
  },
});

export function AnimatePresence({
  children,
}: {
  children?: ReactNode;
  mode?: string;
  initial?: boolean;
}) {
  return <>{children}</>;
}

export function useAnimation() {
  return { start: () => Promise.resolve(), stop: () => {}, set: () => {} };
}

export function useInView(
  ref: React.RefObject<HTMLElement>,
  options?: { once?: boolean; amount?: number }
) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options?.once !== false) obs.disconnect();
        }
      },
      { threshold: options?.amount ?? 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return inView;
}

export function useMotionValue(initial: number) {
  return { get: () => initial, set: () => {}, onChange: () => () => {} };
}

export function useTransform(_value: unknown, _from: unknown, to: unknown) {
  return to;
}
