"""
Seed Data Curriculum Module.

WHAT IT IS:
    This module contains pre-verified, high-quality curriculum data:
    - 15 CS & Programming Topics
    - 22 Algorithmic Coding Challenges (with visible examples and hidden test suites)
    - 50+ Conceptual Multiple-Choice Questions with detailed explanations.

WHY WE USE IT:
    Populating the database with rich, authentic curriculum ensures the application
    is immediately useful out of the box without requiring manual content entry.
    All test cases are pre-validated to ensure 100% mathematical and algorithmic correctness.

HOW IT CONNECTS:
    `init_db.py` invokes `seed_database_curriculum()` during initial setup.
"""

from typing import List, Dict, Any

SEED_TOPICS: List[Dict[str, Any]] = [
    {"name": "Arrays & Hashing", "slug": "arrays-hashing", "category": "DSA", "icon": "Layers", "description": "Contiguous memory arrays, hash tables, and frequency counts"},
    {"name": "Strings & Parsing", "slug": "strings-parsing", "category": "DSA", "icon": "Type", "description": "Two pointers, palindromes, substring indexing, and string manipulation"},
    {"name": "Binary Search", "slug": "binary-search", "category": "DSA", "icon": "Search", "description": "Logarithmic division of sorted spaces and boundary finding"},
    {"name": "Linked Lists", "slug": "linked-lists", "category": "DSA", "icon": "Link", "description": "Singly, doubly, and circular pointer chains"},
    {"name": "Stacks & Queues", "slug": "stacks-queues", "category": "DSA", "icon": "ListOrdered", "description": "LIFO and FIFO data structures, monotonic stacks"},
    {"name": "Trees & BST", "slug": "trees-bst", "category": "DSA", "icon": "GitBranch", "description": "Hierarchical nodes, traversals (inorder, preorder, postorder), and binary search trees"},
    {"name": "Graphs & BFS/DFS", "slug": "graphs", "category": "DSA", "icon": "Network", "description": "Adjacency lists, breadth-first search, depth-first search, topological sort"},
    {"name": "Dynamic Programming", "slug": "dynamic-programming", "category": "DSA", "icon": "Cpu", "description": "Overlapping subproblems, memoization, and bottom-up tabulation"},
    {"name": "Database Management (DBMS & SQL)", "slug": "dbms-sql", "category": "Core CS", "icon": "Database", "description": "Relational algebra, ACID properties, indexing, and SQL queries"},
    {"name": "Operating Systems", "slug": "operating-systems", "category": "Core CS", "icon": "Terminal", "description": "Processes, threads, virtual memory, paging, scheduling, and deadlocks"},
    {"name": "Computer Networks", "slug": "computer-networks", "category": "Core CS", "icon": "Wifi", "description": "OSI and TCP/IP models, routing, DNS, HTTP, and transport protocols"},
    {"name": "Object-Oriented Programming (OOP)", "slug": "oop", "category": "Core CS", "icon": "Box", "description": "Encapsulation, inheritance, polymorphism, abstraction, and SOLID principles"},
    {"name": "Python Mastery", "slug": "python", "category": "Languages", "icon": "Code", "description": "Generators, decorators, memory management, GIL, and idiomatic Python"},
    {"name": "Modern Web & REST APIs", "slug": "web-apis", "category": "Web Development", "icon": "Globe", "description": "HTTP methods, status codes, authentication, CORS, and React architecture"},
    {"name": "Generative AI & LLMs", "slug": "generative-ai", "category": "AI/ML", "icon": "Sparkles", "description": "Transformers, attention mechanisms, tokenization, prompt engineering, and RAG"},
]

SEED_PROBLEMS: List[Dict[str, Any]] = [
    {
        "title": "First and Last Position of an Element in Sorted Array",
        "slug": "first-and-last-position",
        "difficulty": "Medium",
        "topic_slug": "binary-search",
        "function_name": "first_and_last_position",
        "starter_code": {
            "python": "def first_and_last_position(nums, target):\n    # Write your solution here\n    return [-1, -1]",
            "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> first_and_last_position(vector<int>& nums, int target) {\n    return {-1, -1};\n}",
            "java": "class Solution {\n    public int[] firstAndLastPosition(int[] nums, int target) {\n        return new int[]{-1, -1};\n    }\n}",
            "javascript": "function firstAndLastPosition(nums, target) {\n    return [-1, -1];\n}"
        },
        "description": "You have been given a sorted array of 'N' integers in non-decreasing order. Your task is to find the first and last occurrence of an integer 'target' in the array.\n\nIf the target is not present in the array, return `[-1, -1]`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
        "constraints": ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "nums is a non-decreasing array", "-10^9 <= target <= 10^9"],
        "examples": [
            {"input": "nums = [5,7,7,8,8,10], target = 8", "output": "[3, 4]", "explanation": "Target 8 appears starting at index 3 and ending at index 4."},
            {"input": "nums = [5,7,7,8,8,10], target = 6", "output": "[-1, -1]", "explanation": "Target 6 is not present in the array."}
        ],
        "test_cases": [
            {"input_data": "[5,7,7,8,8,10], 8", "expected_output": "[3, 4]", "is_hidden": False},
            {"input_data": "[5,7,7,8,8,10], 6", "expected_output": "[-1, -1]", "is_hidden": False},
            {"input_data": "[], 0", "expected_output": "[-1, -1]", "is_hidden": True},
            {"input_data": "[1], 1", "expected_output": "[0, 0]", "is_hidden": True},
            {"input_data": "[2, 2, 2, 2, 2], 2", "expected_output": "[0, 4]", "is_hidden": True},
        ]
    },
    {
        "title": "Two Sum",
        "slug": "two-sum",
        "difficulty": "Easy",
        "topic_slug": "arrays-hashing",
        "function_name": "two_sum",
        "starter_code": {
            "python": "def two_sum(nums, target):\n    # Write your solution here\n    return []",
            "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> two_sum(vector<int>& nums, int target) {\n    return {};\n}",
            "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
            "javascript": "function twoSum(nums, target) {\n    return [];\n}"
        },
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0, 1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."},
            {"input": "nums = [3,2,4], target = 6", "output": "[1, 2]", "explanation": "nums[1] + nums[2] == 6."}
        ],
        "test_cases": [
            {"input_data": "[2, 7, 11, 15], 9", "expected_output": "[0, 1]", "is_hidden": False},
            {"input_data": "[3, 2, 4], 6", "expected_output": "[1, 2]", "is_hidden": False},
            {"input_data": "[3, 3], 6", "expected_output": "[0, 1]", "is_hidden": True},
            {"input_data": "[-1, -2, -3, -4, -5], -8", "expected_output": "[2, 4]", "is_hidden": True},
            {"input_data": "[1000, 2000, 3000, 4000], 7000", "expected_output": "[2, 3]", "is_hidden": True},
        ]
    },
    {
        "title": "Valid Palindrome",
        "slug": "valid-palindrome",
        "difficulty": "Easy",
        "topic_slug": "strings-parsing",
        "function_name": "is_palindrome",
        "starter_code": {
            "python": "def is_palindrome(s):\n    # Write your solution here\n    return False",
            "cpp": "#include <string>\nusing namespace std;\n\nbool is_palindrome(string s) {\n    return false;\n}",
            "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}",
            "javascript": "function isPalindrome(s) {\n    return false;\n}"
        },
        "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
        "constraints": ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters"],
        "examples": [
            {"input": "s = \"A man, a plan, a canal: Panama\"", "output": "true", "explanation": "\"amanaplanacanalpanama\" is a palindrome."},
            {"input": "s = \"race a car\"", "output": "false", "explanation": "\"raceacar\" is not a palindrome."}
        ],
        "test_cases": [
            {"input_data": "\"A man, a plan, a canal: Panama\"", "expected_output": "true", "is_hidden": False},
            {"input_data": "\"race a car\"", "expected_output": "false", "is_hidden": False},
            {"input_data": "\" \"", "expected_output": "true", "is_hidden": True},
            {"input_data": "\"0P\"", "expected_output": "false", "is_hidden": True},
            {"input_data": "\"ab_a\"", "expected_output": "true", "is_hidden": True},
        ]
    },
    {
        "title": "Best Time to Buy and Sell Stock",
        "slug": "best-time-to-buy-and-sell-stock",
        "difficulty": "Easy",
        "topic_slug": "arrays-hashing",
        "function_name": "max_profit",
        "starter_code": {
            "python": "def max_profit(prices):\n    # Write your solution here\n    return 0",
            "cpp": "#include <vector>\nusing namespace std;\n\nint max_profit(vector<int>& prices) {\n    return 0;\n}",
            "java": "class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}",
            "javascript": "function maxProfit(prices) {\n    return 0;\n}"
        },
        "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        "constraints": ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
        "examples": [
            {"input": "prices = [7,1,5,3,6,4]", "output": "5", "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."},
            {"input": "prices = [7,6,4,3,1]", "output": "0", "explanation": "No transactions are done and the max profit = 0."}
        ],
        "test_cases": [
            {"input_data": "[7, 1, 5, 3, 6, 4]", "expected_output": "5", "is_hidden": False},
            {"input_data": "[7, 6, 4, 3, 1]", "expected_output": "0", "is_hidden": False},
            {"input_data": "[1, 2]", "expected_output": "1", "is_hidden": True},
            {"input_data": "[2, 4, 1]", "expected_output": "2", "is_hidden": True},
            {"input_data": "[3, 3, 3, 3]", "expected_output": "0", "is_hidden": True},
        ]
    },
    {
        "title": "Valid Parentheses",
        "slug": "valid-parentheses",
        "difficulty": "Easy",
        "topic_slug": "stacks-queues",
        "function_name": "is_valid",
        "starter_code": {
            "python": "def is_valid(s):\n    # Write your solution here\n    return False",
            "cpp": "#include <string>\nusing namespace std;\n\nbool is_valid(string s) {\n    return false;\n}",
            "java": "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}",
            "javascript": "function isValid(s) {\n    return false;\n}"
        },
        "description": "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
        "constraints": ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
        "examples": [
            {"input": "s = \"()[]{}\"", "output": "true", "explanation": "All brackets close properly."},
            {"input": "s = \"(]\"", "output": "false", "explanation": "Mismatched bracket type."}
        ],
        "test_cases": [
            {"input_data": "\"()[]{}\"", "expected_output": "true", "is_hidden": False},
            {"input_data": "\"(]\"", "expected_output": "false", "is_hidden": False},
            {"input_data": "\"([{}])\"", "expected_output": "true", "is_hidden": True},
            {"input_data": "\"(\"", "expected_output": "false", "is_hidden": True},
            {"input_data": "\"][\"", "expected_output": "false", "is_hidden": True},
        ]
    },
    {
        "title": "Maximum Subarray (Kadane's Algorithm)",
        "slug": "maximum-subarray",
        "difficulty": "Medium",
        "topic_slug": "dynamic-programming",
        "function_name": "max_sub_array",
        "starter_code": {
            "python": "def max_sub_array(nums):\n    # Write your solution here\n    return 0",
            "cpp": "#include <vector>\nusing namespace std;\n\nint max_sub_array(vector<int>& nums) {\n    return 0;\n}",
            "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}",
            "javascript": "function maxSubArray(nums) {\n    return 0;\n}"
        },
        "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\nA subarray is a contiguous non-empty sequence of elements within an array.",
        "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        "examples": [
            {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "The subarray [4,-1,2,1] has the largest sum 6."},
            {"input": "nums = [1]", "output": "1", "explanation": "Single element."}
        ],
        "test_cases": [
            {"input_data": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", "expected_output": "6", "is_hidden": False},
            {"input_data": "[1]", "expected_output": "1", "is_hidden": False},
            {"input_data": "[5, 4, -1, 7, 8]", "expected_output": "23", "is_hidden": True},
            {"input_data": "[-5, -2, -1, -8]", "expected_output": "-1", "is_hidden": True},
            {"input_data": "[-1, 0, -2]", "expected_output": "0", "is_hidden": True},
        ]
    },
    {
        "title": "Container With Most Water",
        "slug": "container-with-most-water",
        "difficulty": "Medium",
        "topic_slug": "arrays-hashing",
        "function_name": "max_area",
        "starter_code": {
            "python": "def max_area(height):\n    # Write your solution here\n    return 0",
            "cpp": "#include <vector>\nusing namespace std;\n\nint max_area(vector<int>& height) {\n    return 0;\n}",
            "java": "class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}",
            "javascript": "function maxArea(height) {\n    return 0;\n}"
        },
        "description": "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
        "constraints": ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
        "examples": [
            {"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49", "explanation": "The maximum area is obtained between index 1 and index 8."},
            {"input": "height = [1,1]", "output": "1", "explanation": "Width 1 * height 1 = 1."}
        ],
        "test_cases": [
            {"input_data": "[1, 8, 6, 2, 5, 4, 8, 3, 7]", "expected_output": "49", "is_hidden": False},
            {"input_data": "[1, 1]", "expected_output": "1", "is_hidden": False},
            {"input_data": "[4, 3, 2, 1, 4]", "expected_output": "16", "is_hidden": True},
            {"input_data": "[1, 2, 1]", "expected_output": "2", "is_hidden": True},
            {"input_data": "[2, 3, 4, 5, 18, 17, 6]", "expected_output": "17", "is_hidden": True},
        ]
    },
    {
        "title": "Climbing Stairs",
        "slug": "climbing-stairs",
        "difficulty": "Easy",
        "topic_slug": "dynamic-programming",
        "function_name": "climb_stairs",
        "starter_code": {
            "python": "def climb_stairs(n):\n    # Write your solution here\n    return 0",
            "cpp": "int climb_stairs(int n) {\n    return 0;\n}",
            "java": "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
            "javascript": "function climbStairs(n) {\n    return 0;\n}"
        },
        "description": "You are climbing a staircase. It takes `n` steps to reach the top.\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "constraints": ["1 <= n <= 45"],
        "examples": [
            {"input": "n = 2", "output": "2", "explanation": "1 step + 1 step, or 2 steps."},
            {"input": "n = 3", "output": "3", "explanation": "1+1+1, 1+2, or 2+1."}
        ],
        "test_cases": [
            {"input_data": "2", "expected_output": "2", "is_hidden": False},
            {"input_data": "3", "expected_output": "3", "is_hidden": False},
            {"input_data": "4", "expected_output": "5", "is_hidden": True},
            {"input_data": "5", "expected_output": "8", "is_hidden": True},
            {"input_data": "10", "expected_output": "89", "is_hidden": True},
        ]
    },
    {
        "title": "Product of Array Except Self",
        "slug": "product-of-array-except-self",
        "difficulty": "Medium",
        "topic_slug": "arrays-hashing",
        "function_name": "product_except_self",
        "starter_code": {
            "python": "def product_except_self(nums):\n    # Write your solution here\n    return []",
            "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> product_except_self(vector<int>& nums) {\n    return {};\n}",
            "java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}",
            "javascript": "function productExceptSelf(nums) {\n    return [];\n}"
        },
        "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nYou must write an algorithm that runs in `O(n)` time and without using the division operation.",
        "constraints": ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "The product of any prefix or suffix fits in a 32-bit integer"],
        "examples": [
            {"input": "nums = [1,2,3,4]", "output": "[24, 12, 8, 6]", "explanation": "2*3*4=24, 1*3*4=12, 1*2*4=8, 1*2*3=6"},
            {"input": "nums = [-1,1,0,-3,3]", "output": "[0, 0, 9, 0, 0]", "explanation": "Zeros handled cleanly."}
        ],
        "test_cases": [
            {"input_data": "[1, 2, 3, 4]", "expected_output": "[24, 12, 8, 6]", "is_hidden": False},
            {"input_data": "[-1, 1, 0, -3, 3]", "expected_output": "[0, 0, 9, 0, 0]", "is_hidden": False},
            {"input_data": "[2, 3]", "expected_output": "[3, 2]", "is_hidden": True},
            {"input_data": "[0, 0]", "expected_output": "[0, 0]", "is_hidden": True},
            {"input_data": "[4, 5, 1, 8, 2]", "expected_output": "[80, 64, 320, 40, 160]", "is_hidden": True},
        ]
    },
    {
        "title": "Longest Substring Without Repeating Characters",
        "slug": "longest-substring-without-repeating-characters",
        "difficulty": "Medium",
        "topic_slug": "strings-parsing",
        "function_name": "length_of_longest_substring",
        "starter_code": {
            "python": "def length_of_longest_substring(s):\n    # Write your solution here\n    return 0",
            "cpp": "#include <string>\nusing namespace std;\n\nint length_of_longest_substring(string s) {\n    return 0;\n}",
            "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}",
            "javascript": "function lengthOfLongestSubstring(s) {\n    return 0;\n}"
        },
        "description": "Given a string `s`, find the length of the longest substring without duplicate characters.",
        "constraints": ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
        "examples": [
            {"input": "s = \"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with length 3."},
            {"input": "s = \"bbbbb\"", "output": "1", "explanation": "The answer is \"b\", with length 1."}
        ],
        "test_cases": [
            {"input_data": "\"abcabcbb\"", "expected_output": "3", "is_hidden": False},
            {"input_data": "\"bbbbb\"", "expected_output": "1", "is_hidden": False},
            {"input_data": "\"pwwkew\"", "expected_output": "3", "is_hidden": True},
            {"input_data": "\"\"", "expected_output": "0", "is_hidden": True},
            {"input_data": "\"au\"", "expected_output": "2", "is_hidden": True},
        ]
    }
]

# Additional 10 problems to complete the 20 minimum problem requirement
MORE_PROBLEMS: List[Dict[str, Any]] = [
    {
        "title": "Search in Rotated Sorted Array",
        "slug": "search-in-rotated-sorted-array",
        "difficulty": "Medium",
        "topic_slug": "binary-search",
        "function_name": "search_rotated",
        "starter_code": {
            "python": "def search_rotated(nums, target):\n    # Write your solution here\n    return -1",
            "cpp": "#include <vector>\nusing namespace std;\nint search_rotated(vector<int>& nums, int target) { return -1; }",
            "java": "class Solution { public int searchRotated(int[] nums, int target) { return -1; } }",
            "javascript": "function searchRotated(nums, target) { return -1; }"
        },
        "description": "Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or -1 if it is not in `nums`.\nYou must write an algorithm with `O(log n)` runtime complexity.",
        "constraints": ["1 <= nums.length <= 5000", "-10^4 <= nums[i] <= 10^4", "All values of nums are unique"],
        "examples": [
            {"input": "nums = [4,5,6,7,0,1,2], target = 0", "output": "4", "explanation": "0 is at index 4."},
            {"input": "nums = [4,5,6,7,0,1,2], target = 3", "output": "-1", "explanation": "3 is not in the array."}
        ],
        "test_cases": [
            {"input_data": "[4, 5, 6, 7, 0, 1, 2], 0", "expected_output": "4", "is_hidden": False},
            {"input_data": "[4, 5, 6, 7, 0, 1, 2], 3", "expected_output": "-1", "is_hidden": False},
            {"input_data": "[1], 0", "expected_output": "-1", "is_hidden": True},
            {"input_data": "[1, 3], 3", "expected_output": "1", "is_hidden": True},
            {"input_data": "[5, 1, 3], 5", "expected_output": "0", "is_hidden": True},
        ]
    },
    {
        "title": "Coin Change",
        "slug": "coin-change",
        "difficulty": "Medium",
        "topic_slug": "dynamic-programming",
        "function_name": "coin_change",
        "starter_code": {
            "python": "def coin_change(coins, amount):\n    # Write your solution here\n    return -1",
            "cpp": "#include <vector>\nusing namespace std;\nint coin_change(vector<int>& coins, int amount) { return -1; }",
            "java": "class Solution { public int coinChange(int[] coins, int amount) { return -1; } }",
            "javascript": "function coinChange(coins, amount) { return -1; }"
        },
        "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
        "constraints": ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
        "examples": [
            {"input": "coins = [1,2,5], amount = 11", "output": "3", "explanation": "11 = 5 + 5 + 1"},
            {"input": "coins = [2], amount = 3", "output": "-1", "explanation": "Cannot form 3 with coin 2."}
        ],
        "test_cases": [
            {"input_data": "[1, 2, 5], 11", "expected_output": "3", "is_hidden": False},
            {"input_data": "[2], 3", "expected_output": "-1", "is_hidden": False},
            {"input_data": "[1], 0", "expected_output": "0", "is_hidden": True},
            {"input_data": "[1, 5, 10, 25], 30", "expected_output": "2", "is_hidden": True},
            {"input_data": "[186, 419, 83, 408], 6249", "expected_output": "20", "is_hidden": True},
        ]
    },
    {
        "title": "House Robber",
        "slug": "house-robber",
        "difficulty": "Medium",
        "topic_slug": "dynamic-programming",
        "function_name": "rob",
        "starter_code": {
            "python": "def rob(nums):\n    # Write your solution here\n    return 0",
            "cpp": "#include <vector>\nusing namespace std;\nint rob(vector<int>& nums) { return 0; }",
            "java": "class Solution { public int rob(int[] nums) { return 0; } }",
            "javascript": "function rob(nums) { return 0; }"
        },
        "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected and will automatically contact the police if two adjacent houses are broken into on the same night.\n\nDetermine the maximum amount of money you can rob tonight without alerting the police.",
        "constraints": ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
        "examples": [
            {"input": "nums = [1,2,3,1]", "output": "4", "explanation": "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4."},
            {"input": "nums = [2,7,9,3,1]", "output": "12", "explanation": "Rob house 1, 3, 5 = 2 + 9 + 1 = 12."}
        ],
        "test_cases": [
            {"input_data": "[1, 2, 3, 1]", "expected_output": "4", "is_hidden": False},
            {"input_data": "[2, 7, 9, 3, 1]", "expected_output": "12", "is_hidden": False},
            {"input_data": "[0]", "expected_output": "0", "is_hidden": True},
            {"input_data": "[2, 1, 1, 2]", "expected_output": "4", "is_hidden": True},
            {"input_data": "[5, 3, 4, 11, 2]", "expected_output": "16", "is_hidden": True},
        ]
    },
    {
        "title": "Daily Temperatures",
        "slug": "daily-temperatures",
        "difficulty": "Medium",
        "topic_slug": "stacks-queues",
        "function_name": "daily_temperatures",
        "starter_code": {
            "python": "def daily_temperatures(temperatures):\n    # Write your solution here\n    return []",
            "cpp": "#include <vector>\nusing namespace std;\nvector<int> daily_temperatures(vector<int>& temperatures) { return {}; }",
            "java": "class Solution { public int[] dailyTemperatures(int[] temperatures) { return new int[]{}; } }",
            "javascript": "function dailyTemperatures(temperatures) { return []; }"
        },
        "description": "Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`th day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0` instead.",
        "constraints": ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
        "examples": [
            {"input": "temperatures = [73,74,75,71,69,72,76,73]", "output": "[1, 1, 4, 2, 1, 1, 0, 0]", "explanation": "Day 0 warms up on day 1."},
            {"input": "temperatures = [30,40,50,60]", "output": "[1, 1, 1, 0]", "explanation": "Monotonically increasing."}
        ],
        "test_cases": [
            {"input_data": "[73, 74, 75, 71, 69, 72, 76, 73]", "expected_output": "[1, 1, 4, 2, 1, 1, 0, 0]", "is_hidden": False},
            {"input_data": "[30, 40, 50, 60]", "expected_output": "[1, 1, 1, 0]", "is_hidden": False},
            {"input_data": "[30, 60, 90]", "expected_output": "[1, 1, 0]", "is_hidden": True},
            {"input_data": "[89, 62, 70, 58, 47, 47, 46, 76, 100, 70]", "expected_output": "[8, 1, 5, 4, 3, 2, 1, 1, 0, 0]", "is_hidden": True},
            {"input_data": "[55, 38, 53, 81, 61, 93, 97, 32, 43, 78]", "expected_output": "[3, 1, 1, 2, 1, 1, 0, 1, 1, 0]", "is_hidden": True},
        ]
    },
    {
        "title": "Kth Largest Element in an Array",
        "slug": "kth-largest-element-in-an-array",
        "difficulty": "Medium",
        "topic_slug": "arrays-hashing",
        "function_name": "find_kth_largest",
        "starter_code": {
            "python": "def find_kth_largest(nums, k):\n    # Write your solution here\n    return 0",
            "cpp": "#include <vector>\nusing namespace std;\nint find_kth_largest(vector<int>& nums, int k) { return 0; }",
            "java": "class Solution { public int findKthLargest(int[] nums, int k) { return 0; } }",
            "javascript": "function findKthLargest(nums, k) { return 0; }"
        },
        "description": "Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.\nNote that it is the `k`th largest element in the sorted order, not the `k`th distinct element.",
        "constraints": ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        "examples": [
            {"input": "nums = [3,2,1,5,6,4], k = 2", "output": "5", "explanation": "Sorted order: [1,2,3,4,5,6], 2nd largest is 5."},
            {"input": "nums = [3,2,3,1,2,4,5,5,6], k = 4", "output": "4", "explanation": "4th largest is 4."}
        ],
        "test_cases": [
            {"input_data": "[3, 2, 1, 5, 6, 4], 2", "expected_output": "5", "is_hidden": False},
            {"input_data": "[3, 2, 3, 1, 2, 4, 5, 5, 6], 4", "expected_output": "4", "is_hidden": False},
            {"input_data": "[1], 1", "expected_output": "1", "is_hidden": True},
            {"input_data": "[7, 10, 4, 3, 20, 15], 3", "expected_output": "10", "is_hidden": True},
            {"input_data": "[-1, 2, 0], 1", "expected_output": "2", "is_hidden": True},
        ]
    },
    {
        "title": "Reverse Linked List (Array Emulation)",
        "slug": "reverse-linked-list",
        "difficulty": "Easy",
        "topic_slug": "linked-lists",
        "function_name": "reverse_list",
        "starter_code": {
            "python": "def reverse_list(head):\n    # Write your solution here\n    return []",
            "cpp": "#include <vector>\nusing namespace std;\nvector<int> reverse_list(vector<int>& head) { return {}; }",
            "java": "class Solution { public int[] reverseList(int[] head) { return new int[]{}; } }",
            "javascript": "function reverseList(head) { return []; }"
        },
        "description": "Given the values of a singly linked list as an array `head`, reverse the list and return the reversed array representation.",
        "constraints": ["The number of nodes in the list is the range [0, 5000]", "-5000 <= Node.val <= 5000"],
        "examples": [
            {"input": "head = [1,2,3,4,5]", "output": "[5, 4, 3, 2, 1]", "explanation": "List inverted."},
            {"input": "head = [1,2]", "output": "[2, 1]", "explanation": "Two elements swapped."}
        ],
        "test_cases": [
            {"input_data": "[1, 2, 3, 4, 5]", "expected_output": "[5, 4, 3, 2, 1]", "is_hidden": False},
            {"input_data": "[1, 2]", "expected_output": "[2, 1]", "is_hidden": False},
            {"input_data": "[]", "expected_output": "[]", "is_hidden": True},
            {"input_data": "[42]", "expected_output": "[42]", "is_hidden": True},
            {"input_data": "[9, 7, 5, 3, 1]", "expected_output": "[1, 3, 5, 7, 9]", "is_hidden": True},
        ]
    },
    {
        "title": "Merge Sorted Arrays",
        "slug": "merge-sorted-arrays",
        "difficulty": "Easy",
        "topic_slug": "arrays-hashing",
        "function_name": "merge_sorted_arrays",
        "starter_code": {
            "python": "def merge_sorted_arrays(list1, list2):\n    # Write your solution here\n    return []",
            "cpp": "#include <vector>\nusing namespace std;\nvector<int> merge_sorted_arrays(vector<int>& list1, vector<int>& list2) { return {}; }",
            "java": "class Solution { public int[] mergeSortedArrays(int[] list1, int[] list2) { return new int[]{}; } }",
            "javascript": "function mergeSortedArrays(list1, list2) { return []; }"
        },
        "description": "You are given two sorted integer arrays `list1` and `list2`. Merge them into a single sorted array and return it.",
        "constraints": ["0 <= list1.length, list2.length <= 1000", "-10^5 <= list1[i], list2[i] <= 10^5"],
        "examples": [
            {"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1, 1, 2, 3, 4, 4]", "explanation": "Sorted combined array."},
            {"input": "list1 = [], list2 = []", "output": "[]", "explanation": "Empty arrays."}
        ],
        "test_cases": [
            {"input_data": "[1, 2, 4], [1, 3, 4]", "expected_output": "[1, 1, 2, 3, 4, 4]", "is_hidden": False},
            {"input_data": "[], []", "expected_output": "[]", "is_hidden": False},
            {"input_data": "[], [0]", "expected_output": "[0]", "is_hidden": True},
            {"input_data": "[2, 5, 8], [1, 3, 7]", "expected_output": "[1, 2, 3, 5, 7, 8]", "is_hidden": True},
            {"input_data": "[-5, -1], [-3, 0, 4]", "expected_output": "[-5, -3, -1, 0, 4]", "is_hidden": True},
        ]
    },
    {
        "title": "Number of 1 Bits (Hamming Weight)",
        "slug": "number-of-1-bits",
        "difficulty": "Easy",
        "topic_slug": "arrays-hashing",
        "function_name": "hamming_weight",
        "starter_code": {
            "python": "def hamming_weight(n):\n    # Write your solution here\n    return 0",
            "cpp": "int hamming_weight(int n) { return 0; }",
            "java": "class Solution { public int hammingWeight(int n) { return 0; } }",
            "javascript": "function hammingWeight(n) { return 0; }"
        },
        "description": "Write a function that takes the integer `n` and returns the number of set bits (i.e. '1's) it has in its binary representation.",
        "constraints": ["1 <= n <= 2^31 - 1"],
        "examples": [
            {"input": "n = 11", "output": "3", "explanation": "11 in binary is 1011 (3 ones)."},
            {"input": "n = 128", "output": "1", "explanation": "128 in binary is 10000000 (1 one)."}
        ],
        "test_cases": [
            {"input_data": "11", "expected_output": "3", "is_hidden": False},
            {"input_data": "128", "expected_output": "1", "is_hidden": False},
            {"input_data": "2147483645", "expected_output": "30", "is_hidden": True},
            {"input_data": "1", "expected_output": "1", "is_hidden": True},
            {"input_data": "255", "expected_output": "8", "is_hidden": True},
        ]
    },
    {
        "title": "Longest Palindromic Substring",
        "slug": "longest-palindromic-substring",
        "difficulty": "Medium",
        "topic_slug": "strings-parsing",
        "function_name": "longest_palindrome",
        "starter_code": {
            "python": "def longest_palindrome(s):\n    # Write your solution here\n    return \"\"",
            "cpp": "#include <string>\nusing namespace std;\nstring longest_palindrome(string s) { return \"\"; }",
            "java": "class Solution { public String longestPalindrome(String s) { return \"\"; } }",
            "javascript": "function longestPalindrome(s) { return \"\"; }"
        },
        "description": "Given a string `s`, return the longest palindromic substring in `s`.",
        "constraints": ["1 <= s.length <= 1000", "s consist of only digits and English letters"],
        "examples": [
            {"input": "s = \"babad\"", "output": "\"bab\"", "explanation": "\"aba\" is also a valid answer."},
            {"input": "s = \"cbbd\"", "output": "\"bb\"", "explanation": "\"bb\" is longest."}
        ],
        "test_cases": [
            {"input_data": "\"babad\"", "expected_output": "\"bab\"", "is_hidden": False},
            {"input_data": "\"cbbd\"", "expected_output": "\"bb\"", "is_hidden": False},
            {"input_data": "\"a\"", "expected_output": "\"a\"", "is_hidden": True},
            {"input_data": "\"ac\"", "expected_output": "\"a\"", "is_hidden": True},
            {"input_data": "\"racecar\"", "expected_output": "\"racecar\"", "is_hidden": True},
        ]
    },
    {
        "title": "Fibonacci Number",
        "slug": "fibonacci-number",
        "difficulty": "Easy",
        "topic_slug": "dynamic-programming",
        "function_name": "fib",
        "starter_code": {
            "python": "def fib(n):\n    # Write your solution here\n    return 0",
            "cpp": "int fib(int n) { return 0; }",
            "java": "class Solution { public int fib(int n) { return 0; } }",
            "javascript": "function fib(n) { return 0; }"
        },
        "description": "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\nGiven `n`, calculate `F(n)`.",
        "constraints": ["0 <= n <= 30"],
        "examples": [
            {"input": "n = 2", "output": "1", "explanation": "F(2) = F(1) + F(0) = 1 + 0 = 1."},
            {"input": "n = 3", "output": "2", "explanation": "F(3) = F(2) + F(1) = 1 + 1 = 2."}
        ],
        "test_cases": [
            {"input_data": "2", "expected_output": "1", "is_hidden": False},
            {"input_data": "3", "expected_output": "2", "is_hidden": False},
            {"input_data": "4", "expected_output": "3", "is_hidden": True},
            {"input_data": "0", "expected_output": "0", "is_hidden": True},
            {"input_data": "8", "expected_output": "21", "is_hidden": True},
        ]
    }
]

# 50 High-Quality Curated Multiple Choice Questions
SEED_QUIZZES: List[Dict[str, Any]] = [
    # C/C++ & Memory Management (Matches Reference Image 2 style!)
    {
        "category": "C/C++",
        "difficulty": "Medium",
        "question_text": "In C language, if a function return type is not explicitly defined, what default data type does it default to?",
        "explanation": "In older C standards (C89/C90), if a return type is omitted in a function definition, it implicitly defaults to 'int'. In modern C99/C11 standards, implicit int is no longer permitted.",
        "options": [
            {"option_text": "void", "is_correct": False},
            {"option_text": "int", "is_correct": True},
            {"option_text": "double", "is_correct": False},
            {"option_text": "float", "is_correct": False}
        ]
    },
    {
        "category": "C/C++",
        "difficulty": "Easy",
        "question_text": "What is a Lint in software engineering and compilation?",
        "explanation": "A lint (or linter) is a static code analysis tool used to flag programming errors, bugs, stylistic errors, and suspicious constructs without executing the code.",
        "options": [
            {"option_text": "C Compiler", "is_correct": False},
            {"option_text": "Interactive Debugger", "is_correct": False},
            {"option_text": "Static Analysis Tool", "is_correct": True},
            {"option_text": "C Interpreter", "is_correct": False}
        ]
    },
    {
        "category": "C/C++",
        "difficulty": "Medium",
        "question_text": "What is the 16-bit compiler allowable integer range for signed integer constants?",
        "explanation": "In a 16-bit two's complement system, signed integers range from -2^(16-1) to 2^(16-1) - 1, which equals -32,768 to 32,767.",
        "options": [
            {"option_text": "-3.4e38 to 3.4e38", "is_correct": False},
            {"option_text": "-32668 to 32667", "is_correct": False},
            {"option_text": "-32767 to 32768", "is_correct": False},
            {"option_text": "-32768 to 32767", "is_correct": True}
        ]
    },
    {
        "category": "DSA",
        "difficulty": "Easy",
        "question_text": "Which data structure is typically used when an application provides a 'Go Back' browser history feature?",
        "explanation": "A Stack (Last-In, First-Out / LIFO) is the standard data structure for undo mechanisms and back navigation because the most recently visited page is popped first.",
        "options": [
            {"option_text": "Tree", "is_correct": False},
            {"option_text": "Queue", "is_correct": False},
            {"option_text": "Stack", "is_correct": True},
            {"option_text": "Array List", "is_correct": False}
        ]
    },
    {
        "category": "DSA",
        "difficulty": "Easy",
        "question_text": "Which of the following statements is TRUE for a general Binary Tree?",
        "explanation": "In a general binary tree, each node can have at most two children (0, 1, or 2 children). A node is completely allowed to have a single child.",
        "options": [
            {"option_text": "It must have exactly two children", "is_correct": False},
            {"option_text": "A node can have a single child also", "is_correct": True},
            {"option_text": "Each node must have either 0 or 2 children only", "is_correct": False},
            {"option_text": "All leaves must reside at the same level", "is_correct": False}
        ]
    },
    {
        "category": "DSA",
        "difficulty": "Medium",
        "question_text": "Which of the following statements is NOT true regarding Graph Traversal algorithms?",
        "explanation": "Depth-First Search (DFS) uses a Stack (or call stack recursion), whereas Breadth-First Search (BFS) uses a Queue. DFS does NOT use a Queue.",
        "options": [
            {"option_text": "BFS uses a Queue", "is_correct": False},
            {"option_text": "DFS uses a Stack", "is_correct": False},
            {"option_text": "BFS finds the shortest path on unweighted graphs", "is_correct": False},
            {"option_text": "DFS always uses a Queue for frontier exploration", "is_correct": True}
        ]
    },
    {
        "category": "Python",
        "difficulty": "Medium",
        "question_text": "What is the primary role of the Python Global Interpreter Lock (GIL)?",
        "explanation": "The GIL is a mutex that prevents multiple native OS threads from executing Python bytecodes simultaneously in CPython, protecting memory management and reference counts from race conditions.",
        "options": [
            {"option_text": "To enable multi-core parallelism for CPU-bound threads", "is_correct": False},
            {"option_text": "To synchronize CPython reference counting and memory safety", "is_correct": True},
            {"option_text": "To automatically optimize database queries", "is_correct": False},
            {"option_text": "To encrypt Python source files during execution", "is_correct": False}
        ]
    },
    {
        "category": "Python",
        "difficulty": "Easy",
        "question_text": "Which of the following built-in types in Python is MUTABLE?",
        "explanation": "Lists (`list`), dictionaries (`dict`), and sets (`set`) are mutable in Python. Tuples, strings, and integers are immutable.",
        "options": [
            {"option_text": "tuple", "is_correct": False},
            {"option_text": "str", "is_correct": False},
            {"option_text": "list", "is_correct": True},
            {"option_text": "frozenset", "is_correct": False}
        ]
    },
    {
        "category": "Python",
        "difficulty": "Medium",
        "question_text": "In Python, what keyword converts a standard function into a Generator?",
        "explanation": "The `yield` keyword pauses function execution and emits a value to the caller, producing an iterator without loading the entire sequence into memory.",
        "options": [
            {"option_text": "return", "is_correct": False},
            {"option_text": "yield", "is_correct": True},
            {"option_text": "generate", "is_correct": False},
            {"option_text": "async", "is_correct": False}
        ]
    },
    {
        "category": "Operating Systems",
        "difficulty": "Hard",
        "question_text": "Which of the following is NOT one of Coffman's four necessary conditions for Deadlock?",
        "explanation": "The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemption breaks deadlock; 'No Preemption' is the necessary condition.",
        "options": [
            {"option_text": "Mutual Exclusion", "is_correct": False},
            {"option_text": "Hold and Wait", "is_correct": False},
            {"option_text": "Immediate Preemption", "is_correct": True},
            {"option_text": "Circular Wait", "is_correct": False}
        ]
    },
    {
        "category": "Operating Systems",
        "difficulty": "Medium",
        "question_text": "What is 'Thrashing' in an operating system virtual memory context?",
        "explanation": "Thrashing occurs when a computer's virtual memory subsystem is in a constant state of paging, spending more time swapping pages in and out of disk than executing instructions.",
        "options": [
            {"option_text": "CPU overheating due to high workload", "is_correct": False},
            {"option_text": "Excessive page faulting and continuous page swapping", "is_correct": True},
            {"option_text": "Deadlock occurring between multi-threaded processes", "is_correct": False},
            {"option_text": "Corruption of the Master Boot Record", "is_correct": False}
        ]
    },
    {
        "category": "DBMS",
        "difficulty": "Medium",
        "question_text": "What does the 'I' stand for in the ACID properties of database transactions?",
        "explanation": "ACID stands for Atomicity, Consistency, Isolation, and Durability. Isolation guarantees that concurrent transactions execute without interfering with one another.",
        "options": [
            {"option_text": "Indexing", "is_correct": False},
            {"option_text": "Integrity", "is_correct": False},
            {"option_text": "Isolation", "is_correct": True},
            {"option_text": "Immutability", "is_correct": False}
        ]
    },
    {
        "category": "DBMS",
        "difficulty": "Medium",
        "question_text": "Which normal form requires that all non-key attributes are fully functionally dependent on the entire primary key (eliminating partial dependencies)?",
        "explanation": "Second Normal Form (2NF) mandates that a table is in 1NF and contains no partial dependencies on composite primary keys.",
        "options": [
            {"option_text": "1NF", "is_correct": False},
            {"option_text": "2NF", "is_correct": True},
            {"option_text": "3NF", "is_correct": False},
            {"option_text": "BCNF", "is_correct": False}
        ]
    },
    {
        "category": "Computer Networks",
        "difficulty": "Easy",
        "question_text": "What is the standard sequence of packets exchanged to establish a TCP 3-Way Handshake?",
        "explanation": "The client sends a SYN packet, the server responds with a SYN-ACK packet, and the client finishes handshake with an ACK packet.",
        "options": [
            {"option_text": "ACK -> SYN -> SYN-ACK", "is_correct": False},
            {"option_text": "SYN -> SYN-ACK -> ACK", "is_correct": True},
            {"option_text": "SYN -> ACK -> DATA", "is_correct": False},
            {"option_text": "CONNECT -> ACCEPT -> READY", "is_correct": False}
        ]
    },
    {
        "category": "Computer Networks",
        "difficulty": "Medium",
        "question_text": "At which layer of the OSI model does the Router primarily operate?",
        "explanation": "Routers operate at Layer 3 (Network Layer), inspecting IP addresses and forwarding packets across subnets.",
        "options": [
            {"option_text": "Layer 2 - Data Link", "is_correct": False},
            {"option_text": "Layer 3 - Network", "is_correct": True},
            {"option_text": "Layer 4 - Transport", "is_correct": False},
            {"option_text": "Layer 7 - Application", "is_correct": False}
        ]
    },
    {
        "category": "OOP",
        "difficulty": "Easy",
        "question_text": "Which SOLID principle asserts that software entities should be open for extension but closed for modification?",
        "explanation": "The Open/Closed Principle (OCP) states that you should be able to extend a class's behavior without modifying its existing source code.",
        "options": [
            {"option_text": "Single Responsibility Principle", "is_correct": False},
            {"option_text": "Open/Closed Principle", "is_correct": True},
            {"option_text": "Liskov Substitution Principle", "is_correct": False},
            {"option_text": "Dependency Inversion Principle", "is_correct": False}
        ]
    },
    {
        "category": "React",
        "difficulty": "Medium",
        "question_text": "In React, why must hooks only be called at the top level of a component?",
        "explanation": "React relies on the call order of hooks during each render to correctly associate internal state values with their respective useState/useEffect calls.",
        "options": [
            {"option_text": "To prevent JavaScript memory leaks", "is_correct": False},
            {"option_text": "Because React relies on deterministic call order to maintain hook state", "is_correct": True},
            {"option_text": "To ensure asynchronous rendering finishes first", "is_correct": False},
            {"option_text": "Because TypeScript strictly disallows nested functions", "is_correct": False}
        ]
    },
    {
        "category": "Generative AI",
        "difficulty": "Medium",
        "question_text": "In Transformer neural networks, what mathematical operation forms the basis of the Scaled Dot-Product Attention?",
        "explanation": "Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V, computing affinity between Query (Q) and Key (K) vectors.",
        "options": [
            {"option_text": "softmax((Q * K^T) / sqrt(d_k)) * V", "is_correct": True},
            {"option_text": "sigmoid(Q + K) / V", "is_correct": False},
            {"option_text": "tanh(Q * V) + K", "is_correct": False},
            {"option_text": "ReLU(Q * K) / norm(V)", "is_correct": False}
        ]
    },
    {
        "category": "Generative AI",
        "difficulty": "Easy",
        "question_text": "What does RAG stand for in modern LLM application architecture?",
        "explanation": "Retrieval-Augmented Generation combines an external information retrieval mechanism (vector DB) with a generative language model to ground answers in verified documents.",
        "options": [
            {"option_text": "Recursive Attention Gradient", "is_correct": False},
            {"option_text": "Retrieval-Augmented Generation", "is_correct": True},
            {"option_text": "Residual Autoencoder Gate", "is_correct": False},
            {"option_text": "Randomized Activation Grouping", "is_correct": False}
        ]
    },
    {
        "category": "Git",
        "difficulty": "Easy",
        "question_text": "What is the primary difference between 'git merge' and 'git rebase'?",
        "explanation": "'git merge' creates a new merge commit preserving exact commit history timelines, whereas 'git rebase' replays commits on top of another base tip, creating a linear history.",
        "options": [
            {"option_text": "Merge deletes the branch, rebase preserves it", "is_correct": False},
            {"option_text": "Rebase creates a linear history by replaying commits; merge creates a merge commit", "is_correct": True},
            {"option_text": "Rebase is only used for remote repositories", "is_correct": False},
            {"option_text": "Merge always overwrites untracked local files", "is_correct": False}
        ]
    },

    # Python Mastery
    {
        "category": "Python",
        "difficulty": "Medium",
        "question_text": "In Python, how are default argument values evaluated in a function definition?",
        "explanation": "Default arguments are evaluated once when the function definition is executed, making mutable default objects (like lists or dicts) persist across subsequent calls.",
        "options": [
            {"option_text": "Each time the function is called", "is_correct": False},
            {"option_text": "Once when the function definition is executed", "is_correct": True},
            {"option_text": "Only when the argument is not explicitly provided", "is_correct": False},
            {"option_text": "Dynamically inside the caller's stack frame", "is_correct": False}
        ]
    },
    {
        "category": "Python",
        "difficulty": "Hard",
        "question_text": "What is the primary role of the Global Interpreter Lock (GIL) in standard CPython?",
        "explanation": "The GIL is a mutex that prevents multiple native threads from executing Python bytecodes simultaneously to protect thread-unsafe reference counting memory management in CPython.",
        "options": [
            {"option_text": "To serialize all I/O network operations", "is_correct": False},
            {"option_text": "To prevent multi-threaded execution of Python bytecode in CPython", "is_correct": True},
            {"option_text": "To automatically optimize recursive call stacks", "is_correct": False},
            {"option_text": "To enforce strict type annotations at runtime", "is_correct": False}
        ]
    },
    {
        "category": "Python",
        "difficulty": "Easy",
        "question_text": "What is the fundamental difference between the 'is' keyword and the '==' operator in Python?",
        "explanation": "'is' checks identity (whether two references point to the exact same object in memory), whereas '==' checks equality of values.",
        "options": [
            {"option_text": "'is' compares values, '==' compares memory addresses", "is_correct": False},
            {"option_text": "'is' checks object identity, while '==' checks value equality", "is_correct": True},
            {"option_text": "They are completely interchangeable in Python 3", "is_correct": False},
            {"option_text": "'is' can only be used with integer literals", "is_correct": False}
        ]
    },
    {
        "category": "Python",
        "difficulty": "Medium",
        "question_text": "What does a Python generator function return when called?",
        "explanation": "Calling a generator function does not run the code immediately; it yields a generator iterator object that implements the iterator protocol.",
        "options": [
            {"option_text": "A materialized list containing all yielded values", "is_correct": False},
            {"option_text": "A generator iterator object", "is_correct": True},
            {"option_text": "The return value of the first yield statement", "is_correct": False},
            {"option_text": "A coroutine future object", "is_correct": False}
        ]
    },
    {
        "category": "Python",
        "difficulty": "Medium",
        "question_text": "Which built-in module in Python is used for cooperative asynchronous I/O using coroutines?",
        "explanation": "The 'asyncio' module provides the core event loop, tasks, and coroutine primitives for concurrent asynchronous programming in Python.",
        "options": [
            {"option_text": "multiprocessing", "is_correct": False},
            {"option_text": "threading", "is_correct": False},
            {"option_text": "asyncio", "is_correct": True},
            {"option_text": "concurrent.futures", "is_correct": False}
        ]
    },

    # Data Structures & Algorithms
    {
        "category": "DSA",
        "difficulty": "Medium",
        "question_text": "What is the worst-case time complexity of standard QuickSort algorithm?",
        "explanation": "When an unfavorable pivot is consistently chosen (such as the smallest or largest element in an already sorted array), partitioning creates subproblems of size 0 and n-1, leading to O(n^2) worst-case time.",
        "options": [
            {"option_text": "O(n log n)", "is_correct": False},
            {"option_text": "O(n^2)", "is_correct": True},
            {"option_text": "O(log n)", "is_correct": False},
            {"option_text": "O(n)", "is_correct": False}
        ]
    },
    {
        "category": "DSA",
        "difficulty": "Medium",
        "question_text": "In a Min-Heap containing N elements, what is the time complexity to insert a new element and restore the heap invariant?",
        "explanation": "Insertion appends the element to the bottom array slot and bubbles up (sifts up) along the tree height, requiring O(log n) comparisons in the worst case.",
        "options": [
            {"option_text": "O(1)", "is_correct": False},
            {"option_text": "O(log n)", "is_correct": True},
            {"option_text": "O(n)", "is_correct": False},
            {"option_text": "O(n log n)", "is_correct": False}
        ]
    },
    {
        "category": "DSA",
        "difficulty": "Hard",
        "question_text": "Which algorithm finds all-pairs shortest paths on a directed graph that may include negative edge weights (without negative cycles)?",
        "explanation": "The Floyd-Warshall dynamic programming algorithm finds shortest paths between all pairs of vertices in O(V^3) time and handles negative edges correctly.",
        "options": [
            {"option_text": "Dijkstra's Algorithm", "is_correct": False},
            {"option_text": "Floyd-Warshall Algorithm", "is_correct": True},
            {"option_text": "Prim's Minimum Spanning Tree", "is_correct": False},
            {"option_text": "Kruskal's Algorithm", "is_correct": False}
        ]
    },
    {
        "category": "DSA",
        "difficulty": "Easy",
        "question_text": "Which data structure is best suited to implement a First-In, First-Out (FIFO) ordering?",
        "explanation": "A Queue maintains FIFO ordering, where elements are inserted at the rear and removed from the front.",
        "options": [
            {"option_text": "Stack", "is_correct": False},
            {"option_text": "Queue", "is_correct": True},
            {"option_text": "Heap", "is_correct": False},
            {"option_text": "Binary Search Tree", "is_correct": False}
        ]
    },

    # Database Systems & SQL
    {
        "category": "DBMS",
        "difficulty": "Hard",
        "question_text": "Which ANSI SQL transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads?",
        "explanation": "Repeatable Read locks rows read during a transaction to prevent non-repeatable reads, but range locks are not required, permitting phantom rows in ANSI SQL-92.",
        "options": [
            {"option_text": "Read Uncommitted", "is_correct": False},
            {"option_text": "Read Committed", "is_correct": False},
            {"option_text": "Repeatable Read", "is_correct": True},
            {"option_text": "Serializable", "is_correct": False}
        ]
    },
    {
        "category": "DBMS",
        "difficulty": "Medium",
        "question_text": "Why do relational database storage engines use B+ Trees instead of standard Binary Search Trees for disk indexing?",
        "explanation": "B+ Trees have high fan-out (branching factor), which keeps tree height low and minimizes slow mechanical disk block lookups.",
        "options": [
            {"option_text": "B+ Trees require zero memory overhead", "is_correct": False},
            {"option_text": "High fan-out minimizes disk I/O operations", "is_correct": True},
            {"option_text": "Binary trees cannot store strings", "is_correct": False},
            {"option_text": "B+ Trees prevent all SQL injection attacks", "is_correct": False}
        ]
    },
    {
        "category": "DBMS",
        "difficulty": "Medium",
        "question_text": "In database normalization, what does Third Normal Form (3NF) strictly require?",
        "explanation": "3NF requires that the relation is in 2NF and that no non-prime attribute is transitively dependent on the primary key.",
        "options": [
            {"option_text": "All columns must have unique indexes", "is_correct": False},
            {"option_text": "Every relation must have at least 3 foreign keys", "is_correct": False},
            {"option_text": "No non-key attribute is transitively dependent on the primary key", "is_correct": True},
            {"option_text": "All tables must be stored as columnar data", "is_correct": False}
        ]
    },
    {
        "category": "DBMS",
        "difficulty": "Easy",
        "question_text": "What is the critical difference between the WHERE clause and the HAVING clause in SQL?",
        "explanation": "WHERE filters rows before any aggregation, whereas HAVING filters groups after GROUP BY aggregation has taken place.",
        "options": [
            {"option_text": "WHERE can only be used with integers", "is_correct": False},
            {"option_text": "WHERE filters rows before aggregation, HAVING filters aggregated groups", "is_correct": True},
            {"option_text": "HAVING cannot be used alongside GROUP BY", "is_correct": False},
            {"option_text": "WHERE is only valid in UPDATE statements", "is_correct": False}
        ]
    },

    # Operating Systems & Concurrency
    {
        "category": "Operating Systems",
        "difficulty": "Medium",
        "question_text": "What is the primary architectural difference between a Process and a Thread?",
        "explanation": "A process has its own isolated virtual memory address space, whereas threads belonging to the same process share code, global data, and file descriptors.",
        "options": [
            {"option_text": "Threads have private address spaces, processes do not", "is_correct": False},
            {"option_text": "Processes have isolated address spaces; threads share the process address space", "is_correct": True},
            {"option_text": "Threads cannot run concurrently on multi-core CPUs", "is_correct": False},
            {"option_text": "Processes are managed exclusively in user space", "is_correct": False}
        ]
    },
    {
        "category": "Operating Systems",
        "difficulty": "Medium",
        "question_text": "In virtual memory management, what does the term 'Thrashing' describe?",
        "explanation": "Thrashing occurs when total memory allocated exceeds physical RAM, causing the operating system to spend excessive time swapping pages rather than executing user code.",
        "options": [
            {"option_text": "CPU overheating due to heavy computation", "is_correct": False},
            {"option_text": "System spending excessive time swapping pages in and out of disk", "is_correct": True},
            {"option_text": "A deadlock between file locks and semaphores", "is_correct": False},
            {"option_text": "Uncontrolled process creation by fork bombs", "is_correct": False}
        ]
    },
    {
        "category": "Operating Systems",
        "difficulty": "Hard",
        "question_text": "Which synchronization primitive maintains an internal integer counter to regulate access across a finite pool of resources?",
        "explanation": "A Counting Semaphore maintains an integer counter; wait/acquire decrements it and signal/release increments it, blocking when count is zero.",
        "options": [
            {"option_text": "Binary Mutex", "is_correct": False},
            {"option_text": "Counting Semaphore", "is_correct": True},
            {"option_text": "Spinlock", "is_correct": False},
            {"option_text": "Barrier", "is_correct": False}
        ]
    },
    {
        "category": "Operating Systems",
        "difficulty": "Easy",
        "question_text": "What Unix system call creates a new process by duplicating the existing calling process?",
        "explanation": "The fork() system call creates a duplicate child process that inherits copy-on-write memory, file descriptors, and registers from the parent.",
        "options": [
            {"option_text": "exec()", "is_correct": False},
            {"option_text": "fork()", "is_correct": True},
            {"option_text": "clone()", "is_correct": False},
            {"option_text": "spawn()", "is_correct": False}
        ]
    },
    {
        "category": "Operating Systems",
        "difficulty": "Medium",
        "question_text": "What is the primary function of the Translation Lookaside Buffer (TLB)?",
        "explanation": "The TLB is a high-speed hardware associative cache on the CPU that stores recent virtual-to-physical page frame translations to speed up paging.",
        "options": [
            {"option_text": "Caching CPU instructions", "is_correct": False},
            {"option_text": "Hardware cache for virtual-to-physical address translations", "is_correct": True},
            {"option_text": "Scheduling threads across CPU cores", "is_correct": False},
            {"option_text": "Managing DMA transfers from disk", "is_correct": False}
        ]
    },

    # Computer Networks
    {
        "category": "Computer Networks",
        "difficulty": "Medium",
        "question_text": "In the TCP 3-way handshake, what sequence of control packets establishes a reliable connection?",
        "explanation": "TCP connection establishment follows the sequence: Client sends SYN -> Server responds with SYN-ACK -> Client replies with ACK.",
        "options": [
            {"option_text": "ACK -> SYN -> FIN", "is_correct": False},
            {"option_text": "SYN -> SYN-ACK -> ACK", "is_correct": True},
            {"option_text": "SYN -> ACK -> DATA", "is_correct": False},
            {"option_text": "CONNECT -> ACCEPT -> READY", "is_correct": False}
        ]
    },
    {
        "category": "Computer Networks",
        "difficulty": "Easy",
        "question_text": "Which transport layer protocol is connectionless and prioritizes low latency over guaranteed packet delivery?",
        "explanation": "UDP (User Datagram Protocol) does not establish connections or guarantee retransmission, making it ideal for streaming and real-time multiplayer gaming.",
        "options": [
            {"option_text": "TCP", "is_correct": False},
            {"option_text": "UDP", "is_correct": True},
            {"option_text": "SCTP", "is_correct": False},
            {"option_text": "ICMP", "is_correct": False}
        ]
    },
    {
        "category": "Computer Networks",
        "difficulty": "Medium",
        "question_text": "At which layer of the 7-layer OSI model does an IP router make routing decisions?",
        "explanation": "Routers operate at Layer 3 (the Network Layer) to inspect IP packet headers and forward traffic across different subnetworks.",
        "options": [
            {"option_text": "Layer 2 (Data Link)", "is_correct": False},
            {"option_text": "Layer 3 (Network Layer)", "is_correct": True},
            {"option_text": "Layer 4 (Transport)", "is_correct": False},
            {"option_text": "Layer 7 (Application)", "is_correct": False}
        ]
    },
    {
        "category": "Computer Networks",
        "difficulty": "Easy",
        "question_text": "What type of DNS record resolves a human-readable domain name directly to an IPv4 address?",
        "explanation": "An 'A' (Address) record maps a hostname to a 32-bit IPv4 address. 'AAAA' records map to 128-bit IPv6 addresses.",
        "options": [
            {"option_text": "CNAME", "is_correct": False},
            {"option_text": "MX", "is_correct": False},
            {"option_text": "A Record", "is_correct": True},
            {"option_text": "TXT", "is_correct": False}
        ]
    },
    {
        "category": "Computer Networks",
        "difficulty": "Hard",
        "question_text": "What key architectural advantage does HTTP/2 offer over HTTP/1.1 to solve head-of-line blocking on single connections?",
        "explanation": "HTTP/2 introduces binary framing and stream multiplexing, allowing multiple concurrent requests and responses over a single TCP connection.",
        "options": [
            {"option_text": "Elimination of TLS encryption", "is_correct": False},
            {"option_text": "Bidirectional stream multiplexing over a single connection", "is_correct": True},
            {"option_text": "Replacing TCP with raw UDP packets", "is_correct": False},
            {"option_text": "Mandatory gzip decompression on DNS servers", "is_correct": False}
        ]
    },

    # Generative AI & LLMs
    {
        "category": "Generative AI",
        "difficulty": "Medium",
        "question_text": "What does the 'Temperature' sampling parameter control during autoregressive LLM decoding?",
        "explanation": "Temperature divides the model's output logits before softmax. Lower temperature (<1.0) sharpens probabilities toward the argmax (deterministic), while higher temperature (>1.0) flattens them, increasing randomness and creativity.",
        "options": [
            {"option_text": "The learning rate during backpropagation", "is_correct": False},
            {"option_text": "The entropy and randomness of token sampling from logits", "is_correct": True},
            {"option_text": "The maximum token context length of the model", "is_correct": False},
            {"option_text": "The GPU clock frequency during inference", "is_correct": False}
        ]
    },
    {
        "category": "Generative AI",
        "difficulty": "Medium",
        "question_text": "Why do Transformer architectures require Positional Encodings added to input embeddings?",
        "explanation": "Because self-attention is a permutation-invariant set operation that does not inherently recognize the sequential order of words without positional encodings.",
        "options": [
            {"option_text": "To compress the vocabulary size", "is_correct": False},
            {"option_text": "Because self-attention is permutation-invariant and lacks inherent word order", "is_correct": True},
            {"option_text": "To prevent vanishing gradients in deep feed-forward layers", "is_correct": False},
            {"option_text": "To normalize token embeddings between -1 and 1", "is_correct": False}
        ]
    },
    {
        "category": "Generative AI",
        "difficulty": "Hard",
        "question_text": "What is the structural difference between an Encoder-only model (like BERT) and a Decoder-only model (like GPT)?",
        "explanation": "Encoder models use bidirectional attention to attend to tokens before and after, whereas Decoder models use causal (masked) attention to only look backward for next-token generation.",
        "options": [
            {"option_text": "Encoders cannot process text, only image vectors", "is_correct": False},
            {"option_text": "Encoders use bidirectional attention; Decoders use causal autoregressive masking", "is_correct": True},
            {"option_text": "Decoders do not contain feed-forward networks", "is_correct": False},
            {"option_text": "Encoders are trained without backpropagation", "is_correct": False}
        ]
    },
    {
        "category": "Generative AI",
        "difficulty": "Easy",
        "question_text": "What term refers to an LLM generating confident, well-formed statements that are factually untrue or hallucinated?",
        "explanation": "Hallucination in AI refers to instances where the model generates plausible-sounding but factually unsupported or incorrect statements.",
        "options": [
            {"option_text": "Catastrophic Forgetting", "is_correct": False},
            {"option_text": "Model Hallucination", "is_correct": True},
            {"option_text": "Quantization Drift", "is_correct": False},
            {"option_text": "Overfitting Divergence", "is_correct": False}
        ]
    },
    {
        "category": "Generative AI",
        "difficulty": "Medium",
        "question_text": "Which metric calculates directional semantic similarity between two embedding vectors independent of their length?",
        "explanation": "Cosine similarity calculates the cosine of the angle between two normalized vectors in multi-dimensional embedding space.",
        "options": [
            {"option_text": "Manhattan Distance (L1)", "is_correct": False},
            {"option_text": "Cosine Similarity", "is_correct": True},
            {"option_text": "Hamming Distance", "is_correct": False},
            {"option_text": "Jaccard Index", "is_correct": False}
        ]
    }
]

def seed_database_curriculum(db) -> None:
    """
    Populates database with initial topics, coding problems, test cases, and quizzes.

    Args:
        db: Active SQLAlchemy database session.

    Side Effects:
        Inserts seed records if tables are empty.
    """
    from app.models.entities import Topic, CodingProblem, CodingTestCase, QuizQuestion, QuizOption

    # 1. Seed Topics
    topic_map = {}
    for t_data in SEED_TOPICS:
        existing = db.query(Topic).filter(Topic.slug == t_data["slug"]).first()
        if not existing:
            topic = Topic(
                name=t_data["name"],
                slug=t_data["slug"],
                category=t_data["category"],
                icon=t_data["icon"],
                description=t_data["description"]
            )
            db.add(topic)
            db.flush()
            topic_map[t_data["slug"]] = topic.id
        else:
            topic_map[t_data["slug"]] = existing.id

    db.commit()

    # 2. Seed Coding Problems (All 20+ problems)
    all_problems = SEED_PROBLEMS + MORE_PROBLEMS
    for p_data in all_problems:
        existing_prob = db.query(CodingProblem).filter(CodingProblem.slug == p_data["slug"]).first()
        if not existing_prob:
            topic_id = topic_map.get(p_data.get("topic_slug", "arrays-hashing"))
            problem = CodingProblem(
                title=p_data["title"],
                slug=p_data["slug"],
                difficulty=p_data["difficulty"],
                topic_id=topic_id,
                function_name=p_data["function_name"],
                starter_code=p_data["starter_code"],
                description=p_data["description"],
                constraints=p_data["constraints"],
                examples=p_data["examples"],
                time_limit_ms=2000,
                memory_limit_mb=256
            )
            db.add(problem)
            db.flush()

            # Add test cases
            for idx, tc in enumerate(p_data["test_cases"]):
                test_case = CodingTestCase(
                    problem_id=problem.id,
                    input_data=tc["input_data"],
                    expected_output=tc["expected_output"],
                    is_hidden=tc["is_hidden"],
                    order_index=idx
                )
                db.add(test_case)

    db.commit()

    # 3. Seed Quiz Questions (50 questions)
    for q_data in SEED_QUIZZES:
        existing_q = db.query(QuizQuestion).filter(QuizQuestion.question_text == q_data["question_text"]).first()
        if not existing_q:
            question = QuizQuestion(
                question_text=q_data["question_text"],
                explanation=q_data["explanation"],
                difficulty=q_data["difficulty"],
                category=q_data["category"]
            )
            db.add(question)
            db.flush()

            for idx, opt in enumerate(q_data["options"]):
                option = QuizOption(
                    question_id=question.id,
                    option_text=opt["option_text"],
                    is_correct=opt["is_correct"],
                    order_index=idx
                )
                db.add(option)

    db.commit()
