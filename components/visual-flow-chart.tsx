"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, MoveHorizontal } from "lucide-react"

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface Option {
  id: string
  question_id: string
  text: string
}

interface QuestionRoute {
  id: string
  from_question_id: string
  next_question_id: string
  condition_group: string
  conditions?: Condition[]
  from_question?: Question
  next_question?: Question
}

interface Condition {
  id: string
  question_id: string
  required_question_id: string
  required_option_id: string | null
  operator: string
  value: string | null
  condition_group: string
  required_question?: Question
  required_option?: Option
}

interface QuestionNode {
  id: string
  question: Question
  x: number
  y: number
  width: number
  height: number
  routes: RouteConnection[]
}

interface RouteConnection {
  id: string
  targetId: string
  conditions: Condition[]
}

interface VisualFlowChartProps {
  questions: Question[]
  routes: QuestionRoute[]
}

export function VisualFlowChart({ questions, routes }: VisualFlowChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<QuestionNode[]>([])
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 800 })

  // ノードの初期配置を計算
  useEffect(() => {
    if (!questions.length || !routes.length) return

    // 開始質問（他の質問からの参照がない質問）を見つける
    const targetQuestionIds = routes.map((route) => route.next_question_id)
    const startQuestionIds = questions.filter((question) => !targetQuestionIds.includes(question.id)).map((q) => q.id)

    // 各質問のルートを整理
    const questionRoutes: Record<string, RouteConnection[]> = {}
    questions.forEach((q) => {
      questionRoutes[q.id] = []
    })

    routes.forEach((route) => {
      if (questionRoutes[route.from_question_id]) {
        questionRoutes[route.from_question_id].push({
          id: route.id,
          targetId: route.next_question_id,
          conditions: route.conditions || [],
        })
      }
    })

    // レベルごとに質問をグループ化
    const levels: Record<number, string[]> = {}
    const visited = new Set<string>()
    const questionLevels: Record<string, number> = {}

    // BFSで各質問のレベルを決定
    const queue: { id: string; level: number }[] = startQuestionIds.map((id) => ({ id, level: 0 }))

    while (queue.length > 0) {
      const { id, level } = queue.shift()!

      if (visited.has(id)) continue
      visited.add(id)

      if (!levels[level]) levels[level] = []
      levels[level].push(id)
      questionLevels[id] = level

      // 次の質問をキューに追加
      questionRoutes[id].forEach((route) => {
        if (!visited.has(route.targetId)) {
          queue.push({ id: route.targetId, level: level + 1 })
        }
      })
    }

    // 訪問されなかった質問を最後のレベルに追加
    const maxLevel = Math.max(...Object.keys(levels).map(Number), 0)
    questions.forEach((q) => {
      if (!visited.has(q.id)) {
        if (!levels[maxLevel + 1]) levels[maxLevel + 1] = []
        levels[maxLevel + 1].push(q.id)
        questionLevels[q.id] = maxLevel + 1
      }
    })

    // ノードの配置を計算
    const nodeWidth = 200
    const nodeHeight = 80
    const horizontalSpacing = 250
    const verticalSpacing = 150

    const newNodes: QuestionNode[] = []

    Object.entries(levels).forEach(([levelStr, questionIds]) => {
      const level = Number.parseInt(levelStr)
      const y = level * (nodeHeight + verticalSpacing) + 50

      questionIds.forEach((id, index) => {
        const question = questions.find((q) => q.id === id)
        if (!question) return

        const x = (index - (questionIds.length - 1) / 2) * (nodeWidth + horizontalSpacing) + 500

        newNodes.push({
          id,
          question,
          x,
          y,
          width: nodeWidth,
          height: nodeHeight,
          routes: questionRoutes[id],
        })
      })
    })

    // SVGのサイズを計算
    const maxX = Math.max(...newNodes.map((n) => n.x + n.width / 2)) + 100
    const maxY = Math.max(...newNodes.map((n) => n.y + n.height / 2)) + 100

    setSvgSize({
      width: Math.max(1000, maxX),
      height: Math.max(800, maxY),
    })

    setNodes(newNodes)
  }, [questions, routes])

  // ズーム処理
  const handleZoom = (delta: number) => {
    setScale((prev) => {
      const newScale = Math.max(0.5, Math.min(2, prev + delta))
      return newScale
    })
  }

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // 左クリックのみ
    setDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // ドラッグ中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // ドラッグ終了
  const handleMouseUp = () => {
    setDragging(false)
  }

  // ノードクリック
  const handleNodeClick = (id: string) => {
    setSelectedNode((prev) => (prev === id ? null : id))
  }

  // 条件の説明を生成
  const getConditionDescription = (condition: Condition): string => {
    let description = `「${condition.required_question?.title || condition.required_question?.text || "不明な質問"}」が `

    if (condition.required_option_id) {
      description += `「${condition.required_option?.text || "不明な選択肢"}」を選択した場合`
    } else {
      const operatorMap: { [key: string]: string } = {
        "=": "=",
        "!=": "≠",
        ">": ">",
        ">=": "≥",
        "<": "<",
        "<=": "≤",
        LIKE: "を含む",
      }

      description += `${operatorMap[condition.operator] || condition.operator} ${condition.value || ""}`
    }

    return description
  }

  // 質問タイプに応じた色を取得
  const getQuestionColor = (type: string): string => {
    switch (type) {
      case "text":
        return "#e2f2ff"
      case "button":
        return "#e5f8e5"
      case "image_carousel":
        return "#fff2e2"
      default:
        return "#f5f5f5"
    }
  }

  // 質問タイプに応じた枠線の色を取得
  const getQuestionBorderColor = (type: string): string => {
    switch (type) {
      case "text":
        return "#90caf9"
      case "button":
        return "#a5d6a7"
      case "image_carousel":
        return "#ffcc80"
      default:
        return "#e0e0e0"
    }
  }

  // 条件の有無に応じた線の色とスタイルを取得
  const getLineStyle = (conditions: Condition[]): { stroke: string; strokeDasharray: string } => {
    if (conditions.length === 0) {
      return { stroke: "#888", strokeDasharray: "" }
    }
    return { stroke: "#666", strokeDasharray: "" }
  }

  // 2点間の中点を計算
  const getMidpoint = (x1: number, y1: number, x2: number, y2: number) => {
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
  }

  // 条件ラベルの位置を計算
  const getConditionLabelPosition = (fromX: number, fromY: number, toX: number, toY: number, offset = 0) => {
    const mid = getMidpoint(fromX, fromY, toX, toY)
    const angle = Math.atan2(toY - fromY, toX - fromX)
    return {
      x: mid.x + Math.sin(angle) * offset,
      y: mid.y - Math.cos(angle) * offset,
    }
  }

  return (
    <div className="relative overflow-hidden border rounded-lg bg-white" style={{ height: "70vh" }}>
      {/* ズームコントロール */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/80 p-2 rounded-md shadow-sm">
        <Button variant="outline" size="icon" onClick={() => handleZoom(0.1)}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleZoom(-0.1)}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setScale(1)
            setPosition({ x: 0, y: 0 })
          }}
        >
          <MoveHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* フローチャート */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width={svgSize.width}
          height={svgSize.height}
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {/* 接続線 */}
          {nodes.map((node) =>
            node.routes.map((route) => {
              const targetNode = nodes.find((n) => n.id === route.targetId)
              if (!targetNode) return null

              const fromX = node.x + node.width / 2
              const fromY = node.y + node.height
              const toX = targetNode.x + targetNode.width / 2
              const toY = targetNode.y

              const lineStyle = getLineStyle(route.conditions)

              // 制御点（ベジェ曲線用）
              const controlPoint1 = { x: fromX, y: fromY + (toY - fromY) / 3 }
              const controlPoint2 = { x: toX, y: toY - (toY - fromY) / 3 }

              return (
                <g key={route.id}>
                  {/* 接続線 */}
                  <path
                    d={`M ${fromX} ${fromY} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${toX} ${toY}`}
                    fill="none"
                    stroke={lineStyle.stroke}
                    strokeWidth="2"
                    strokeDasharray={lineStyle.strokeDasharray}
                    markerEnd="url(#arrowhead)"
                  />

                  {/* 条件ラベル */}
                  {route.conditions.length > 0 && (
                    <g>
                      {/* 条件ラベルの背景 */}
                      <rect
                        x={getMidpoint(fromX, fromY, toX, toY).x - 60}
                        y={getMidpoint(fromX, fromY, toX, toY).y - 15}
                        width="120"
                        height="30"
                        rx="15"
                        fill="#f8f9fa"
                        stroke="#ddd"
                      />

                      {/* 条件ラベルのテキスト */}
                      <text
                        x={getMidpoint(fromX, fromY, toX, toY).x}
                        y={getMidpoint(fromX, fromY, toX, toY).y + 5}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#666"
                      >
                        条件あり
                      </text>
                    </g>
                  )}
                </g>
              )
            }),
          )}

          {/* 矢印マーカー */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>

          {/* 質問ノード */}
          {nodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`}
              onClick={() => handleNodeClick(node.id)}
              style={{ cursor: "pointer" }}
            >
              <rect
                width={node.width}
                height={node.height}
                rx="8"
                fill={getQuestionColor(node.question.type)}
                stroke={selectedNode === node.id ? "#000" : getQuestionBorderColor(node.question.type)}
                strokeWidth={selectedNode === node.id ? "2" : "1"}
              />

              <text x={node.width / 2} y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">
                {node.question.title || node.question.text.substring(0, 30)}
              </text>

              <text x={node.width / 2} y="45" textAnchor="middle" fontSize="12" fill="#666">
                {node.question.title ? node.question.text.substring(0, 30) : ""}
                {node.question.text.length > 30 ? "..." : ""}
              </text>

              <text x={node.width / 2} y="65" textAnchor="middle" fontSize="11" fill="#888">
                タイプ: {node.question.type}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 選択された質問の詳細 */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-md shadow-md border max-h-[30vh] overflow-auto">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold">
              {nodes.find((n) => n.id === selectedNode)?.question.title ||
                nodes.find((n) => n.id === selectedNode)?.question.text}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
              ✕
            </Button>
          </div>

          <div className="text-sm mb-2">
            <p>
              <span className="font-medium">質問タイプ:</span> {nodes.find((n) => n.id === selectedNode)?.question.type}
            </p>
            <p>
              <span className="font-medium">質問内容:</span> {nodes.find((n) => n.id === selectedNode)?.question.text}
            </p>
          </div>

          <div className="mt-3">
            <h4 className="font-medium mb-1">遷移先:</h4>
            {nodes.find((n) => n.id === selectedNode)?.routes.length === 0 ? (
              <p className="text-sm text-muted-foreground">遷移先はありません</p>
            ) : (
              <ul className="text-sm space-y-2">
                {nodes
                  .find((n) => n.id === selectedNode)
                  ?.routes.map((route) => {
                    const targetQuestion = questions.find((q) => q.id === route.targetId)
                    return (
                      <li key={route.id} className="border-l-2 pl-2 py-1">
                        <p className="font-medium">{targetQuestion?.title || targetQuestion?.text}</p>
                        {route.conditions.length > 0 ? (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">条件:</p>
                            <ul className="list-disc pl-4 text-xs">
                              {route.conditions.map((condition) => (
                                <li key={condition.id}>{getConditionDescription(condition)}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">条件なし（常に遷移）</p>
                        )}
                      </li>
                    )
                  })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

