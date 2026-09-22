"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Stylized world-route illustration: a set of city nodes connected by
// flight-path arcs, echoing the "journey" framing without stock photography.
// The dots roughly trace continents' relative positions; this is a mark,
// not a literal map.

const NODES = [
  { id: "lagos", x: 46, y: 62, label: "Lagos" },
  { id: "london", x: 50, y: 28, label: "London" },
  { id: "berlin", x: 56, y: 26, label: "Berlin" },
  { id: "toronto", x: 20, y: 34, label: "Toronto" },
  { id: "boston", x: 24, y: 38, label: "Boston" },
  { id: "delhi", x: 74, y: 46, label: "Delhi" },
  { id: "nairobi", x: 58, y: 64, label: "Nairobi" },
  { id: "sydney", x: 88, y: 82, label: "Sydney" },
];

const ROUTES: [string, string][] = [
  ["lagos", "london"],
  ["lagos", "berlin"],
  ["lagos", "toronto"],
  ["nairobi", "delhi"],
  ["delhi", "sydney"],
  ["boston", "london"],
  ["lagos", "nairobi"],
];

function nodeFor(id: string) {
  return NODES.find((n) => n.id === id)!;
}

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - 10;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

export function RouteMap() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const ctx = gsap.context(() => {
      const paths = svgRef.current!.querySelectorAll<SVGPathElement>(".route-path");
      const dots = svgRef.current!.querySelectorAll<SVGCircleElement>(".route-node");

      paths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(dots, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.06,
        ease: "back.out(2)",
      }).to(
        paths,
        {
          strokeDashoffset: 0,
          duration: 1.1,
          stagger: 0.15,
          ease: "power2.inOut",
        },
        "-=0.2"
      );

      // Gentle continuous pulse on nodes once settled in.
      gsap.to(dots, {
        opacity: 0.55,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.3, repeat: -1 },
        ease: "sine.inOut",
        delay: 1.4,
      });
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      className="w-full h-full"
      role="img"
      aria-label="Illustrative map of routes between cities worldwide"
    >
      {ROUTES.map(([from, to]) => {
        const a = nodeFor(from);
        const b = nodeFor(to);
        return (
          <path
            key={`${from}-${to}`}
            className="route-path"
            d={arcPath(a, b)}
            fill="none"
            stroke="var(--color-brass)"
            strokeWidth="0.35"
            strokeLinecap="round"
            opacity={0.55}
          />
        );
      })}
      {NODES.map((n) => (
        <g key={n.id} className="route-node" style={{ opacity: 0, transformOrigin: `${n.x}px ${n.y}px` }}>
          <circle
            className="route-node"
            cx={n.x}
            cy={n.y}
            r="1.6"
            fill="var(--color-ink)"
            style={{ transformOrigin: `${n.x}px ${n.y}px`, transformBox: "fill-box" }}
          />
          <circle cx={n.x} cy={n.y} r="0.5" fill="var(--color-brass)" />
        </g>
      ))}
    </svg>
  );
}
