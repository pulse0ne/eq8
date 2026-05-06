import { useCallback, useState } from "react";
import { useTheme } from "styled-components";
import { Button, HBox, VBox, VSpacer } from "./components/index.tsx";
import { UserSettings } from "../core/types/settings.ts";
import { ClickableIcon, CloseButton, DialogWrapper } from "./Common.tsx";

const openUserGuide = () => {
  browser.tabs.create({
    active: true,
    pinned: false,
    url: "https://github.com/pulse0ne/eqplus/wiki/User-Guide"
  });
};

export type SettingsProps = {
  close: () => void,
  settings: UserSettings,
  onSettingsChanged: (newSettings: UserSettings) => void,
  onLaunchTutorial: () => void
};

function Settings({
  close,
  settings,
  onSettingsChanged,
  onLaunchTutorial
}: SettingsProps) {
  const [ showResetWarning, setShowResetWarning ] = useState(false);

  const theme = useTheme();

  const doReset = useCallback(() => {
    // chrome.runtime.sendMessage({ type: "stopCapture" });
    browser.storage.local.clear();
    window.close();
  }, []);

  // const handleCaptureOnOpenToggle = useCallback(() => {
  //   onSettingsChanged({ ...settings, captureOnOpen: !settings.captureOnOpen });
  // }, [onSettingsChanged, settings]);

  const handleDrawCompositeResponseToggle = useCallback(() => {
    onSettingsChanged({ ...settings, drawCompositeResponse: !settings.drawCompositeResponse });
  }, [onSettingsChanged, settings]);

  return (
    <DialogWrapper>
      <HBox $alignItems="center" $justifyContent="space-between">
        <h3 style={{ padding: 0, margin: 0 }}>Settings</h3>
        <CloseButton glyph="clear" onClick={close} />
      </HBox>

      <VSpacer size={2} />

      {/*<HBox style={{ gap: "8px" }} alignItems="center" justifyContent="space-between">
        <span title="Enabling this will start a capture when you open the eq+ popup, without having to push the "Capture Tab" button">Capture on open:</span>
        <ClickableIcon
          size={32}
          glyph={settings.captureOnOpen ? "toggle_on" : "toggle_off"}
          style={{ color: settings.captureOnOpen ? theme.colors.accentPrimary : theme.colors.text }}
          onClick={handleCaptureOnOpenToggle}
        />
      </HBox>*/}

      <HBox style={{ gap: "8px" }} $alignItems="center" $justifyContent="space-between">
        <span title="Enabling this will draw the composite response line">Draw composite response:</span>
        <ClickableIcon
          size={32}
          glyph={settings.drawCompositeResponse ? "toggle_on" : "toggle_off"}
          style={{ color: settings.drawCompositeResponse ? theme.colors.accentPrimary : theme.colors.text }}
          onClick={handleDrawCompositeResponseToggle}
        />
      </HBox>

      <VSpacer size={2} />

      {showResetWarning ? (
        <VBox $alignItems="center">
          <span style={{ fontSize: "10px", marginBottom: "6px", maxWidth: "100px" }}>Are you <i>absolutely</i> sure you want to reset? This will erase all saved presets and themes.</span>
          <HBox $alignItems="center" style={{ gap: "6px" }}>
            <Button onClick={doReset}>Yes</Button>
            <Button onClick={() => setShowResetWarning(false)}>No</Button>
          </HBox>
        </VBox>
      ) : (
        <VBox style={{ gap: "6px" }}>
          <Button onClick={openUserGuide}>User Manual</Button>
          <Button onClick={onLaunchTutorial}>Launch Tutorial</Button>
          <Button onClick={() => setShowResetWarning(true)}>Factory Reset</Button>
        </VBox>
      )}

    </DialogWrapper>
  );
}

export { Settings };
