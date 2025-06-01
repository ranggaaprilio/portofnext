import type React from "react";
import { useEffect } from "react";

type EventType = MouseEvent | TouchEvent;

export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: (event: EventType) => void,
) => {
  useEffect(() => {
    const listener = (event: EventType) => {
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};
