"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  EXTRACTED_FIELD_ORDER,
  getItemSources,
  useStartStoryboard,
  ExtractedInfoList,
  useAnalysisResult,
  VIDEO_CREATION_STEP,
  VIDEO_CREATION_STEPS,
  type ExtractedFieldKey,
  type ExtractedItem,
} from "@/entities/video";
import {
  ExtractedFieldEditor,
  useUpdateExtractedField,
} from "@/features/edit-extracted-field";
import { useSaveVideoDraft } from "@/features/save-video-draft";
import { ROUTES } from "@/shared/config";
import { useUnsavedChangesGuard } from "@/shared/lib";
import { Button, ConfirmDialog, Toast } from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";
import { ReportViewer } from "@/widgets/report-viewer";

interface VideoAnalysisResultPageProps {
  videoId: string;
}

interface ToastState {
  id: number;
  variant: "success" | "error";
  message: string;
}

const CARD = "flex flex-col rounded-card bg-white p-5 sm:p-[30px] lg:min-h-0";

export function VideoAnalysisResultPage({
  videoId,
}: VideoAnalysisResultPageProps) {
  const router = useRouter();
  const { data, isError, refetch } = useAnalysisResult(videoId);
  const updateField = useUpdateExtractedField(videoId);
  const saveDraft = useSaveVideoDraft(videoId);
  const startStoryboard = useStartStoryboard(videoId);

  // 원문 보기 상태: 근거를 보고 있는 항목, 현재 페이지
  const [selectedKey, setSelectedKey] = useState<ExtractedFieldKey>();
  const [page, setPage] = useState<number>();

  // 수정 상태
  const [editingKey, setEditingKey] = useState<ExtractedFieldKey | null>(null);
  const [draft, setDraft] = useState("");
  const [fieldError, setFieldError] = useState<string>();

  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = (variant: ToastState["variant"], message: string) =>
    setToast({ id: Date.now(), variant, message });

  const items = data?.items ?? [];
  const selected =
    items.find((item) => item.fieldKey === selectedKey) ?? items[0];
  const selectedSources = selected ? getItemSources(selected) : [];
  const currentPage = page ?? selectedSources[0]?.page ?? 1;
  // 선택한 항목의 근거 중 지금 보고 있는 페이지에 있는 것만 강조한다
  const pageSources = selectedSources.filter(
    (source) => source.page === currentPage,
  );
  const highlightRects = pageSources.flatMap((source) => source.rects ?? []);
  // AI가 참고한 문장은 박스 표시 여부와 상관없이 항상 같이 보여준다
  const highlightQuotes = pageSources
    .filter((source) => source.text)
    .map((source) => source.text);

  // 수정 중인데 저장하지 않은 변경이 있는지
  const originalContent = items.find(
    (item) => item.fieldKey === editingKey,
  )?.content;
  const dirty = editingKey !== null && draft.trim() !== originalContent;
  const leaveGuard = useUnsavedChangesGuard(dirty);

  /** page를 안 주면 첫 번째 근거 페이지로. 근거가 없으면 보고 있던 페이지 그대로 */
  const showSource = (item: ExtractedItem, sourcePage?: number) => {
    setSelectedKey(item.fieldKey);
    const target = sourcePage ?? getItemSources(item)[0]?.page;
    if (target !== undefined) setPage(target);
  };

  const startEdit = (key: ExtractedFieldKey) => {
    const item = items.find((i) => i.fieldKey === key);
    if (!item) return;
    showSource(item);
    setEditingKey(key);
    setDraft(item.content);
    setFieldError(undefined);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setFieldError(undefined);
  };

  /** 저장 후 then: "list"면 목록으로, "next"면 다음 항목 수정으로 */
  const saveEdit = (then: "list" | "next") => {
    if (!editingKey) return;
    if (!draft.trim()) {
      setFieldError("내용을 입력해 주세요.");
      return;
    }
    updateField.mutate(
      { key: editingKey, content: draft.trim() },
      {
        onSuccess: () => {
          const nextKey =
            EXTRACTED_FIELD_ORDER[
              EXTRACTED_FIELD_ORDER.indexOf(editingKey) + 1
            ];
          if (then === "next" && nextKey) startEdit(nextKey);
          else cancelEdit();
          showToast("success", "저장되었습니다. 수정 내용이 반영되었습니다.");
        },
        onError: () =>
          showToast(
            "error",
            "저장에 실패했습니다. 수정 내용을 다시 확인해 주세요.",
          ),
      },
    );
  };

  const handleSaveDraft = () =>
    saveDraft.mutate(undefined, {
      onSuccess: () => showToast("success", "임시저장되었습니다."),
      onError: () =>
        showToast(
          "error",
          "임시저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        ),
    });

  const handleNext = () =>
    startStoryboard.mutate(undefined, {
      onSuccess: () => router.push(ROUTES.videoStoryboard(videoId)),
      onError: () =>
        showToast(
          "error",
          "스토리보드를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.",
        ),
    });

  return (
    <>
      <AppTopBar
        items={VIDEO_CREATION_STEPS}
        currentIndex={VIDEO_CREATION_STEP.analysis}
      />
      <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 pt-6 pb-8 sm:px-8 lg:px-[35px] lg:pt-[33px]">
          <h1 className="text-2xl font-bold text-ink sm:text-[28px]">
            분석 결과 확인
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            AI가 추출한 내용을 원문과 대조하고, 영상 제작에 사용할 정보를 검토해
            주세요.
          </p>

          {isError ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-card bg-white px-5 py-16 text-center">
              <p className="text-[15px] text-ink">
                분석 결과를 불러오지 못했습니다.
              </p>
              <Button variant="secondary" onClick={() => refetch()}>
                다시 불러오기
              </Button>
            </div>
          ) : !data ? (
            <div className="mt-6 grid gap-6 lg:min-h-[440px] lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
              <div className={`${CARD} h-[420px] animate-pulse lg:h-auto`} />
              <div className={`${CARD} h-[420px] animate-pulse lg:h-auto`} />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className={CARD}>
                <ReportViewer
                  videoId={videoId}
                  page={currentPage}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                  highlightQuotes={highlightQuotes}
                  highlightRects={highlightRects}
                />
              </section>

              {/* lg:h-0 + min-h-full: 오른쪽 내용 길이는 줄 높이에 영향을 주지 않고, 왼쪽 원문 카드 높이에 맞춘다 */}
              <section className={`${CARD} flex flex-col lg:h-0 lg:min-h-full`}>
                {editingKey ? (
                  <ExtractedFieldEditor
                    key={editingKey}
                    fieldKey={editingKey}
                    value={draft}
                    error={fieldError}
                    saving={updateField.isPending}
                    onChange={(value) => {
                      setDraft(value);
                      if (fieldError) setFieldError(undefined);
                    }}
                    onSave={() => saveEdit("list")}
                    onBack={() => leaveGuard.guard(cancelEdit)}
                  />
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-ink">AI 추출 정보</h2>
                    <div className="mt-4 min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
                      <ExtractedInfoList
                        items={items}
                        selectedKey={selected?.fieldKey}
                        currentPage={currentPage}
                        onShowSource={showSource}
                        onEdit={startEdit}
                      />
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          <div className="mt-6 flex shrink-0 flex-col gap-2.5 sm:flex-row sm:justify-end">
            {editingKey ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => leaveGuard.guard(cancelEdit)}
                >
                  이전
                </Button>
                <Button
                  disabled={updateField.isPending}
                  onClick={() => saveEdit("next")}
                >
                  다음
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => router.push(ROUTES.videoCreate)}
                >
                  이전
                </Button>
                <Button
                  variant="secondary"
                  disabled={!data || saveDraft.isPending}
                  onClick={handleSaveDraft}
                >
                  {saveDraft.isPending ? "저장 중..." : "임시저장"}
                </Button>
                <Button
                  disabled={!data || startStoryboard.isPending}
                  onClick={handleNext}
                >
                  {startStoryboard.isPending
                    ? "요청 중..."
                    : "다음 단계: 스토리보드 확인"}
                </Button>
              </>
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={leaveGuard.pending}
        title="저장하지 않은 내용이 있습니다"
        description="지금 나가면 수정한 내용이 사라져요. 그래도 나가시겠어요?"
        cancelLabel="계속 수정"
        confirmLabel="나가기"
        danger
        onCancel={leaveGuard.cancel}
        onConfirm={leaveGuard.confirm}
      />

      {toast && (
        <div className="fixed right-5 bottom-5 left-5 z-50 flex justify-end lg:left-auto lg:w-[720px]">
          <Toast
            key={toast.id}
            variant={toast.variant}
            message={toast.message}
            duration={4000}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}
