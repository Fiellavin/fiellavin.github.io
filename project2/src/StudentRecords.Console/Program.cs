using StudentRecordsSystem;

var bst = CaseStudy.LoadSample();
Console.WriteLine($"Loaded {bst.Count} fictional records (Height = {bst.Height()}).");
Console.WriteLine("In-order listing (sorted by StudentId):");
foreach (var r in bst.InOrder())
    Console.WriteLine($"  {r.StudentId} | {r.FullName,-16} | {r.Program,-20} | GPA {r.Gpa:F2} | Y{r.Year}");

Console.WriteLine("\nRunning Case Study Tests:");
var results = CaseStudy.RunTests();
foreach (var (name, ok) in results)
    Console.WriteLine($"[{(ok ? "PASS" : "FAIL")}] {name}");
Console.WriteLine($"\nSummary: {results.Count(r => r.Passed)}/{results.Count} tests passed.");
