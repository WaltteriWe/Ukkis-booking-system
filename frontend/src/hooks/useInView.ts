"use client";

import { useEffect, useRef, useState } from "react";


export function useInView(options?: IntersectionObserverInit) {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef  <HTMLElement | null>(null);

    useEffect (() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            setIsInView (true);
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        }
      }, {
        threshold: 0.1, ...options
      });

      if (ref.current) {
        observer.observe(ref.current);
      }
        return () => {
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        };
    }, [ref, options]);

    return {
        ref,
        isInView
    }
    }