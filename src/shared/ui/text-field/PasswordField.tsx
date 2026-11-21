"use client";

import { useState } from "react";

import { EyeIcon, EyeOffIcon } from "../icons";
import { TextField, type TextFieldProps } from "./TextField";

export type PasswordFieldProps = Omit<TextFieldProps, "type" | "endAdornment">;

/** 비밀번호 입력칸. 오른쪽 눈 아이콘으로 입력한 내용을 보이거나 숨긴다. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          aria-pressed={visible}
          disabled={props.disabled}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-canvas/70 hover:text-ink disabled:cursor-not-allowed"
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      }
    />
  );
}
