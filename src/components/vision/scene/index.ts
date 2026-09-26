import { laptopScene } from "./laptopModel";
import type { SceneConfig } from "./kit";

export type SceneKind = "laptop";

export const scenes: Record<SceneKind, SceneConfig> = {
  laptop: laptopScene,
};
