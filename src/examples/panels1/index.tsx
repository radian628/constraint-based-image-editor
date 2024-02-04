import { createRoot } from "react-dom/client";
import { PanelSet, Subpanels } from "../../panels/panel.js";
import React, { useState } from "react";
import "./index.less";

function NestedPanels() {
  const [subpanels, setSubpanels] = useState<Subpanels>([
    [0.25, <div className="subpanel">panel1</div>],
    [0.25, <div className="subpanel">panel2</div>],
    [0.25, <div className="subpanel">panel3</div>],
    [0.25, <div className="subpanel">panel4</div>],
  ]);

  return (
    <PanelSet
      vertical={false}
      subpanels={subpanels}
      setSubpanels={setSubpanels}
    ></PanelSet>
  );
}

function App() {
  const [subpanels2, setSubpanels2] = useState<Subpanels>([
    [0.25, <div className="subpanel">panel1</div>],
    [0.25, <div className="subpanel">panel2</div>],
    [0.25, <NestedPanels></NestedPanels>],
    [0.25, <div className="subpanel">panel4</div>],
  ]);

  return (
    <>
      <div className="half-screen">
        <PanelSet
          vertical={true}
          subpanels={subpanels2}
          setSubpanels={setSubpanels2}
        ></PanelSet>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App></App>);
