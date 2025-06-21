import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { FileText, Calendar, MessageSquare, Search, BarChart3, User, MapPin, Hash, Shield } from "lucide-react"
import type { Evidence, Statement, AnalysisResult, SuspectInfo } from "@/types/summary"

interface SummaryDrawerContentProps {
  summary: any
  summaryLoading: boolean
}

export const SummaryDrawerContent: React.FC<SummaryDrawerContentProps> = ({ summary, summaryLoading }) => {
  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size={32} />
      </div>
    )
  }

  if (!summary || typeof summary !== "object") {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <FileText className="w-8 h-8 mr-2" />
        <span>この事件の概要はまだありません。</span>
      </div>
    )
  }

  console.log("Summary data:", summary)

  return (
    <div className="space-y-6 p-1">
      {/* Case Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            事件概要
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">タイトル</div>
                <div className="font-semibold">{summary.summaryName}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">カテゴリ</div>
                <div className="font-semibold">{summary.category}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">事件発生日</div>
                <div className="font-medium">{summary.dateOfIncident}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5" />
            供述調書
            {summary.statements?.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {summary.statements.length}件
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.statements && summary.statements.length > 0 ? (
            <div className="space-y-4">
              {summary.statements.map((statement: Statement, i: number) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{statement.name}</span>
                  </div>
                  <Separator />
                  <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/50 p-3 rounded">
                    {statement.statement}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>供述調書はありません。</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Physical Evidence */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5" />
            物的証拠
            {summary.physicalEvidence?.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {summary.physicalEvidence.length}件
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.physicalEvidence && summary.physicalEvidence.length > 0 ? (
            <div className="space-y-4">
              {summary.physicalEvidence.map((evidence: Evidence, i: number) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-medium">{evidence.evidenceNumber}</span>
                    </div>
                    <Badge variant="outline">{evidence.type}</Badge>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">発見場所</div>
                      <div className="text-sm">{evidence.foundLocation}</div>
                    </div>
                  </div>

                  {evidence.remarks && (
                    <>
                      <Separator />
                      <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/50 p-3 rounded">
                        {evidence.remarks}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>物的証拠はありません。</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5" />
            分析結果
            {summary.analysisResults?.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {summary.analysisResults.length}件
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.analysisResults && summary.analysisResults.length > 0 ? (
            <div className="space-y-4">
              {summary.analysisResults.map((result: AnalysisResult, i: number) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="outline">{result.type}</Badge>
                  </div>
                  <Separator />
                  <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/50 p-3 rounded">
                    {result.result}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>分析結果はありません。</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspect Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5" />
            容疑者情報
            {summary.suspectInfo?.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {summary.suspectInfo.length}名
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.suspectInfo && summary.suspectInfo.length > 0 ? (
            <div className="space-y-4">
              {summary.suspectInfo.map((suspect: SuspectInfo, i: number) => (
                <div key={i} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{suspect.name}</span>
                  </div>

                  <div className="grid gap-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">前科</div>
                      <div className="text-sm bg-muted/50 p-2 rounded">{suspect.criminalRecord}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">アリバイ</div>
                      <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/50 p-3 rounded">
                        {suspect.alibi}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>容疑者情報はありません。</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
