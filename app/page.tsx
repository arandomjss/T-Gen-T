"use client"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function TruthTableGenerator() {
  const [expression, setExpression] = useState("")
  const [truthTable, setTruthTable] = useState<any[]>([])
  const [variables, setVariables] = useState<string[]>([])
  const [varCounter, setVarCounter] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, -100])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const operators = [
    { label: "ADD variable", value: "", special: true },
    { label: "AND", value: "∧" },
    { label: "OR", value: "∨" },
    { label: "NOT", value: "~" },
    { label: "XOR", value: "⊕" },
    { label: "SYM DIFF", value: "△" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "Clear", value: "", special: true },
    { label: "Enter", value: "", special: true },
  ]

  const handleKeyClick = (op: any) => {
    if (op.special) {
      if (op.label === "ADD variable") {
        const newVar = String.fromCharCode(64 + varCounter)
        if (varCounter <= 26) {
          setVarCounter((prev) => prev + 1)
          if (!variables.includes(newVar)) {
            setVariables([...variables, newVar])
          }
          setExpression((prev) => prev + newVar)
        }
      } else if (op.label === "Clear") {
        setExpression("")
        setTruthTable([])
      } else if (op.label === "Enter") {
        generateTruthTable()
      }
    } else {
      setExpression((prev) => prev + op.value)
    }
  }

  const generateTruthTable = () => {
    if (!expression) return

    // Extract unique variables from the expression
    const uniqueVars = [...new Set(expression.match(/[A-Z]/g) || [])].sort()

    if (uniqueVars.length === 0) {
      setTruthTable([])
      return
    }

    // Generate all possible combinations of T/F for variables
    const rows = []
    const numRows = Math.pow(2, uniqueVars.length)

    for (let i = 0; i < numRows; i++) {
      const row: Record<string, boolean> = {}

      // Assign T/F values to each variable for this row
      for (let j = 0; j < uniqueVars.length; j++) {
        // Use bit operations to determine T/F
        row[uniqueVars[j]] = !!(i & (1 << (uniqueVars.length - j - 1)))
      }

      // Evaluate the expression for this row
      const result = evaluateExpression(expression, row)
      rows.push({ ...row, result })
    }

    setTruthTable(rows)
    setVariables(uniqueVars)
  }

  const evaluateExpression = (expr: string, values: Record<string, boolean>): boolean => {
    // This is a simplified parser for demonstration
    // In a real implementation, you'd want a more robust parser

    // Replace variables with their values
    let processedExpr = expr
    for (const [variable, value] of Object.entries(values)) {
      const regex = new RegExp(variable, "g")
      processedExpr = processedExpr.replace(regex, value ? "T" : "F")
    }

    // Process NOT operations
    while (processedExpr.includes("~")) {
      processedExpr = processedExpr.replace(/~(T|F)/g, (match) => {
        return match[1] === "T" ? "F" : "T"
      })
    }

    // Process parentheses
    while (processedExpr.includes("(")) {
      processedExpr = processedExpr.replace(/$$([TF∧∨⊕△]+)$$/g, (match, group) => {
        return evaluateSimpleExpression(group) ? "T" : "F"
      })
    }

    return evaluateSimpleExpression(processedExpr)
  }

  const evaluateSimpleExpression = (expr: string): boolean => {
    // Handle AND operations
    while (expr.includes("∧")) {
      expr = expr.replace(/([TF])∧([TF])/g, (match, a, b) => {
        return a === "T" && b === "T" ? "T" : "F"
      })
    }

    // Handle OR operations
    while (expr.includes("∨")) {
      expr = expr.replace(/([TF])∨([TF])/g, (match, a, b) => {
        return a === "T" || b === "T" ? "T" : "F"
      })
    }

    // Handle XOR operations
    while (expr.includes("⊕")) {
      expr = expr.replace(/([TF])⊕([TF])/g, (match, a, b) => {
        return a !== b ? "T" : "F"
      })
    }

    // Handle Symmetric Difference operations
    while (expr.includes("△")) {
      expr = expr.replace(/([TF])△([TF])/g, (match, a, b) => {
        return a !== b ? "T" : "F"
      })
    }

    return expr === "T"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white" ref={containerRef}>
      {/* Animated Title Section */}
      <motion.div
        className="h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        <div className="absolute inset-0 opacity-10">
          <MathSymbolsBackground />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center z-10"
        >
          <Calculator className="w-20 h-20 mx-auto mb-4 text-emerald-400" />
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-600 mb-4">
            T-Gen-T
          </h1>
          <p className="text-xl text-slate-300 max-w-md mx-auto">
            Create truth tables for logical expressions with ease
          </p>
          <motion.div
            className="mt-8 animate-bounce"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-slate-400">Scroll down to start</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Interactive Keyboard Section */}
      <div className="min-h-screen py-20 px-4 md:px-8">
        <div className="absolute inset-0 opacity-10">
          <MathSymbolsBackground />
        </div>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Truth Table Generator</h2>

          {/* Expression Display */}
          <Card className="p-6 mb-8 bg-slate-800 border-slate-700">
            <div className="text-2xl font-mono min-h-16 mb-4 p-4 bg-slate-900 rounded-md overflow-x-auto whitespace-nowrap">
              {expression || <span className="text-slate-500">Enter a logical expression...</span>}
            </div>

            {/* Variables Display */}
            <div className="flex flex-wrap gap-2 mb-4">
              {variables.map((variable) => (
                <div key={variable} className="px-3 py-1 bg-emerald-900/50 text-emerald-300 rounded-full text-sm">
                  {variable}
                </div>
              ))}
            </div>
          </Card>

          {/* Keyboard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-12">
            {operators.map((op, index) => (
              <Button
                key={index}
                variant={op.special ? "default" : "outline"}
                className={`text-lg py-6 ${
                  op.label === "Enter"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white col-span-2 sm:col-span-1"
                    : op.label === "Clear"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "border-slate-700 bg-slate-800 hover:bg-slate-700"
                }`}
                onClick={() => handleKeyClick(op)}
              >
                {op.label}
              </Button>
            ))}
          </div>

          {/* Truth Table */}
          {truthTable.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h3 className="text-2xl font-bold mb-4">Truth Table for: {expression}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      {variables.map((variable) => (
                        <th key={variable} className="p-3 text-left border border-slate-700">
                          {variable}
                        </th>
                      ))}
                      <th className="p-3 text-left border border-slate-700">{expression}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {truthTable.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-slate-900" : "bg-slate-800/50"}>
                        {variables.map((variable) => (
                          <td key={variable} className="p-3 border border-slate-700 font-mono">
                            {row[variable] ? "T" : "F"}
                          </td>
                        ))}
                        <td className="p-3 border border-slate-700 font-mono font-bold">{row.result ? "T" : "F"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function MathSymbolsBackground() {
  const symbols = ["∧", "∨", "⊕", "~", "△", "→", "↔", "⊤", "⊥", "≡", "≠", "∀", "∃", "∈", "∉", "⊆", "⊇", "∪", "∩", "¬"]

  return (
    <div className="w-full h-full relative">
      {Array.from({ length: 100 }).map((_, i) => {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
        const x = Math.random() * 100
        const y = Math.random() * 100
        const size = Math.random() * 1.5 + 0.8
        const opacity = Math.random() * 0.5 + 0.1

        return (
          <div
            key={i}
            className="absolute font-mono"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              fontSize: `${size}rem`,
              opacity,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            {randomSymbol}
          </div>
        )
      })}
    </div>
  )
}
