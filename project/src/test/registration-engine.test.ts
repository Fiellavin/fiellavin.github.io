import { describe, expect, it } from "vitest";
import { CourseRegistrationSystem, SAMPLE_STATE } from "../lib/registration-engine";

describe("CourseRegistrationSystem business rules", () => {
  it("registers an eligible student and decrements available seats", () => {
    const sys = new CourseRegistrationSystem(SAMPLE_STATE);
    const res = sys.register("STU-104", "CS-201");
    expect(res.ok).toBe(true);
    expect(res.code).toBe("REGISTERED");
    expect(sys.getAvailableSeats("CS-201")).toBe(0);
  });

  it("rejects duplicate registrations without altering capacity", () => {
    const sys = new CourseRegistrationSystem(SAMPLE_STATE);
    const beforeSeats = sys.getAvailableSeats("CS-201");
    const res = sys.register("STU-101", "CS-201");
    expect(res.ok).toBe(false);
    expect(res.code).toBe("DUPLICATE_REGISTRATION");
    expect(sys.getAvailableSeats("CS-201")).toBe(beforeSeats);
  });

  it("rejects registration into a full course without altering state", () => {
    const sys = new CourseRegistrationSystem(SAMPLE_STATE);
    const res = sys.register("STU-104", "CS-204");
    expect(res.ok).toBe(false);
    expect(res.code).toBe("COURSE_FULL");
    expect(sys.getAvailableSeats("CS-204")).toBe(0);
  });

  it("rejects unknown student or unknown course", () => {
    const sys = new CourseRegistrationSystem(SAMPLE_STATE);
    expect(sys.register("STU-999", "CS-201").code).toBe("UNKNOWN_STUDENT");
    expect(sys.register("STU-101", "ZZ-999").code).toBe("UNKNOWN_COURSE");
  });

  it("cancels an active registration and restores available capacity", () => {
    const sys = new CourseRegistrationSystem(SAMPLE_STATE);
    const res = sys.cancel("STU-101", "CS-204");
    expect(res.ok).toBe(true);
    expect(res.code).toBe("CANCELLED");
    expect(sys.getAvailableSeats("CS-204")).toBe(1);
  });

  it("rejects cancelling a non-existent registration without altering capacity", () => {
    const sys = new CourseRegistrationSystem(SAMPLE_STATE);
    const beforeSeats = sys.getAvailableSeats("SE-210");
    const res = sys.cancel("STU-104", "SE-210");
    expect(res.ok).toBe(false);
    expect(res.code).toBe("NOT_REGISTERED");
    expect(sys.getAvailableSeats("SE-210")).toBe(beforeSeats);
  });

  it("validates unique IDs and positive integer capacity", () => {
    const sys = new CourseRegistrationSystem(SAMPLE_STATE);
    expect(sys.addStudent("STU-101", "Dup", "CS").code).toBe("DUPLICATE_ID");
    expect(sys.addCourse("CS-400", "Bad Cap", 0).code).toBe("INVALID_INPUT");
    expect(sys.addCourse("CS-400", "Neg Cap", -2).code).toBe("INVALID_INPUT");
    expect(sys.addCourse("CS-400", "Valid", 5).ok).toBe(true);
  });

  it("removes a student and frees their occupied seats", () => {
    const sys = new CourseRegistrationSystem(SAMPLE_STATE);
    expect(sys.getAvailableSeats("CS-204")).toBe(0);
    const res = sys.removeStudent("STU-101");
    expect(res.ok).toBe(true);
    expect(res.code).toBe("STUDENT_REMOVED");
    expect(sys.snapshot().students.some((s) => s.id === "STU-101")).toBe(false);
    expect(sys.getAvailableSeats("CS-204")).toBe(1);
    expect(sys.removeStudent("STU-101").code).toBe("UNKNOWN_STUDENT");
  });

  it("removes a course and clears its registrations", () => {
    const sys = new CourseRegistrationSystem(SAMPLE_STATE);
    const res = sys.removeCourse("CS-204");
    expect(res.ok).toBe(true);
    expect(res.code).toBe("COURSE_REMOVED");
    expect(sys.snapshot().courses.some((c) => c.code === "CS-204")).toBe(false);
    expect(sys.snapshot().registrations.some((r) => r.courseCode === "CS-204")).toBe(false);
    expect(sys.removeCourse("CS-204").code).toBe("UNKNOWN_COURSE");
  });
});