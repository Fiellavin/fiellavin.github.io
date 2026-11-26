export interface StudentRecord {
  id: string;
  name: string;
  program: string;
}

export interface CourseRecord {
  code: string;
  title: string;
  capacity: number;
}

export interface RegistrationRecord {
  studentId: string;
  courseCode: string;
  registeredAt: string;
}

export interface OperationResult {
  ok: boolean;
  code:
    | "REGISTERED"
    | "CANCELLED"
    | "STUDENT_ADDED"
    | "COURSE_ADDED"
    | "STUDENT_REMOVED"
    | "COURSE_REMOVED"
    | "DUPLICATE_REGISTRATION"
    | "COURSE_FULL"
    | "UNKNOWN_STUDENT"
    | "UNKNOWN_COURSE"
    | "NOT_REGISTERED"
    | "INVALID_INPUT"
    | "DUPLICATE_ID";
  message: string;
}

export interface RegistrationState {
  students: StudentRecord[];
  courses: CourseRecord[];
  registrations: RegistrationRecord[];
}

export interface IRegistrationPolicy {
  validate(
    student: StudentRecord | undefined,
    course: CourseRecord | undefined,
    existing: readonly RegistrationRecord[],
  ): OperationResult | null;
}

export class StandardRegistrationPolicy implements IRegistrationPolicy {
  validate(
    student: StudentRecord | undefined,
    course: CourseRecord | undefined,
    existing: readonly RegistrationRecord[],
  ): OperationResult | null {
    if (!student) {
      return { ok: false, code: "UNKNOWN_STUDENT", message: "Student ID was not found." };
    }
    if (!course) {
      return { ok: false, code: "UNKNOWN_COURSE", message: "Course code was not found." };
    }
    const alreadyEnrolled = existing.some(
      (r) => r.studentId === student.id && r.courseCode === course.code,
    );
    if (alreadyEnrolled) {
      return {
        ok: false,
        code: "DUPLICATE_REGISTRATION",
        message: `${student.name} (${student.id}) is already registered in ${course.code}.`,
      };
    }
    const enrolledCount = existing.filter((r) => r.courseCode === course.code).length;
    if (enrolledCount >= course.capacity) {
      return {
        ok: false,
        code: "COURSE_FULL",
        message: `${course.code} (${course.title}) is full (${enrolledCount}/${course.capacity} seats).`,
      };
    }
    return null;
  }
}

export class CourseRegistrationSystem {
  private students: Map<string, StudentRecord>;
  private courses: Map<string, CourseRecord>;
  private registrations: RegistrationRecord[];
  private readonly policy: IRegistrationPolicy;

  constructor(initial: RegistrationState, policy: IRegistrationPolicy = new StandardRegistrationPolicy()) {
    this.students = new Map(initial.students.map((s) => [s.id.toUpperCase(), { ...s, id: s.id.toUpperCase() }]));
    this.courses = new Map(initial.courses.map((c) => [c.code.toUpperCase(), { ...c, code: c.code.toUpperCase() }]));
    this.registrations = initial.registrations.map((r) => ({
      ...r,
      studentId: r.studentId.toUpperCase(),
      courseCode: r.courseCode.toUpperCase(),
    }));
    this.policy = policy;
  }

  addStudent(idInput: string, nameInput: string, programInput: string): OperationResult {
    const id = idInput.trim().toUpperCase();
    const name = nameInput.trim();
    const program = programInput.trim();
    if (!id || !name || !program) {
      return { ok: false, code: "INVALID_INPUT", message: "Student ID, full name, and program are required." };
    }
    if (this.students.has(id)) {
      return { ok: false, code: "DUPLICATE_ID", message: `Student ID ${id} already exists.` };
    }
    this.students.set(id, { id, name, program });
    return { ok: true, code: "STUDENT_ADDED", message: `Added student ${name} (${id}).` };
  }

  addCourse(codeInput: string, titleInput: string, capacity: number): OperationResult {
    const code = codeInput.trim().toUpperCase();
    const title = titleInput.trim();
    if (!code || !title) {
      return { ok: false, code: "INVALID_INPUT", message: "Course code and title are required." };
    }
    if (!Number.isInteger(capacity) || capacity <= 0) {
      return { ok: false, code: "INVALID_INPUT", message: "Course capacity must be a positive whole number." };
    }
    if (this.courses.has(code)) {
      return { ok: false, code: "DUPLICATE_ID", message: `Course code ${code} already exists.` };
    }
    this.courses.set(code, { code, title, capacity });
    return { ok: true, code: "COURSE_ADDED", message: `Added course ${code} (${title}) with ${capacity} seats.` };
  }

  removeStudent(studentIdInput: string): OperationResult {
    const id = studentIdInput.trim().toUpperCase();
    const student = this.students.get(id);
    if (!student) {
      return { ok: false, code: "UNKNOWN_STUDENT", message: `Student ID ${id || "(empty)"} was not found.` };
    }
    this.students.delete(id);
    const beforeCount = this.registrations.length;
    this.registrations = this.registrations.filter((r) => r.studentId !== id);
    const dropped = beforeCount - this.registrations.length;
    return {
      ok: true,
      code: "STUDENT_REMOVED",
      message: `Removed student ${student.name} (${id})${dropped > 0 ? ` and cleared ${dropped} enrollment${dropped === 1 ? "" : "s"}` : ""}.`,
    };
  }

  removeCourse(courseCodeInput: string): OperationResult {
    const code = courseCodeInput.trim().toUpperCase();
    const course = this.courses.get(code);
    if (!course) {
      return { ok: false, code: "UNKNOWN_COURSE", message: `Course code ${code || "(empty)"} was not found.` };
    }
    this.courses.delete(code);
    const beforeCount = this.registrations.length;
    this.registrations = this.registrations.filter((r) => r.courseCode !== code);
    const dropped = beforeCount - this.registrations.length;
    return {
      ok: true,
      code: "COURSE_REMOVED",
      message: `Removed course ${code} (${course.title})${dropped > 0 ? ` and cleared ${dropped} enrollment${dropped === 1 ? "" : "s"}` : ""}.`,
    };
  }

  register(studentIdInput: string, courseCodeInput: string): OperationResult {
    const studentId = studentIdInput.trim().toUpperCase();
    const courseCode = courseCodeInput.trim().toUpperCase();
    const student = this.students.get(studentId);
    const course = this.courses.get(courseCode);
    const violation = this.policy.validate(student, course, this.registrations);
    if (violation) return violation;

    this.registrations.push({
      studentId,
      courseCode,
      registeredAt: new Date().toISOString().slice(0, 10),
    });
    const remaining = this.getAvailableSeats(courseCode);
    return {
      ok: true,
      code: "REGISTERED",
      message: `Registered ${student!.name} (${studentId}) in ${courseCode}. ${remaining} seat${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  cancel(studentIdInput: string, courseCodeInput: string): OperationResult {
    const studentId = studentIdInput.trim().toUpperCase();
    const courseCode = courseCodeInput.trim().toUpperCase();
    const idx = this.registrations.findIndex(
      (r) => r.studentId === studentId && r.courseCode === courseCode,
    );
    if (idx === -1) {
      return {
        ok: false,
        code: "NOT_REGISTERED",
        message: `No active registration found for ${studentId || "unknown student"} in ${courseCode || "unknown course"}.`,
      };
    }
    this.registrations.splice(idx, 1);
    const remaining = this.getAvailableSeats(courseCode);
    return {
      ok: true,
      code: "CANCELLED",
      message: `Cancelled ${studentId} from ${courseCode}. ${remaining} seat${remaining === 1 ? "" : "s"} now available.`,
    };
  }

  getCourseRoster(courseCode: string): StudentRecord[] {
    const code = courseCode.toUpperCase();
    return this.registrations
      .filter((r) => r.courseCode === code)
      .map((r) => this.students.get(r.studentId))
      .filter((s): s is StudentRecord => Boolean(s));
  }

  getStudentCourses(studentId: string): CourseRecord[] {
    const id = studentId.toUpperCase();
    return this.registrations
      .filter((r) => r.studentId === id)
      .map((r) => this.courses.get(r.courseCode))
      .filter((c): c is CourseRecord => Boolean(c));
  }

  getAvailableSeats(courseCode: string): number {
    const course = this.courses.get(courseCode.toUpperCase());
    if (!course) return 0;
    const enrolled = this.registrations.filter((r) => r.courseCode === course.code).length;
    return Math.max(0, course.capacity - enrolled);
  }

  snapshot(): RegistrationState {
    return {
      students: Array.from(this.students.values()),
      courses: Array.from(this.courses.values()),
      registrations: [...this.registrations],
    };
  }
}

export const SAMPLE_STATE: RegistrationState = {
  students: [
    { id: "STU-101", name: "Furkan Yiğit Kaya", program: "Computer Science" },
    { id: "STU-102", name: "Esad Enis Arslan", program: "Cybersecurity" },
    { id: "STU-103", name: "Murat Tatlı", program: "Computer Science" },
    { id: "STU-104", name: "Oğuzhan Bakır", program: "Computer Science" },
  ],
  courses: [
    { code: "CS-201", title: "Object-Oriented Programming", capacity: 3 },
    { code: "CS-202", title: "Algorithms and Data Structures", capacity: 2 },
    { code: "SE-210", title: "Discrete Structures", capacity: 4 },
  ],
  registrations: [
    { studentId: "STU-101", courseCode: "CS-201", registeredAt: "2026-11-10" },
    { studentId: "STU-102", courseCode: "CS-201", registeredAt: "2026-11-11" },
    { studentId: "STU-101", courseCode: "CS-204", registeredAt: "2026-11-12" },
    { studentId: "STU-103", courseCode: "CS-204", registeredAt: "2026-11-12" },
  ],
};