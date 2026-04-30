import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { styled } from "styled-components";
import { Button, HBox, VBox, VSpacer } from "./components/index.tsx";

type TutorialActionsType = "START"|"NEXT"|"END";
type Location = "center" | "top-center" | "bottom-center" | "top-left" | "top-right";

type TutorialStep = {
  elementId?: string,
  message: string,
  blurbLocation: Location,
  actionsType: TutorialActionsType
};

const tutorialSteps: TutorialStep[] = [
  {
    message: "Welcome to eq+! This tutorial will guide you through the various features. Or, if you're familiar with audio equalization and ready to jump in, you can skip the tutorial altogether.",
    blurbLocation: "center",
    actionsType: "START"
  },
  {
    elementId: "graph",
    message: "This is the equalizer window. The selected node is a filled in circle. You can click to select and drag nodes to different positions. Double-clicking will add a new node. Scrolling allows you to change the Q value of a node.",
    blurbLocation: "bottom-center",
    actionsType: "NEXT"
  },
  {
    elementId: "dial-freq",
    message: "The \"Frequency\" knob controls the selected node's position along the x-axis (frequency). Lower frequencies correspond to \"bass\" tones, and higher frequencies correspond to \"treble\" tones.",
    blurbLocation: "top-center",
    actionsType: "NEXT"
  },
  {
    elementId: "dial-gain",
    message: "The \"Gain\" knob controls the selected node's position along the y-axis (gain). Higher gain will provide a \"boost\" at the node's frequency, and lower gain will provide a \"cut\".",
    blurbLocation: "top-center",
    actionsType: "NEXT"
  },
  {
    elementId: "dial-q",
    message: "The \"Q\" knob controls the selected node's quality setting. Lower values result in a wider curve, while higher values result in a narrower, sharper curve.",
    blurbLocation: "top-center",
    actionsType: "NEXT"
  },
  {
    elementId: "dial-preamp",
    message: "The \"Preamp\" knob controls the input gain.",
    blurbLocation: "top-center",
    actionsType: "NEXT"
  },
  {
    elementId: "filter-type",
    message: "The \"Filter Type\" selector allows you to change the filter type.",
    blurbLocation: "top-center",
    actionsType: "NEXT"
  },
  {
    elementId: "add-remove",
    message: "The \"Add\" and \"Remove\" buttons allow you to add or remove nodes.",
    blurbLocation: "top-center",
    actionsType: "NEXT"
  },
  {
    elementId: "settings-themes",
    message: "These buttons allow you to open the \"Presets\", \"Settings\", and \"Theme Builder\" screens. Presets gives you control over saving, deleting, importing, and exporting presets. Settings allows you to launch the User Guide, Tutorial, or perform a reset if something isn't working right. The Theme Builder allows you to completely customize the color scheme of eq+.",
    blurbLocation: "top-left",
    actionsType: "NEXT"
  },
  {
    elementId: "bypass",
    message: "To toggle the \"bypass\", click this button.",
    blurbLocation: "top-right",
    actionsType: "NEXT"
  },
  {
    message: "That's it! Click \"Done\" to get started.",
    blurbLocation: "center",
    actionsType: "END"
  }
];

const TutorialWrapper = styled(VBox)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 99;
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  border: 1px solid ${( { theme }) => theme.colors.accentPrimary};
  box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.7);
  z-index: 999;
`;

const Blurb = styled.div`
  position: absolute;
  padding: 16px;
  z-index: 9999;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.accentPrimary};
  border-radius: 4px;
  max-width: 400px;
`;

function Indicator({ x, y, w, h }: Rect) {
  return (
    <IndicatorWrapper style={{ left: x, top: y, width: w, height: h }} />
  );
}

const centeredProperties: CSSProperties = {
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)"
};

const fullWidth = 800;
const fullHeight = 600;
const pad = 6;
const calculateBlurbPosition = (indicatorRect: Rect, location: Location) => {
  const styleParams: CSSProperties = {};
  if (location === "center") return centeredProperties;
  switch (location) {
    case "top-center":
      styleParams.bottom = fullHeight - indicatorRect.y + pad;
      styleParams.left = "50%";
      styleParams.transform = "translate(-50%, 0%)";
      break;
    case "bottom-center":
      styleParams.top = indicatorRect.y + indicatorRect.h + pad;
      styleParams.left = "50%";
      styleParams.transform = "translate(-50%, 0%)";
      break;
    case "top-left":
      styleParams.bottom = fullHeight - indicatorRect.y + pad;
      styleParams.right = fullWidth - indicatorRect.x + pad;
      break;
    case "top-right":
      styleParams.bottom = fullHeight - indicatorRect.y + pad;
      styleParams.left = indicatorRect.x + pad;
      break;
  }
  return styleParams;
};

type Position = { x: number, y: number };
type Dimension = { w: number, h: number };
type Rect = Position & Dimension;

export type TutorialProps = {
  onDone: () => void
};

function Tutorial({ onDone }: TutorialProps) {
  const [ currentStep, setCurrentStep ] = useState(0);
  const [ currentInfo, setCurrentInfo ] = useState<TutorialStep>(tutorialSteps[0]);
  const [ indicatorRect, setIndicatorRect ] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [ blurbStyle, setBlurbStyle ] = useState<CSSProperties>(centeredProperties);

  useEffect(() => {
    const step = tutorialSteps[currentStep];
    setCurrentInfo(step);
    if (step.elementId) {
      const el = document.getElementById(step.elementId)!;
      const { x, y, width: w, height: h } = el.getBoundingClientRect();

      setIndicatorRect({ x, y, w, h });
      setBlurbStyle(calculateBlurbPosition({ x, y, w, h }, step.blurbLocation));
    } else {
      setBlurbStyle(calculateBlurbPosition({ x: 0, y: 0, w: 0, h: 0 }, step.blurbLocation));
    }
  }, [currentStep]);

  const next = useCallback(() => setCurrentStep(prev => prev + 1), []);

  const actionButtons = useMemo(() => {
    switch (currentInfo.actionsType) {
      case "START":
        return (
          <>
            <Button onClick={next}>Start</Button>
            <Button onClick={onDone}>Skip</Button>
          </>
        );
      case "NEXT":
        return (
          <Button onClick={next}>Next</Button>
        );
      case "END":
        return (
          <Button onClick={onDone}>Done</Button>
        );
    }
  }, [currentInfo, next, onDone]);

  return (
    <TutorialWrapper>
      {indicatorRect && <Indicator {...indicatorRect} />}
      <Blurb style={blurbStyle}>
        <div style={{ textAlign: "center" }}>{currentInfo.message}</div>
        <VSpacer size={2} />
        <HBox $alignItems="center" $justifyContent="center" style={{ gap: "6px" }}>
          {actionButtons}
        </HBox>
      </Blurb>
    </TutorialWrapper>
  );
}

export { Tutorial };
