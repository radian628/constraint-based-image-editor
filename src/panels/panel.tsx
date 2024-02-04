import { CurrentKeymap, keybind } from "../keybinds/keybinds.js";
import { setElem } from "../utils/array.js";
import { match } from "../utils/match.js";
import "./panel.less";
import React, { useEffect, useRef, useState } from "react";

export type Subpanels = [number, JSX.Element][];

export function PanelSet(props: {
  vertical: boolean;
  subpanels: Subpanels;
  setSubpanels: React.Dispatch<React.SetStateAction<Subpanels>>;
}) {
  const [tempOffsets, setTempOffsets] = useState<{
    [key: number]: number;
  }>({});

  const rootElemRef = useRef<HTMLDivElement | null>(null);

  // apply temporary panel offsets (kinda like committing changes in git)
  function applyTempOffsets() {
    props.setSubpanels((subpanels) =>
      subpanels.map((sp, i) => [
        sp[0] + getDisplayTempOffset(i) - getDisplayTempOffset(i - 1),
        sp[1],
      ])
    );
    setTempOffsets({});
  }

  // add a temporary offset to a panel
  function movePanel(i: number, dx: number) {
    setTempOffsets((tempOffsets) => ({
      ...tempOffsets,
      [i]: (tempOffsets[i] ?? 0) + dx,
    }));
  }

  // when mouse/kb inputs are over, apply all queued up temp offsets
  useEffect(() => {
    document.addEventListener("mouseup", applyTempOffsets);
    document.addEventListener("keyup", applyTempOffsets);

    return () => {
      document.removeEventListener("mouseup", applyTempOffsets);
      document.removeEventListener("keyup", applyTempOffsets);
    };
  });

  // get a temporary offset adjusted so that it can be used to display panels
  // as they're being dragged
  function getDisplayTempOffset(i: number) {
    const rawOffset = tempOffsets[i];

    // no temp offset is 0
    if (!rawOffset) return 0;

    // prevent temporary offset from exceeding adjacent subpanel sizes
    if (-rawOffset >= props.subpanels[i][0]) return -props.subpanels[i][0];
    if (rawOffset >= props.subpanels[i + 1][0])
      return props.subpanels[i + 1][0];

    // offset is not constrained
    return rawOffset;
  }

  const dir = props.vertical ? "vertical" : "horizontal";

  return (
    <div className={`${dir}-panel`} ref={rootElemRef}>
      {props.subpanels.map(([subdiv, subpanel], i) => {
        const size = `${
          Math.max(
            0.01,
            subdiv + getDisplayTempOffset(i) - getDisplayTempOffset(i - 1)
          ) * 100
        }%`;
        return (
          <div
            key={i}
            className={`${dir}-subpanel`}
            style={{
              width: props.vertical ? undefined : size,
              height: props.vertical ? size : undefined,
            }}
          >
            <div className={`${dir}-subpanel-content`}>{subpanel}</div>
            {i < props.subpanels.length - 1 && (
              <div
                tabIndex={0}
                onKeyDown={(e) => {
                  const kb = keybind(CurrentKeymap, e);

                  if (!kb) return;

                  // determine which direction to go in based on keybinds
                  const delta = (() => {
                    if (props.vertical) {
                      return match(
                        {
                          upCoarse: -0.025,
                          downCoarse: 0.025,
                          upFine: -0.0025,
                          downFine: 0.0025,
                        },
                        0
                      )(kb);
                    } else {
                      return match(
                        {
                          leftCoarse: -0.025,
                          rightCoarse: 0.025,
                          leftFine: -0.0025,
                          rightFine: 0.0025,
                        },
                        0
                      )(kb);
                    }
                  })();

                  movePanel(i, delta);

                  e.preventDefault();
                }}
                onMouseDown={(e) => {
                  const subpanelElem = e.currentTarget;
                  subpanelElem.style.userSelect = "none";
                  if (e.button === 0) {
                    let x = props.vertical ? e.clientY : e.clientX;

                    // drag panel when mouse moves while clicking
                    const onMouseMove = (e: MouseEvent) => {
                      // determine how far to move the panel
                      const dx = (props.vertical ? e.clientY : e.clientX) - x;
                      const rect = rootElemRef.current?.getBoundingClientRect();
                      const dxN =
                        dx /
                        ((props.vertical ? rect?.height : rect?.width) ??
                          Infinity);

                      // move the panel
                      movePanel(i, dxN);

                      // update x-value so we can calculate the next dx
                      x = props.vertical ? e.clientY : e.clientX;
                    };

                    // remove listeners for mouse movement
                    const onMouseUp = (e: MouseEvent) => {
                      subpanelElem.style.userSelect = "";
                      document.removeEventListener("mouseup", onMouseUp);
                      document.removeEventListener("mousemove", onMouseMove);
                    };

                    // add listeners for mouse movement
                    document.addEventListener("mouseup", onMouseUp);
                    document.addEventListener("mousemove", onMouseMove);
                  }
                }}
                className={`${dir}-drag-bar`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
