import { ChangeEvent, InputHTMLAttributes, SelectHTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RgbaStringColorPicker } from "react-colorful";
import { DefaultTheme, keyframes, styled } from "styled-components";
import { HBox, HSpacer, Icon, VBox, VSpacer } from "./components/index.tsx";
import { DEFAULT_THEMES } from "../core/defaults.ts";
import { exportThemes, importThemes } from "../core/import-export/themes.ts";
import { StorageKeys } from "../core/storage-keys.ts";
import { Color } from "../core/types/color.ts";
import { Rect } from "../core/types/rect.ts";
import { Theme } from "../core/types/theme.ts";
import camelToTitle from "../core/utils/camelToTitle.ts";
import clamp from "../core/utils/clamp.ts";
import { load, update } from "../core/utils/storageUtils.ts";
import { IndicatorLayer, TextOverflowClip } from "./Common.tsx";
import { Toast, ToastProps } from "./Toast.tsx";

const blinkAnimation = keyframes`
  50% { opacity: 10%; }
`;

const ScrollBox = styled.div`
  height: 100px;
  max-width: 200px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.5);
`;

const Wrapper = styled(VBox)`
  background: black;
  color: white;
  z-index: 9999;
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 12px;
  box-shadow: black 0px 2px 4px;
  border: 1px solid ${({ theme }) => theme.colors.accentPrimary};
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  background: ${({ theme }) => theme.colors.accentPrimary};
  animation: 1s ease-in-out infinite ${blinkAnimation};
  opacity: 50%;
`;

const ColorPicker = styled(RgbaStringColorPicker)`
  &.react-colorful {
    height: 175px;
    width: 200px;
  }

  & .react-colorful__saturation-pointer {
    width: 12px;
    height: 12px;
    border-radius: 6px;
  }

  & .react-colorful__hue-pointer,
  & .react-colorful__alpha-pointer {
    width: 8px;
    border-radius: 2px;
  }

  & .react-colorful__saturation,
  & .react-colorful__last-control {
    border-radius: 0;
  }
`;

const CloseButton = styled(Icon)`
  cursor: pointer;
  &:hover {
    color: red;
  }
`;

type Labeled = { label: string };

function LabeledSelect(props: SelectHTMLAttributes<HTMLSelectElement> & Labeled) {
  return (
    <VBox>
      <label style={{ fontSize: "10px", textTransform: "uppercase" }}>{props.label}</label>
      <select {...props}>{props.children}</select>
    </VBox>
  );
}

function LabeledInput(props: InputHTMLAttributes<HTMLInputElement> & Labeled) {
  return (
    <VBox>
      <label style={{ fontSize: "10px", textTransform: "uppercase" }}>{props.label}</label>
      <input {...props} />
    </VBox>
  );
}
function Indicator({ x, y, w, h }: Rect) {
  return (
    <IndicatorWrapper style={{ left: x, top: y, width: w, height: h }} />
  );
}

const rgbaRegex = /rgba\((?<r>\d+?), (?<g>\d+?), (?<b>\d+?), (?<a>.+?)\)/;
function extractRGBA(raw: string): { r: number, g: number, b: number, a: number } {
  const matches = rgbaRegex.exec(raw);
  if (!matches || !matches.groups) return { r: 0, g: 0, b: 0, a: 1.0 };
  const { r, g, b, a } = matches.groups;
  return {
    r: parseInt(r, 10),
    g: parseInt(g, 10),
    b: parseInt(b, 10),
    a: parseFloat(a)
  };
}

type ThemeColorKey = keyof Theme["colors"];

export type ThemeBuilderProps = {
  currentTheme: DefaultTheme,
  themeChanged: (newTheme: DefaultTheme) => void,
  close: () => void
}

function ThemeBuilder({
  currentTheme,
  themeChanged,
  close
}: ThemeBuilderProps) {

  const [ currentKey, setCurrentKey ] = useState<ThemeColorKey>(Object.keys(DEFAULT_THEMES[0].colors)[0] as ThemeColorKey);
  const [ indicators, setIndicators ] = useState<Rect[]>([]);
  const [ allThemes, setAllThemes ] = useState<Theme[]>([]);
  const [ isSavingTheme, setSavingTheme ] = useState(false);
  const [ newThemeName, setNewThemeName ] = useState('');
  const [ showToast, setShowToast ] = useState(false);
  const [ toastInfo, setToastInfo ] = useState<Omit<ToastProps, "onClose">>({ messages: [], glyph: '' });

  const inputFileRef = useRef<HTMLInputElement|null>(null);

  useEffect(() => {
    const components = document.querySelectorAll(`.themed.${currentKey}`);
    setIndicators([...components].map(c => {
      const m = c.getBoundingClientRect();
      return { x: m.left + window.scrollX, y: m.top + window.scrollY, w: m.width, h: m.height };
    }));
    const id = setTimeout(() => setIndicators([]), 2000);
    return () => clearTimeout(id);
  }, [currentKey]);

  useEffect(() => {
    load<Theme[]>(StorageKeys.SAVED_THEMES, []).then(userThemes => setAllThemes([...DEFAULT_THEMES, ...userThemes]));
  }, []);

  const handleKeyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentKey(e.target.value as ThemeColorKey);
  }, []);

  const handleColorChange = useCallback((newColor: string) => {
    themeChanged({
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        [currentKey]: newColor as Color
      }
    });
  }, [currentKey, currentTheme, themeChanged]);

  const handleColorInput = useCallback((rgb: "r"|"g"|"b", e: ChangeEvent<HTMLInputElement>) => {
    const extracted = extractRGBA(currentTheme.colors[currentKey]);
    extracted[rgb] = clamp(parseInt(e.target.value), 0, 255);
    handleColorChange(`rgba(${extracted.r}, ${extracted.g}, ${extracted.b}, ${extracted.a})`);
  }, [currentKey, currentTheme.colors, handleColorChange]);

  const handleLoadTheme = useCallback((theme: Theme) => {
    themeChanged(theme);
  }, [themeChanged]);

  const handleDeleteTheme = useCallback((theme: Theme) => {
    if (theme.locked) return;
    update<Theme[]>(StorageKeys.SAVED_THEMES, [], userThemes => userThemes.filter(t => t.name !== theme.name))
      .then(themes => setAllThemes([...DEFAULT_THEMES, ...themes]));
  }, []);

  const handleThemeNameInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNewThemeName(e.target.value);
  }, []);

  const saveTheme = useCallback(() => {
    update<Theme[]>(StorageKeys.SAVED_THEMES, [], userThemes => [...userThemes, { ...currentTheme, name: newThemeName, locked: false }])
      .then(themes => setAllThemes([...DEFAULT_THEMES, ...themes]))
      .finally(() => {
        setNewThemeName('');
        setSavingTheme(false);
      });
  }, [currentTheme, newThemeName]);

  const handleImportClicked = useCallback(() => {
    inputFileRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      importThemes(e.target.files[0]).then(themes => {
        if (themes) {
          setAllThemes([...DEFAULT_THEMES, ...themes]);
          setToastInfo({ messages: ["Successfully imported themes"], glyph: "done" });
        } else {
          setToastInfo({ messages: ["Failed to import themes: malformed file"], glyph: "error_outline" });
        }
        setShowToast(true);
      });
    }
  }, []);

  const isThemeNameValid = useMemo(() => newThemeName && !allThemes.some(t => t.name.toLowerCase() === newThemeName.toLowerCase()), [newThemeName, allThemes]);

  const { r, g, b } = useMemo(() => extractRGBA(currentTheme.colors[currentKey]), [currentKey, currentTheme]);

  return (
    <>
      <Wrapper>
        <HBox $alignItems="center" $justifyContent="space-between">
          <h3 style={{ padding: 0, margin: 0 }}>Theme Editor</h3>
          <CloseButton glyph="clear" onClick={close} />
        </HBox>

        <VSpacer size={2} />
        <LabeledSelect label="Color Class" onChange={handleKeyChange}>
          {Object.keys(DEFAULT_THEMES[0].colors).map(colorKey => <option key={colorKey} value={colorKey}>{camelToTitle(colorKey)}</option>)}
        </LabeledSelect>
        <VSpacer size={2} />
        <ColorPicker color={currentTheme.colors[currentKey]} onChange={handleColorChange} />
        <HBox $justifyContent="space-evenly">
          <LabeledInput value={r} type="number" max={255} min={0} step={1} style={{ width: 50 }} onChange={e => handleColorInput("r", e)} label="Red" />
          <LabeledInput value={g} type="number" max={255} min={0} step={1} style={{ width: 50 }} onChange={e => handleColorInput("g", e)} label="Green" />
          <LabeledInput value={b} type="number" max={255} min={0} step={1} style={{ width: 50 }} onChange={e => handleColorInput("b", e)} label="Blue" />
        </HBox>
        <VSpacer size={2} />
        <VBox>
          {isSavingTheme ? (
            <HBox>
              <input placeholder="Theme name" value={newThemeName} onChange={handleThemeNameInput} />
              <button disabled={!isThemeNameValid} onClick={saveTheme}>Save</button>
            </HBox>
          ) : (
            <button onClick={() => setSavingTheme(true)}>Save As...</button>
          )}
        </VBox>
        <VSpacer size={1} />
        <span style={{ fontSize: "10px" }}>THEMES</span>
        <ScrollBox>
          {allThemes.map(t => (
            <HBox
              key={t.name}
              style={{ background: t.colors.background, color: t.colors.accentPrimary, padding: "6px 12px" }}
              $justifyContent="space-between"
              $alignItems="center"
            >
              <TextOverflowClip>{t.name}</TextOverflowClip>
              <HBox $alignItems="center">
                <HSpacer size={1} />
                <Icon glyph="launch" style={{ cursor: "pointer" }} onClick={() => handleLoadTheme(t)} />
                <HSpacer size={1} />
                <Icon glyph={t.locked ? "https" : "clear"} style={{ cursor: t.locked ? "default" : "pointer" }} onClick={() => handleDeleteTheme(t)} />
              </HBox>
            </HBox>
          ))}
        </ScrollBox>
        <VSpacer size={1} />
        <HBox $justifyContent="center" style={{ gap: "6px" }}>
          <button onClick={() => exportThemes()}>Export</button>
          <input
            ref={inputFileRef}
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />
          <button onClick={handleImportClicked}>Import</button>
        </HBox>
      </Wrapper>

      <IndicatorLayer>
        {indicators.map((i, ix) => <Indicator key={ix} {...i} />)}
      </IndicatorLayer>

      {showToast && (
        <Toast
          messages={toastInfo.messages}
          glyph={toastInfo.glyph}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}

export { ThemeBuilder };
