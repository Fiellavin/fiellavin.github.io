import { useState, type FormEvent } from "react";
import type { OperationResult, RegistrationState } from "../lib/registration-engine";
import { CourseRegistrationSystem } from "../lib/registration-engine";

interface RegistrationWorkspaceProps {
  state: RegistrationState;
  activeSection: "courses" | "students" | "manage";
  onUpdate: (next: RegistrationState, result: OperationResult) => void;
}

export function RegistrationWorkspace({ state, activeSection, onUpdate }: RegistrationWorkspaceProps) {
  const [selectedStudent, setSelectedStudent] = useState(state.students[0]?.id ?? "");
  const [selectedCourse, setSelectedCourse] = useState(state.courses[0]?.code ?? "");
  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentProgram, setNewStudentProgram] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCapacity, setNewCourseCapacity] = useState("3");

  const engine = new CourseRegistrationSystem(state);
  const activeStudent = state.students.some((s) => s.id === selectedStudent)
    ? selectedStudent
    : (state.students[0]?.id ?? "");
  const activeCourse = state.courses.some((c) => c.code === selectedCourse)
    ? selectedCourse
    : (state.courses[0]?.code ?? "");

  const runAction = (action: (sys: CourseRegistrationSystem) => OperationResult) => {
    const sys = new CourseRegistrationSystem(state);
    const result = action(sys);
    onUpdate(sys.snapshot(), result);
  };

  const handleAddStudent = (e: FormEvent) => {
    e.preventDefault();
    const sys = new CourseRegistrationSystem(state);
    const result = sys.addStudent(newStudentId, newStudentName, newStudentProgram);
    onUpdate(sys.snapshot(), result);
    if (result.ok) {
      setSelectedStudent(newStudentId.trim().toUpperCase());
      setNewStudentId("");
      setNewStudentName("");
      setNewStudentProgram("");
    }
  };

  const handleAddCourse = (e: FormEvent) => {
    e.preventDefault();
    const parsedCap = Number(newCourseCapacity);
    const sys = new CourseRegistrationSystem(state);
    const result = sys.addCourse(newCourseCode, newCourseTitle, parsedCap);
    onUpdate(sys.snapshot(), result);
    if (result.ok) {
      setSelectedCourse(newCourseCode.trim().toUpperCase());
      setNewCourseCode("");
      setNewCourseTitle("");
      setNewCourseCapacity("3");
    }
  };

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  const totalCapacity = state.courses.reduce((sum, c) => sum + c.capacity, 0);
  const openSeats = state.courses.reduce((sum, c) => sum + engine.getAvailableSeats(c.code), 0);

  return (
    <div className="space-y-8">
      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card px-4 py-3.5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Courses Offered</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{state.courses.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3.5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Registered Students</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{state.students.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3.5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Enrollments</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-primary">{state.registrations.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3.5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Available Seats</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-foreground">
            {openSeats}
            <span className="text-sm font-normal text-muted-foreground">/{totalCapacity}</span>
          </div>
        </div>
      </div>

      {activeSection === "courses" && (
        <>
          {/* Enrollment Desk */}
          <section aria-labelledby="desk-heading" className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 id="desk-heading" className="text-lg font-semibold text-foreground">
                  Course Enrollment Desk
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Select a student and course to register or drop an enrollment in real time.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Student</span>
                <select value={activeStudent} onChange={(e) => setSelectedStudent(e.target.value)} className={inputClass}>
                  {state.students.length === 0 && <option value="">No students available</option>}
                  {state.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Course</span>
                <select value={activeCourse} onChange={(e) => setSelectedCourse(e.target.value)} className={inputClass}>
                  {state.courses.length === 0 && <option value="">No courses available</option>}
                  {state.courses.map((c) => {
                    const free = engine.getAvailableSeats(c.code);
                    return (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.title} ({free} {free === 1 ? "seat" : "seats"} open)
                      </option>
                    );
                  })}
                </select>
              </label>

              <button
                type="button"
                onClick={() => runAction((sys) => sys.register(activeStudent, activeCourse))}
                className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Register Student
              </button>

              <button
                type="button"
                onClick={() => runAction((sys) => sys.cancel(activeStudent, activeCourse))}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Drop Course
              </button>
            </div>
          </section>

          {/* Course Catalog & Rosters */}
          <section aria-labelledby="rosters-heading" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="rosters-heading" className="text-xl font-semibold text-foreground">
                Fall 2026 Course Catalog &amp; Rosters
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                Live seat capacity tracking
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {state.courses.map((course) => {
                const roster = engine.getCourseRoster(course.code);
                const available = engine.getAvailableSeats(course.code);
                const isFull = available === 0;
                const fillPct = Math.min(100, Math.round((roster.length / course.capacity) * 100));
                return (
                  <div key={course.code} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
                    <div className="h-1 bg-primary" />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono text-xs font-semibold text-primary">{course.code}</div>
                          <h3 className="mt-0.5 text-base font-semibold text-foreground">{course.title}</h3>
                        </div>
                        <span
                          className={
                            isFull
                              ? "rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary"
                              : "rounded-full bg-success/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-success"
                          }
                        >
                          {isFull ? "FULL" : `${available} OPEN`}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Enrollment</span>
                          <span className="font-mono font-medium text-foreground">
                            {roster.length} / {course.capacity} seats
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary transition-all" style={{ width: `${fillPct}%` }} />
                        </div>
                      </div>

                      <div className="mt-4 flex-1 border-t border-border pt-3">
                        {roster.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No students enrolled yet.</p>
                        ) : (
                          <ul className="space-y-2 text-sm">
                            {roster.map((student) => (
                              <li key={student.id} className="flex items-center justify-between gap-2">
                                <span className="truncate text-foreground">
                                  <span className="font-mono text-xs text-muted-foreground">{student.id}</span>{" "}
                                  {student.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => runAction((sys) => sys.cancel(student.id, course.code))}
                                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                                >
                                  Drop
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end border-t border-border pt-3">
                        <button
                          type="button"
                          onClick={() => runAction((sys) => sys.removeCourse(course.code))}
                          className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary hover:underline"
                        >
                          Remove course
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {activeSection === "students" && (
        <section aria-labelledby="students-heading" className="space-y-4">
          <h2 id="students-heading" className="text-xl font-semibold text-foreground">
            Student Directory &amp; Schedules
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[540px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Student ID</th>
                  <th className="px-4 py-3 font-semibold">Full Name</th>
                  <th className="px-4 py-3 font-semibold">Degree Program</th>
                  <th className="px-4 py-3 font-semibold">Enrolled Courses</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.students.map((student) => {
                  const courses = engine.getStudentCourses(student.id);
                  return (
                    <tr key={student.id}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{student.id}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{student.program}</td>
                      <td className="px-4 py-3">
                        {courses.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Not enrolled</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {courses.map((c) => (
                              <span
                                key={c.code}
                                className="rounded bg-accent px-2 py-0.5 font-mono text-xs font-medium text-accent-foreground"
                              >
                                {c.code}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => runAction((sys) => sys.removeStudent(student.id))}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeSection === "manage" && (
        <div className="space-y-6">
          <section aria-labelledby="manage-heading" className="grid gap-6 md:grid-cols-2">
            <form onSubmit={handleAddStudent} className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div>
              <h2 id="manage-heading" className="text-lg font-semibold text-foreground">
                Add New Student
              </h2>
              <p className="text-xs text-muted-foreground">Create a new student profile with a unique ID.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Student ID (e.g. STU-105)"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                className={inputClass}
                aria-label="Student ID"
              />
              <input
                type="text"
                placeholder="Full name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className={inputClass}
                aria-label="Student full name"
              />
            </div>
            <input
              type="text"
              placeholder="Degree program (e.g. Computer Science)"
              value={newStudentProgram}
              onChange={(e) => setNewStudentProgram(e.target.value)}
              className={inputClass}
              aria-label="Student program"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Add Student
            </button>
          </form>

          <form onSubmit={handleAddCourse} className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add New Course</h2>
              <p className="text-xs text-muted-foreground">Publish a course with a unique code and seat limit.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Course code (e.g. CS-305)"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className={inputClass}
                aria-label="Course code"
              />
              <input
                type="number"
                min={1}
                step={1}
                placeholder="Seat capacity"
                value={newCourseCapacity}
                onChange={(e) => setNewCourseCapacity(e.target.value)}
                className={inputClass}
                aria-label="Course capacity"
              />
            </div>
            <input
              type="text"
              placeholder="Course title"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              className={inputClass}
              aria-label="Course title"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Add Course
            </button>
            </form>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-semibold text-foreground">Existing Students ({state.students.length})</h3>
              {state.students.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">No students in the directory.</p>
              ) : (
                <ul className="mt-3 divide-y divide-border text-sm">
                  {state.students.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                      <span className="truncate">
                        <span className="font-mono text-xs font-semibold text-primary">{s.id}</span> {s.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => runAction((sys) => sys.removeStudent(s.id))}
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-semibold text-foreground">Existing Courses ({state.courses.length})</h3>
              {state.courses.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">No courses in the catalog.</p>
              ) : (
                <ul className="mt-3 divide-y divide-border text-sm">
                  {state.courses.map((c) => (
                    <li key={c.code} className="flex items-center justify-between gap-2 py-2">
                      <span className="truncate">
                        <span className="font-mono text-xs font-semibold text-primary">{c.code}</span> {c.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => runAction((sys) => sys.removeCourse(c.code))}
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}