import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registrado = false;

/** Registra os plugins uma única vez (só no navegador). */
export function registrarGsap() {
  if (registrado || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registrado = true;
}

export { gsap, ScrollTrigger, SplitText };
