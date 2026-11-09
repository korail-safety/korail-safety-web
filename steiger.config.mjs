import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // 아직 비어있는 레이어 경고는 끔 (슬라이스가 생기면 지워도 됨)
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
