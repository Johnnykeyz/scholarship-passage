"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";

interface Course {
  id: string;
  grade: number;
  credits: number;
}

const SCALES = [
  { value: 5, label: "5.0 scale" },
  { value: 4, label: "4.0 scale" },
  { value: 10, label: "10.0 scale" },
];

export default function CgpaToolPage() {
  const [scale, setScale] = useState(5);
  const [courses, setCourses] = useState<Course[]>([{ id: "1", grade: 0, credits: 0 }]);
  const [projectedCredits, setProjectedCredits] = useState(0);
  const [projectedGrade, setProjectedGrade] = useState(scale);

  function addCourse() {
    setCourses((c) => [...c, { id: crypto.randomUUID(), grade: 0, credits: 0 }]);
  }

  function updateCourse(id: string, field: "grade" | "credits", value: number) {
    setCourses((c) => c.map((course) => (course.id === id ? { ...course, [field]: value } : course)));
  }

  function removeCourse(id: string) {
    setCourses((c) => c.filter((course) => course.id !== id));
  }

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = courses.reduce((sum, c) => sum + c.grade * c.credits, 0);
  const currentCgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  const projectedTotalCredits = totalCredits + projectedCredits;
  const projectedTotalPoints = totalPoints + projectedGrade * projectedCredits;
  const projectedCgpa = projectedTotalCredits > 0 ? projectedTotalPoints / projectedTotalCredits : 0;

  return (
    <AppShell>
      <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl">
        <h1 className="font-serif text-3xl mb-1">CGPA calculator</h1>
        <p className="text-[var(--color-muted)] mb-8">
          Enter your courses to calculate your CGPA and project what it could become.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1.5">Grading scale</label>
          <select
            value={scale}
            onChange={(e) => {
              setScale(Number(e.target.value));
              setProjectedGrade(Number(e.target.value));
            }}
            className="rounded-sm border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
          >
            {SCALES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-sm border border-[var(--color-line)] bg-white mb-4">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-3 px-4 py-2.5 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide border-b border-[var(--color-line)]">
            <span>Grade point</span>
            <span>Credit units</span>
            <span></span>
          </div>
          {courses.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 px-4 py-2.5 border-b border-[var(--color-line)] last:border-b-0 items-center">
              <input
                type="number"
                step="0.01"
                min={0}
                max={scale}
                value={c.grade || ""}
                onChange={(e) => updateCourse(c.id, "grade", Number(e.target.value))}
                className="rounded-sm border border-[var(--color-line)] px-2 py-1.5 text-sm w-full"
              />
              <input
                type="number"
                min={0}
                value={c.credits || ""}
                onChange={(e) => updateCourse(c.id, "credits", Number(e.target.value))}
                className="rounded-sm border border-[var(--color-line)] px-2 py-1.5 text-sm w-full"
              />
              <button
                onClick={() => removeCourse(c.id)}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-urgent)]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addCourse}
          className="text-sm font-medium text-[var(--color-brass)] hover:underline mb-8"
        >
          + Add course
        </button>

        <div className="rounded-sm border border-[var(--color-line)] bg-white p-5 mb-8">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-1">Current CGPA</p>
          <p className="font-serif text-3xl">
            {currentCgpa.toFixed(2)} <span className="text-lg text-[var(--color-muted)]">/ {scale.toFixed(2)}</span>
          </p>
        </div>

        <div className="border-t border-[var(--color-line)] pt-8">
          <h2 className="font-serif text-xl mb-4">Project your CGPA</h2>
          <p className="text-sm text-[var(--color-muted)] mb-4">
            What if you get a certain grade point in your remaining courses?
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1">Remaining credit units</label>
              <input
                type="number"
                min={0}
                value={projectedCredits || ""}
                onChange={(e) => setProjectedCredits(Number(e.target.value))}
                className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Expected grade point</label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={scale}
                value={projectedGrade || ""}
                onChange={(e) => setProjectedGrade(Number(e.target.value))}
                className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="rounded-sm border border-[var(--color-brass)] bg-[var(--color-brass-soft)] p-5">
            <p className="text-xs text-[var(--color-brass)] uppercase tracking-wide mb-1">Projected CGPA</p>
            <p className="font-serif text-3xl text-[var(--color-brass)]">
              {projectedCgpa.toFixed(2)} <span className="text-lg">/ {scale.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--color-muted)] mt-8">
          University-specific conversion policies may differ from this
          calculation. Confirm your official CGPA with your institution.
        </p>
      </div>
    </AppShell>
  );
}
