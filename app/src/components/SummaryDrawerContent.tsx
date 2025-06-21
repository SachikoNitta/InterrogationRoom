import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
    <div className="space-y-4 p-1">
      <Accordion type="multiple" defaultValue={["overview"]} className="space-y-2">
        {/* Case Overview - Default open */}
        <AccordionItem value="overview" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">事件概要</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">File ID</div>
                  <div className="font-mono text-sm bg-muted px-2 py-1 rounded">{summary.summaryId}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">タイトル</div>
                  <div className="font-semibold">{summary.summaryName}</div>
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
          </AccordionContent>
        </AccordionItem>

        {/* Statements */}
        <AccordionItem value="statements" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2 w-full">
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">供述調書</span>
              {summary.statements?.length > 0 && (
                <Badge variant="secondary" className="ml-auto mr-2">
                  {summary.statements.length}件
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {summary.statements && summary.statements.length > 0 ? (
              <Accordion type="multiple" className="space-y-2">
                {summary.statements.map((statement: Statement, i: number) => (
                  <AccordionItem key={i} value={`statement-${i}`} className="border rounded">
                    <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{statement.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/50 p-3 rounded">
                        {statement.statement}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>供述調書はありません。</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Physical Evidence */}
        <AccordionItem value="evidence" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2 w-full">
              <Search className="w-5 h-5" />
              <span className="font-semibold">物的証拠</span>
              {summary.physicalEvidence?.length > 0 && (
                <Badge variant="secondary" className="ml-auto mr-2">
                  {summary.physicalEvidence.length}件
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {summary.physicalEvidence && summary.physicalEvidence.length > 0 ? (
              <Accordion type="multiple" className="space-y-2">
                {summary.physicalEvidence.map((evidence: Evidence, i: number) => (
                  <AccordionItem key={i} value={`evidence-${i}`} className="border rounded">
                    <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-2">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm font-medium">{evidence.evidenceNumber}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {evidence.type}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 space-y-3">
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>物的証拠はありません。</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Analysis Results */}
        <AccordionItem value="analysis" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2 w-full">
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold">分析結果</span>
              {summary.analysisResults?.length > 0 && (
                <Badge variant="secondary" className="ml-auto mr-2">
                  {summary.analysisResults.length}件
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {summary.analysisResults && summary.analysisResults.length > 0 ? (
              <Accordion type="multiple" className="space-y-2">
                {summary.analysisResults.map((result: AnalysisResult, i: number) => (
                  <AccordionItem key={i} value={`analysis-${i}`} className="border rounded">
                    <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/50 p-3 rounded">
                        {result.result}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>分析結果はありません。</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Suspect Information */}
        <AccordionItem value="suspects" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2 w-full">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">容疑者情報</span>
              {summary.suspectInfo?.length > 0 && (
                <Badge variant="secondary" className="ml-auto mr-2">
                  {summary.suspectInfo.length}名
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {summary.suspectInfo && summary.suspectInfo.length > 0 ? (
              <Accordion type="multiple" className="space-y-2">
                {summary.suspectInfo.map((suspect: SuspectInfo, i: number) => (
                  <AccordionItem key={i} value={`suspect-${i}`} className="border rounded">
                    <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{suspect.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 space-y-3">
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>容疑者情報はありません。</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
