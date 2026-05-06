import { useCallback, useEffect, useState } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { EqualizerControls, VBox } from "./components/index.tsx";
import debounce from "../core/debounce.ts";
import { DEFAULT_SETTINGS, DEFAULT_STATE, DEFAULT_THEMES } from "../core/defaults.ts";
import { StorageKeys } from "../core/storage-keys.ts";
import { FilterChanges, FilterParams } from "../core/types/filter.ts";
import { Preset } from "../core/types/preset.ts";
import { Theme } from "../core/types/theme.ts";
import isDefined from "../core/utils/isDefined.ts";
import { load, save } from "../core/utils/storageUtils.ts";
import throttle from "../core/utils/throttle.ts";
import uuid from "../core/utils/uuid.ts";
import { Settings } from "./Settings.tsx";
import { ThemeBuilder } from "./ThemeBuilder.tsx";
import { Tutorial } from "./Tutorial.tsx";
import GlobalStyles from "./globalStyles.ts";
import { Presets } from "./Presets.tsx";
import { UserSettings } from "../core/types/settings.ts";
import { ControlMessage } from "../core/types/messaging.ts";

const sendMessage = (message: ControlMessage) => {
  browser.runtime.sendMessage(message);
};

const sendThrottledMessage: (message: ControlMessage) => void = throttle((message: ControlMessage) => {
  sendMessage(message);
}, 100);

const saveThemeDebounced = debounce((theme: Theme) => {
  save(StorageKeys.THEME_STATE, { currentTheme: theme });
}, 500);

function App() {
  const [ theme, setTheme ] = useState<DefaultTheme>(DEFAULT_THEMES[0]);
  const [ filters, setFilters ] = useState<FilterParams[]>([]);
  const [ preamp, setPreamp ] = useState(1.0);
  const [ showThemeBuilder, setShowThemeBuilder ] = useState(false);
  const [ showSettings, setShowSettings ] = useState(false);
  const [ showPresets, setShowPresets ] = useState(false);
  const [ bypassed, setBypassed ] = useState(false);
  const [ showTutorial, setShowTutorial ] = useState(false);
  const [ settings, setSettings ] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    load(StorageKeys.THEME_STATE, { currentTheme: DEFAULT_THEMES[0] }).then(state => {
      setTheme(state.currentTheme);
    });

    load(StorageKeys.EQ_STATE, DEFAULT_STATE).then(state => {
      setFilters(state.filters);
      setPreamp(state.preamp);
      setBypassed(!state.enabled);
    });

    load(StorageKeys.SETTINGS, DEFAULT_SETTINGS).then(settings => setSettings(settings));

    load(StorageKeys.TUTORIAL_SEEN, false).then(val => setShowTutorial(!val));
  }, []);

  useEffect(() => saveThemeDebounced(theme), [theme]);

  const handleFilterChanged = useCallback((index: number, { frequency, gain, q, type }: FilterChanges) => {
    const filter = filters[index];
    if (isDefined(frequency)) filter.frequency = frequency;
    if (isDefined(gain)) filter.gain = gain;
    if (isDefined(q)) filter.q = q;
    if (isDefined(type)) filter.type = type;
    setFilters([...filters]);
    sendThrottledMessage({ type: "updateFilter", payload: filter });
  }, [filters]);

  const handleAddFilter = useCallback((frequency: number) => {
    const newFilter: FilterParams = { id: uuid(), frequency, gain: 0.0, q: 1.0, type: "peaking" };
    const newFilters = [...filters, newFilter];
    setFilters(newFilters);
    sendMessage({ type: "addFilter", payload: newFilter });
  }, [filters]);

  const handleRemoveFilter = useCallback((index: number) => {
    const newFilters = [...filters];
    const [ removed ] = newFilters.splice(index, 1);
    setFilters(newFilters);
    sendMessage({ type: "removeFilter", payload: removed.id });
  }, [filters]);

  const handlePreampChanged = useCallback((value: number) => {
    sendMessage({ type: "updatePreamp", payload: value });
    setPreamp(value);
  }, []);

  const handleBypass = useCallback((bypassed: boolean) => {
    sendMessage({ type: "updateEnabled", payload: !bypassed });
    setBypassed(bypassed);
  }, [])

  const handleLoadPreset = useCallback((preset: Preset) => {
    setFilters(preset.filters);
    handlePreampChanged(preset.preampGain);
    sendMessage({ type: "setFilters", payload: preset.filters });
  }, [handlePreampChanged]);

  const handleLaunchTutorial = useCallback(() => {
    setShowSettings(false);
    setShowTutorial(true);
  }, []);

  const handleTutorialFinished = useCallback(() => {
    save(StorageKeys.TUTORIAL_SEEN, true);
    setShowTutorial(false);
  }, []);

  const handleSettingsChanged = useCallback((newSettings: UserSettings) => {
    save(StorageKeys.SETTINGS, newSettings);
    setSettings(newSettings);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <VBox $alignItems="center" style={{ padding: "6px", height: "100%" }}>
        <EqualizerControls
          filters={filters}
          preamp={preamp}
          bypassed={bypassed}
          drawCompositeResponse={settings.drawCompositeResponse}
          onFilterAdded={handleAddFilter}
          onFilterChanged={handleFilterChanged}
          onFilterRemoved={handleRemoveFilter}
          onPreampChanged={handlePreampChanged}
          onBypassToggled={handleBypass}
          onPresetsClicked={() => setShowPresets(true)}
          onSettingsClicked={() => setShowSettings(true)}
          onThemeBuilderClicked={() => setShowThemeBuilder(true)}
        />
      </VBox>

      {showThemeBuilder && (
        <ThemeBuilder
          currentTheme={theme}
          themeChanged={setTheme}
          close={() => setShowThemeBuilder(false)}
        />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onSettingsChanged={handleSettingsChanged}
          close={() => setShowSettings(false)}
          onLaunchTutorial={handleLaunchTutorial}
        />
      )}

      {showPresets && (
        <Presets
          currentState={{ filters, preamp }}
          onLoadPreset={handleLoadPreset}
          close={() => setShowPresets(false)}
        />
      )}

      {showTutorial && <Tutorial onDone={handleTutorialFinished} />}

      <GlobalStyles />
    </ThemeProvider>
  );
}

export default App;
