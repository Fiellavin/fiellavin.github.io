namespace StudentRecordsSystem;

public sealed record StudentRecord(
    int StudentId,
    string FullName,
    string Program,
    double Gpa,
    int Year)
{
    public static string? Validate(StudentRecord r)
    {
        if (r.StudentId is < 1000000 or > 9999999)
            return "StudentId must be a 7-digit integer (1000000-9999999).";
        if (string.IsNullOrWhiteSpace(r.FullName) || r.FullName.Trim().Length is < 2 or > 80)
            return "FullName must be 2-80 non-blank characters.";
        if (string.IsNullOrWhiteSpace(r.Program) || r.Program.Trim().Length is < 2 or > 60)
            return "Program must be 2-60 non-blank characters.";
        if (double.IsNaN(r.Gpa) || r.Gpa is < 0.0 or > 4.0)
            return "Gpa must be between 0.00 and 4.00.";
        if (r.Year is < 1 or > 4)
            return "Year must be between 1 and 4.";
        return null;
    }
}
