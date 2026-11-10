import { VIDEO_CREATION_STEP, VIDEO_CREATION_STEPS } from "@/entities/video";
import { ReportUploadSection } from "@/features/upload-report";
import { AppTopBar } from "@/widgets/app-top-bar";

export function VideoUploadPage() {
  return (
    <>
      <AppTopBar
        items={VIDEO_CREATION_STEPS}
        currentIndex={VIDEO_CREATION_STEP.upload}
      />
      <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 pt-6 pb-8 sm:px-8 lg:px-[35px] lg:pt-[33px]">
          <h1 className="text-2xl font-bold text-ink sm:text-[28px]">
            보고서 업로드
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            안전교육 영상으로 제작할 사고 조사보고서를 등록해 주세요.
          </p>
          {/* 데스크톱에서는 남은 높이를 업로드 영역이 채운다 */}
          <div className="mt-4 flex flex-1 flex-col">
            <ReportUploadSection />
          </div>
        </main>
      </div>
    </>
  );
}
