namespace StudentRecordsSystem;

public sealed class BinarySearchTree<TKey, TValue> where TKey : IComparable<TKey>
{
    private sealed class Node(TKey key, TValue value)
    {
        public TKey Key { get; set; } = key;
        public TValue Value { get; set; } = value;
        public Node? Left { get; set; }
        public Node? Right { get; set; }
    }

    private Node? _root;
    public int Count { get; private set; }

    public bool TryInsert(TKey key, TValue value)
    {
        if (_root is null)
        {
            _root = new Node(key, value);
            Count = 1;
            return true;
        }
        var current = _root;
        while (true)
        {
            int cmp = key.CompareTo(current.Key);
            if (cmp == 0) return false; // Duplicate key rejected
            if (cmp < 0)
            {
                if (current.Left is null) { current.Left = new Node(key, value); Count++; return true; }
                current = current.Left;
            }
            else
            {
                if (current.Right is null) { current.Right = new Node(key, value); Count++; return true; }
                current = current.Right;
            }
        }
    }

    public bool TrySearch(TKey key, out TValue? value, out int comparisons)
    {
        comparisons = 0;
        var current = _root;
        while (current is not null)
        {
            comparisons++;
            int cmp = key.CompareTo(current.Key);
            if (cmp == 0) { value = current.Value; return true; }
            current = cmp < 0 ? current.Left : current.Right;
        }
        value = default;
        return false;
    }

    public bool TryUpdate(TKey key, TValue updatedValue)
    {
        var current = _root;
        while (current is not null)
        {
            int cmp = key.CompareTo(current.Key);
            if (cmp == 0) { current.Value = updatedValue; return true; }
            current = cmp < 0 ? current.Left : current.Right;
        }
        return false;
    }

    public bool Remove(TKey key)
    {
        bool removed = false;
        _root = RemoveNode(_root, key, ref removed);
        if (removed) Count--;
        return removed;
    }

    private static Node? RemoveNode(Node? node, TKey key, ref bool removed)
    {
        if (node is null) return null;
        int cmp = key.CompareTo(node.Key);
        if (cmp < 0) { node.Left = RemoveNode(node.Left, key, ref removed); return node; }
        if (cmp > 0) { node.Right = RemoveNode(node.Right, key, ref removed); return node; }

        removed = true;
        if (node.Left is null) return node.Right;
        if (node.Right is null) return node.Left;

        // Two children: replace with in-order successor (minimum in right subtree)
        var successor = node.Right;
        while (successor.Left is not null) successor = successor.Left;
        node.Key = successor.Key;
        node.Value = successor.Value;
        bool dummy = false;
        node.Right = RemoveNode(node.Right, successor.Key, ref dummy);
        return node;
    }

    public List<TValue> InOrder()
    {
        var result = new List<TValue>(Count);
        Traverse(_root, result);
        return result;
    }

    private static void Traverse(Node? node, List<TValue> acc)
    {
        if (node is null) return;
        Traverse(node.Left, acc);
        acc.Add(node.Value);
        Traverse(node.Right, acc);
    }

    public int Height() => GetHeight(_root);
    private static int GetHeight(Node? n) => n is null ? 0 : 1 + Math.Max(GetHeight(n.Left), GetHeight(n.Right));
}
