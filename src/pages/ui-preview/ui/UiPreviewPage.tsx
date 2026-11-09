"use client";

import { useState, type ReactNode } from "react";

import {
  Alert,
  Button,
  Checkbox,
  SearchInput,
  Select,
  TextField,
  Textarea,
  Toast,
} from "@/shared/ui";

// 개발용 공통 컴포넌트 미리보기 페이지 (/ui-preview)

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="flex flex-wrap items-start gap-6">{children}</div>
    </section>
  );
}

const colors = [
  ["primary", "bg-primary"],
  ["navy", "bg-navy"],
  ["canvas", "bg-canvas"],
  ["danger", "bg-danger"],
  ["ink", "bg-ink"],
  ["ink-secondary", "bg-ink-secondary"],
] as const;

export function UiPreviewPage() {
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [keyword, setKeyword] = useState("");

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-8 py-12">
      <h1 className="text-3xl font-bold text-ink">UI Preview</h1>

      <Section title="Colors">
        {colors.map(([name, bg]) => (
          <div key={name} className="flex flex-col gap-2">
            <div className={`h-16 w-40 rounded-card ${bg}`} />
            <span className="text-xs text-ink-secondary">{name}</span>
          </div>
        ))}
      </Section>

      <Section title="Button">
        <Button>P/Default</Button>
        <Button variant="secondary">S/Default</Button>
        <Button variant="danger">삭제하기</Button>
        <Button disabled>Disabled</Button>
        <Button size="sm" variant="secondary">
          취소
        </Button>
      </Section>

      <Section title="TextField">
        <TextField
          className="w-72"
          label="아이디"
          placeholder="사번 또는 아이디를 입력하세요."
        />
        <TextField
          className="w-72"
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요."
        />
        <TextField
          className="w-72"
          label="아이디"
          defaultValue="korail_"
          error="아이디를 확인해 주세요."
        />
        <TextField
          className="w-[423px]"
          size="md"
          label="자막"
          placeholder="장면에 사용할 자막을 입력해 주세요."
        />
      </Section>

      <Section title="Textarea">
        <Textarea
          className="w-[496px]"
          label="나레이션"
          placeholder="나레이션을 입력해 주세요."
        />
        <Textarea
          className="w-[496px]"
          label="나레이션"
          error="나레이션을 입력해 주세요."
        />
      </Section>

      <Section title="Checkbox">
        <Checkbox label="아이디 저장" />
        <Checkbox label="아이디 저장" defaultChecked />
        <Checkbox label="아이디 저장" disabled />
      </Section>

      <Section title="Select / Search">
        <Select
          aria-label="정렬"
          value={sort}
          onChange={setSort}
          options={[
            { value: "latest", label: "최근순" },
            { value: "oldest", label: "오래된순" },
          ]}
        />
        <SearchInput
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onClear={() => setKeyword("")}
        />
      </Section>

      <Section title="Toast">
        <Toast
          message="저장되었습니다. 마지막 수정 내용이 반영되었습니다."
          onClose={() => {}}
        />
        <Toast
          variant="error"
          message="저장에 실패했습니다. 나레이션과 자막을 확인해주세요."
          onClose={() => {}}
        />
      </Section>

      <Section title="Alert">
        <Alert
          className="w-[496px]"
          title="수정 이력은 자동으로 기록됩니다."
          description="변경 내용을 저장한 뒤 재검수를 요청해 주세요."
        />
        <Alert
          className="w-[496px]"
          variant="warning"
          title="일부 항목의 추출 신뢰도가 낮습니다."
          description="원문을 확인하거나 다시 분석해 주세요."
        />
        <Alert
          className="w-[479px]"
          variant="error"
          title="영상을 삭제하시겠습니까?"
          description="삭제한 영상은 복구할 수 없습니다. 영상과 관련된 정보도 함께 삭제됩니다."
          actions={
            <>
              <Button size="sm" variant="secondary">
                취소
              </Button>
              <Button size="sm" variant="danger">
                삭제하기
              </Button>
            </>
          }
        />
      </Section>
    </main>
  );
}
