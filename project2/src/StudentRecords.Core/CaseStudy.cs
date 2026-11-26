namespace StudentRecordsSystem;

public static class CaseStudy
{
    public static StudentRecord[] Sample() =>
    [
        new(2026050, "Furkan Yiğit Kaya", "Computer Science", 3.85, 2),
        new(2026025, "Esad Enis Arslan", "Cybersecurity", 3.42, 1),
        new(2026075, "Murat Tatlı", "Computer Science", 3.91, 3),
        new(2026012, "Oğuzhan Bakır", "Cybersecurity", 3.15, 1),
        new(2026038, "Ahmet Bahadır Demirdağ* ", "Computer Science", 3.68, 2),
    ];

    public static BinarySearchTree<int, StudentRecord> LoadSample()
    {
        var bst = new BinarySearchTree<int, StudentRecord>();
        foreach (var s in Sample())
            if (StudentRecord.Validate(s) is null) bst.TryInsert(s.StudentId, s);
        return bst;
    }

    public static List<(string Name, bool Passed)> RunTests()
    {
        var sample = Sample();
        var bst = LoadSample();
        var results = new List<(string, bool)>();
        void Check(string name, bool condition) => results.Add((name, condition));

        Check("T1 Search existing (2026038)", bst.TrySearch(2026038, out var f1, out _) && f1?.FullName == "Ahmet Bahadır Demirdağ");
        Check("T2 Reject duplicate ID (2026050)", !bst.TryInsert(2026050, sample[0]));
        Check("T3 Unknown ID search & delete", !bst.TrySearch(2026999, out _, out _) && !bst.Remove(2026999));
        Check("T4 Reject invalid GPA (4.5)", StudentRecord.Validate(new(2026101, "Valid", "CS", 4.5, 2)) is not null);
        Check("T5 Update existing (2026025)", bst.TryUpdate(2026025, sample[1] with { Gpa = 3.78 }) && bst.TrySearch(2026025, out var f5, out _) && f5?.Gpa == 3.78);
        Check("T6 Delete leaf (2026012)", bst.Remove(2026012) && bst.Count == 6);
        Check("T7 Delete one-child (2026025)", bst.Remove(2026025) && bst.TrySearch(2026038, out _, out _));
        Check("T8 Delete two-children root (2026050)", bst.Remove(2026050) && bst.Count == 4);
        var sortedIds = bst.InOrder().Select(r => r.StudentId).ToList();
        Check("T9 In-order sorted invariant", sortedIds.SequenceEqual(sortedIds.OrderBy(x => x)));
        var skewed = new BinarySearchTree<int, StudentRecord>();
        for (int i = 1; i <= 5; i++) skewed.TryInsert(2026000 + i, new(2026000 + i, $"Student {i}", "CS", 3.5, 1));
        Check("T10 Skewed BST height = n (O(n) worst case)", skewed.Height() == 5);
        return results;
    }
}
