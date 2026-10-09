import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import {
  Play,
  Save,
  Terminal,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const BOILERPLATES = {
  javascript: `// JavaScript (Node.js) Environment
function solve() {
  console.log("Welcome to EduPulse Interactive Sandbox!");
  const arr = [12, 45, 78, 23, 56, 89];
  console.log("Max element:", Math.max(...arr));
}

solve();
`,
  python: `# Python 3 Execution Environment
def solve():
    print("Welcome to EduPulse Python Sandbox!")
    numbers = [12, 45, 78, 23, 56, 89]
    print(f"Sorted numbers: {sorted(numbers)}")
    print(f"Max element: {max(numbers)}")

if __name__ == "__main__":
    solve()
`,
  typescript: `// TypeScript Environment
interface Student {
  name: string;
  score: number;
}

const student: Student = { name: "Alex Chen", score: 95 };
console.log(\`Student \${student.name} achieved score: \${student.score}%\`);
`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("EduPulse Java Engine Running!");
        int a = 15, b = 27;
        System.out.println("Sum: " + (a + b));
    }
}
`,
  c: `#include <stdio.h>

int main() {
    printf("EduPulse C GCC Environment\\n");
    int arr[] = {1, 2, 3, 4, 5};
    printf("Array size: %lu\\n", sizeof(arr) / sizeof(arr[0]));
    return 0;
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::cout << "EduPulse C++ Environment\\n";
    std::vector<int> v = {9, 2, 7, 4, 5};
    std::sort(v.begin(), v.end());
    std::cout << "Sorted first element: " << v[0] << "\\n";
    return 0;
}
`,
  go: `package main
import "fmt"

func main() {
    fmt.Println("EduPulse Go Runtime")
    message := "High-concurrency microservices"
    fmt.Println(message)
}
`,
  rust: `fn main() {
    println!("EduPulse Rust Environment");
    let mut vec = vec![1, 2, 3, 4];
    vec.push(5);
    println!("Vector length: {}", vec.len());
}
`,
  php: `<?php
echo "EduPulse PHP Sandbox\\n";
$items = ["Algorithms", "Web Dev", "AI"];
foreach ($items as $item) {
    echo "- " . $item . "\\n";
}
?>
`,
  ruby: `puts "EduPulse Ruby Engine"
grades = [92, 85, 88, 95]
puts "Average grade: #{grades.sum / grades.size.to_f}"
`,
  kotlin: `fun main() {
    println("EduPulse Kotlin Runtime")
    val languages = listOf("Kotlin", "Java", "Python")
    println("Languages count: \${languages.size}")
}
`,
  swift: `import Foundation

print("EduPulse Swift Engine")
let scores = [88, 94, 91]
print("Top score: \\(scores.max() ?? 0)")
`,
  sql: `-- EduPulse SQL Engine
SELECT 'EduPulse Database Query' AS status, CURRENT_TIMESTAMP AS query_time;
`
};

export function CodeEditor() {
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('projectId');

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(BOILERPLATES.javascript);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // If opened with projectId from Projects page
  useEffect(() => {
    if (projectIdParam) {
      loadProject(projectIdParam);
    }
  }, [projectIdParam]);

  const loadProject = async (id) => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data?.project) {
        const p = res.data.project;
        setLanguage(p.language);
        setCode(p.code);
        setProjectTitle(p.title);
        setProjectDescription(p.description || '');
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(BOILERPLATES[newLang] || '// Write your code here');
  };

  const handleRun = async () => {
    setRunning(true);
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
        status: 'Runtime Error',
        time: '0.00s'
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectTitle.trim()) return;
    setSaving(true);
    setSaveMessage('');

    try {
      if (projectIdParam) {
        await api.put(`/projects/${projectIdParam}`, {
          title: projectTitle,
          description: projectDescription,
          language,
          code
        });
        setSaveMessage('Project updated successfully!');
      } else {
        await api.post('/projects', {
          title: projectTitle,
          description: projectDescription,
          language,
          code
        });
        setSaveMessage('Project saved to your portfolio!');
      }
      setTimeout(() => setSaveModalOpen(false), 1200);
    } catch (err) {
      setSaveMessage('Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Interactive Code Sandbox</h3>
            <p className="text-[11px] text-slate-500">Judge0 CE multi-language compiler & runtime</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java (OpenJDK)</option>
            <option value="c">C (GCC)</option>
            <option value="cpp">C++ (G++)</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="kotlin">Kotlin</option>
            <option value="swift">Swift</option>
            <option value="sql">SQL (SQLite)</option>
          </select>

          {/* Reset Template */}
          <button
            onClick={() => setCode(BOILERPLATES[language] || '')}
            title="Reset to boilerplate"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save to DB */}
          <button
            onClick={() => setSaveModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Project</span>
          </button>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={running}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Executing...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Monaco Editor (Left/Top) & Output Console (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Editor (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md flex flex-col h-[560px]">
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] text-slate-300">main.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'java' ? 'java' : 'js'}</span>
            <span className="text-[10px] text-indigo-400 font-bold uppercase">{language}</span>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={language === 'c' || language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>
        </div>

        {/* Output & Stdin Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[560px] space-y-4">
          {/* Output Panel */}
          <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 shadow-md flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">Terminal Output</span>
              </div>
              {output && (
                <div className="flex items-center space-x-2 text-[10px]">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{output.time}</span>
                  </span>
                  <span className={`font-bold px-1.5 py-0.2 rounded ${
                    output.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {output.status}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap selection:bg-indigo-500/30">
              {running ? (
                <div className="flex items-center space-x-2 text-indigo-400 py-6">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>Compiling and running code...</span>
                </div>
              ) : output ? (
                <>
                  {output.stdout && <div className="text-emerald-400">{output.stdout}</div>}
                  {output.stderr && <div className="text-rose-400 mt-2">{output.stderr}</div>}
                  {output.compile_output && <div className="text-amber-400 mt-2">{output.compile_output}</div>}
                </>
              ) : (
                <span className="text-slate-600">Click "Run Code" to compile and view execution output here.</span>
              )}
            </div>
          </div>

          {/* Stdin Input Panel */}
          <div className="h-36 bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Standard Input (stdin)
            </label>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Provide program input here..."
              className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Save Project Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Code Project to Portfolio"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Distributed Token Bucket Rate Limiter"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Brief summary of algorithm, data structure or system design..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {saveMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {saveMessage}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={() => setSaveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProject}
              disabled={saving || !projectTitle.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CodeEditor;
