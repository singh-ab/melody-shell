declare module "music_library/MusicLibrary" {
  import { ComponentType } from "react";
  const Comp: ComponentType<{ role: "admin" | "user" }>;
  export default Comp;
}
