import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Play,
  RotateCcw,
  Save,
  Download,
  Copy,
  Terminal,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
  User,
  GraduationCap,
  Users,
  ShieldCheck,
  ChevronDown,
  Moon,
  Sun,
  FolderGit2
} from 'lucide-react';

const BOILERPLATES = {
  javascript: `// JavaScript (Node.js) Interactive Sandbox
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log("=== EduPulse Code Sandbox ===");
const numbers = [2, 7, 11, 15];
const target = 9;
console.log("Input Array:", numbers);
console.log("Target:", target);
console.log("Solution Indices:", twoSum(numbers, target));
`,
  python: `# Python 3 Execution Environment
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

if __name__ == "__main__":
    print("=== EduPulse Python 3 Runtime ===")
    data = [10, 23, 35, 42, 59, 72, 88, 99]
    search_target = 42
    index = binary_search(data, search_target)
    print(f"Data: {data}")
    print(f"Searching for: {search_target}")
    print(f"Found at index: {index}")
`,
  typescript: `// TypeScript Environment
interface StudentPerformance {
  name: string;
  mockTests: number;
  codingScore: number;
  attendance: number;
  calculateStanding(): number;
}

const student: StudentPerformance = {
  name: "Alex Chen",
  mockTests: 92,
  codingScore: 98,
  attendance: 95,
  calculateStanding() {
    // EduPulse 40/25/20/15 weighted algorithm
    return (this.mockTests * 0.40) + (this.codingScore * 0.25) + (this.attendance * 0.15) + (90 * 0.20);
  }
};

console.log(\`Student: \${student.name}\`);
console.log(\`Overall Standing: \${student.calculateStanding().toFixed(1)}%\`);
`,
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::cout << "=== EduPulse C++17 Environment ===" << std::endl;
    std::vector<int> scores = {85, 92, 78, 96, 88};
    
    std::sort(scores.begin(), scores.end());
    std::cout << "Sorted scores: ";
    for (int s : scores) {
        std::cout << s << " ";
    }
    std::cout << "\\nHighest score: " << scores.back() << std::endl;
    return 0;
}
`,
  c: `#include <stdio.h>

int main() {
    printf("=== EduPulse C Compiler ===\\n");
    int fib[10];
    fib[0] = 0;
    fib[1] = 1;
    for (int i = 2; i < 10; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];
    }
    
    printf("First 10 Fibonacci numbers:\\n");
    for (int i = 0; i < 10; i++) {
        printf("%d ", fib[i]);
    }
    printf("\\n");
    return 0;
}
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== EduPulse Java Engine ===");
        List<String> modules = Arrays.asList("Data Structures", "Algorithms", "AI Mentorship", "Web Dev");
        System.out.println("Total Modules: " + modules.size());
        for (String m : modules) {
            System.out.println(" - " + m);
        }
    }
}
`,
  go: `package main

import (
    "fmt"
    "time"
)

func main() {
    fmt.Println("=== EduPulse Go Microservice Runtime ===")
    fmt.Println("Current Server Time:", time.Now().Format(time.RFC3339))
    tasks := []string{"Synthesize Missed Notes", "Evaluate ATS Score", "Award Bonus Coins"}
    for i, t := range tasks {
        fmt.Printf("[%d] Running task: %s\\n", i+1, t)
    }
}
`,
  rust: `fn main() {
    println!("=== EduPulse Rust Safe Sandbox ===");
    let mut matrix = vec![vec![1, 2], vec![3, 4]];
    let sum: i32 = matrix.iter().flatten().sum();
    println!("Matrix: {:?}", matrix);
    println!("Flattened Sum: {}", sum);
}
`,
  php: `<?php
echo "=== EduPulse PHP Engine ===\\n";
$student = [
    "name" => "Alex Chen",
    "coins" => 350,
    "solved" => 28
];
print_r($student);
?>
`,
  ruby: `puts "=== EduPulse Ruby Sandbox ==="
grades = [94, 88, 76, 99, 85]
puts "Student Grades: #{grades.inspect}"
puts "Median Grade: #{grades.sort[grades.length / 2]}"
`,
  kotlin: `fun main() {
    println("=== EduPulse Kotlin Environment ===")
    val courses = listOf("Full Stack", "Data Science", "Cloud Architecture")
    println("Available Courses: \${courses.joinToString(", ")}")
}
`,
  swift: `import Foundation

print("=== EduPulse Swift Engine ===")
let numbers = [5, 2, 8, 1, 9]
let sortedNumbers = numbers.sorted()
print("Sorted Array: \\(sortedNumbers)")
`,
  sql: `-- EduPulse SQL Query Sandbox
SELECT 
    'Alex Chen' AS student_name,
    'Computer Science' AS major,
    94.5 AS weighted_standing,
    350 AS coins_balance;
`
};

const CODE_PRESETS = [
  { label: 'Two Sum Algorithm (JS)', lang: 'javascript', code: BOILERPLATES.javascript },
  { label: 'Binary Search (Python)', lang: 'python', code: BOILERPLATES.python },
  { label: 'Weighted Standing Algorithm (TS)', lang: 'typescript', code: BOILERPLATES.typescript },
  { label: 'Vector Sorting (C++)', lang: 'cpp', code: BOILERPLATES.cpp },
  { label: 'Fibonacci Sequence (C)', lang: 'c', code: BOILERPLATES.c },
  { label: 'List Processing (Java)', lang: 'java', code: BOILERPLATES.java },
  { label: 'Microservice Tasks (Go)', lang: 'go', code: BOILERPLATES.go },
  { label: 'Safe Matrix Sum (Rust)', lang: 'rust', code: BOILERPLATES.rust },
  { label: 'SQL Telemetry Query (SQL)', lang: 'sql', code: BOILERPLATES.sql }
];

export function EditorPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(BOILERPLATES.javascript);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [activeTab, setActiveTab] = useState('output'); // 'output' or 'stdin'
  const [copied, setCopied] = useState(false);

  // Project saving modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Handle Ctrl+Enter to execute
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, stdin]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(BOILERPLATES[newLang] || '// Write your code here');
    setOutput(null);
  };

  const handlePresetSelect = (preset) => {
    setLanguage(preset.lang);
    setCode(preset.code);
    setOutput(null);
  };

  const handleReset = () => {
    setCode(BOILERPLATES[language] || '// Write your code here');
    setOutput(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      typescript: 'ts',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      kotlin: 'kt',
      swift: 'swift',
      sql: 'sql'
    };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edupulse_solution.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRun = async () => {
    setRunning(true);
    setActiveTab('output');
    setOutput(null);

    try {
      const res = await api.post('/code/run', {
        language,
        code,
        stdin
      });
      setOutput(res.data);
    } catch (err) {
      setOutput({
        stderr: err.response?.data?.error || err.message,
        status: 'Execution Error',
        time: '0.00'
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSaveMessage('Please sign in to save your code to cloud projects.');
      return;
    }
    setSaving(true);
    setSaveMessage('');

    try {
      await api.post('/projects', {
        title: projectTitle || `Project - ${new Date().toLocaleDateString()}`,
        description: projectDescription,
        language,
        code
      });
      setSaveMessage('Project successfully saved to your portfolio!');
      setTimeout(() => {
        setSaveModalOpen(false);
        setSaveMessage('');
      }, 1500);
    } catch (err) {
      setSaveMessage(err.response?.data?.error || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Main Navigation */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">EduPulse</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                EDITOR
              </span>
            </div>
          </Link>

          {/* Quick links to role portals */}
          <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-800 text-xs">
            <Link
              to="/login/student"
              className="px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Student Portal</span>
            </Link>
            <Link
              to="/login/faculty"
              className="px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Faculty Portal</span>
            </Link>
            <Link
              to="/login/admin"
              className="px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

        {/* Right Session / Navigation State */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2.5">
              <Link
                to={`/${user.role}/dashboard`}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
              >
                <span>My Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 flex items-center justify-center font-bold text-xs">
                  {user.name?.slice(0, 1)}
                </div>
                <span className="text-xs text-slate-300 font-medium">{user.name}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* IDE Toolbar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400">Language:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer"
            >
              <option value="javascript" className="bg-slate-900">JavaScript (Node.js)</option>
              <option value="python" className="bg-slate-900">Python 3</option>
              <option value="typescript" className="bg-slate-900">TypeScript</option>
              <option value="cpp" className="bg-slate-900">C++ (GCC)</option>
              <option value="c" className="bg-slate-900">C</option>
              <option value="java" className="bg-slate-900">Java</option>
              <option value="go" className="bg-slate-900">Go</option>
              <option value="rust" className="bg-slate-900">Rust</option>
              <option value="php" className="bg-slate-900">PHP</option>
              <option value="ruby" className="bg-slate-900">Ruby</option>
              <option value="kotlin" className="bg-slate-900">Kotlin</option>
              <option value="swift" className="bg-slate-900">Swift</option>
              <option value="sql" className="bg-slate-900">SQL</option>
            </select>
          </div>

          {/* Quick Algorithms Preset Selector */}
          <div className="hidden md:flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <select
              onChange={(e) => {
                const selected = CODE_PRESETS.find(p => p.label === e.target.value);
                if (selected) handlePresetSelect(selected);
              }}
              defaultValue=""
              className="bg-transparent text-slate-300 outline-none cursor-pointer text-xs"
            >
              <option value="" disabled className="bg-slate-900">Load Algorithm Template...</option>
              {CODE_PRESETS.map((p) => (
                <option key={p.label} value={p.label} className="bg-slate-900">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Template */}
          <button
            onClick={handleReset}
            title="Reset code boilerplate"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            title="Copy Code"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition relative"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download Code */}
          <button
            onClick={handleDownload}
            title="Download Code File"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
            title="Toggle Editor Theme"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            {editorTheme === 'vs-dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>

        {/* Action Buttons: Save & Run */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
              } else {
                setSaveModalOpen(true);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isAuthenticated ? 'Save Project' : 'Sign in to Save'}</span>
          </button>

          <button
            onClick={handleRun}
            disabled={running}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{running ? 'Running...' : 'Run Code'}</span>
            <span className="hidden sm:inline text-[10px] opacity-75 font-mono ml-1">(Ctrl+Enter)</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Monaco Editor, Right Output/Console */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[500px]">
        {/* Left Side: Monaco Editor (7 cols on lg) */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col h-[50vh] lg:h-auto">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === 'sql' ? 'sql' : language === 'cpp' || language === 'c' ? 'cpp' : language}
              theme={editorTheme}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 2,
                cursorBlinking: 'smooth',
                smoothScrolling: true
              }}
            />
          </div>
        </div>

        {/* Right Side: Execution Console & I/O (5 cols on lg) */}
        <div className="lg:col-span-5 bg-slate-950 flex flex-col h-[50vh] lg:h-auto">
          {/* Console Header Tabs */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('output')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center space-x-1.5 ${
                  activeTab === 'output'
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console Output</span>
              </button>

              <button
                onClick={() => setActiveTab('stdin')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center space-x-1.5 ${
                  activeTab === 'stdin'
                    ? 'bg-slate-800 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Input (stdin)</span>
                {stdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
            </div>

            {/* Clear button */}
            {output && activeTab === 'output' && (
              <button
                onClick={() => setOutput(null)}
                className="text-[11px] text-slate-400 hover:text-white transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Console Body */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
            {activeTab === 'stdin' ? (
              <div className="h-full flex flex-col">
                <label className="text-slate-400 text-[11px] mb-2 font-sans">
                  Standard Input (passed to the execution runtime before start):
                </label>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter inputs here (e.g. numbers, words separated by space or newlines)..."
                  className="flex-1 w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono resize-none focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div>
                {running ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs">Compiling & executing code sandbox...</p>
                  </div>
                ) : output ? (
                  <div className="space-y-4">
                    {/* Execution Meta Pill */}
                    <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-800">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          output.status === 'Accepted' || output.status === 'Executed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {output.status || 'Finished'}
                      </span>

                      {output.time && (
                        <span className="flex items-center text-slate-400 text-[11px]">
                          <Clock className="w-3 h-3 mr-1" /> {output.time}s
                        </span>
                      )}

                      {output.memory && (
                        <span className="flex items-center text-slate-400 text-[11px]">
                          <Cpu className="w-3 h-3 mr-1" /> {output.memory} KB
                        </span>
                      )}
                    </div>

                    {/* Standard Output */}
                    {output.stdout && (
                      <div>
                        <div className="text-slate-400 text-[11px] uppercase tracking-wider mb-1">STDOUT:</div>
                        <pre className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-emerald-300 whitespace-pre-wrap overflow-x-auto">
                          {output.stdout}
                        </pre>
                      </div>
                    )}

                    {/* Standard Error */}
                    {output.stderr && (
                      <div>
                        <div className="text-rose-400 text-[11px] uppercase tracking-wider mb-1">STDERR:</div>
                        <pre className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 whitespace-pre-wrap overflow-x-auto">
                          {output.stderr}
                        </pre>
                      </div>
                    )}

                    {/* Compile Output */}
                    {output.compile_output && (
                      <div>
                        <div className="text-amber-400 text-[11px] uppercase tracking-wider mb-1">COMPILE OUTPUT:</div>
                        <pre className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 whitespace-pre-wrap overflow-x-auto">
                          {output.compile_output}
                        </pre>
                      </div>
                    )}

                    {!output.stdout && !output.stderr && !output.compile_output && (
                      <p className="text-slate-500 italic">Program executed successfully with no output to stdout.</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center space-y-3 font-sans">
                    <Terminal className="w-10 h-10 text-slate-700" />
                    <div>
                      <p className="font-semibold text-slate-400">Execution Console Ready</p>
                      <p className="text-xs text-slate-600 max-w-xs mt-1">
                        Click "Run Code" or press Ctrl+Enter to execute your program against the sandbox engine.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Project Modal */}
      <Modal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} title="Save Project to Portfolio">
        <form onSubmit={handleSaveProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Dynamic Programming Memoization"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Notes on time/space complexity or algorithms implemented..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {saveMessage && (
            <p className="text-xs text-indigo-600 font-semibold">{saveMessage}</p>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setSaveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save to Projects'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EditorPage;
