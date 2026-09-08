"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./AnimatedDisclosure.module.css";

export function AnimatedDisclosure({ title, children, className = "", defaultOpen = false }: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return <div className={`${styles.disclosure} ${className}`}>
    <button type="button" className={styles.trigger} aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
      <span>{title}</span><ChevronDown size={15} aria-hidden="true" />
    </button>
    <div id={id} className={styles.content} data-open={open} inert={!open} aria-hidden={!open}>
      <div>{children}</div>
    </div>
  </div>;
}
