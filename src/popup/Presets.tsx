import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, HBox, HSpacer, VBox, VSpacer } from "./components/index.tsx";
import { exportPresets, importPreset } from "../core/import-export/preset.ts";
import { StorageKeys } from "../core/storage-keys.ts";
import { FilterParams } from "../core/types/filter.ts";
import { Preset } from "../core/types/preset.ts";
import { load, update } from "../core/utils/storageUtils.ts";
import { ClickableIcon, CloseButton, DialogWrapper, InlineButton, InlineInput, ScrollBox, TextOverflowClip } from "./Common.tsx";
import { Toast, ToastProps } from "./Toast.tsx";

type PresetsProps = {
  currentState: { filters: FilterParams[], preamp: number },
  close: () => void,
  onLoadPreset: (preset: Preset) => void
};

function Presets({
  currentState,
  close,
  onLoadPreset
}: PresetsProps) {
  const [ savedPresets, setSavedPresets ] = useState<Preset[]>([]);
  const [ isSavingPreset, setIsSavingPreset ] = useState(false);
  const [ newPresetName, setNewPresetName ] = useState("");
  const [ showToast, setShowToast ] = useState(false);
  const [ toastInfo, setToastInfo ] = useState<Omit<ToastProps, "onClose">>({ messages: [], glyph: "" });
  const [ editingPreset, setEditingPreset ] = useState<Preset|null>(null);

  useEffect(() => {
    load<Preset[]>(StorageKeys.PRESETS, []).then(setSavedPresets);
  }, []);

  const inputFileRef = useRef<HTMLInputElement|null>(null);

  const handleDeletePreset = useCallback((preset: Preset) => {
    setSavedPresets(oldPresets => oldPresets.filter(p => p.name !== preset.name));
    update<Preset[]>(StorageKeys.PRESETS, [], oldPresets => oldPresets.filter(p => p.name !== preset.name));
  }, []);

  const handlePresetNameInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNewPresetName(e.target.value);
  }, []);

  const savePreset = useCallback(() => {
    update<Preset[]>(StorageKeys.PRESETS, [], oldPresets => {
      const newPreset: Preset = {
        filters: currentState.filters,
        preampGain: currentState.preamp,
        locked: false,
        name: newPresetName
      };
      return [...oldPresets, newPreset];
    }).then(setSavedPresets)
    .finally(() => {
      setNewPresetName("");
      setIsSavingPreset(false);
    });
  }, [currentState, newPresetName]);

  const saveNameChange = useCallback(() => {
    if (!editingPreset) return;
    update<Preset[]>(StorageKeys.PRESETS, [], existing => {
      const target = existing.find(e => e.name === editingPreset.name);
      if (!target) return existing;
      target.name = newPresetName;
      return [...existing];
    }).then(setSavedPresets)
    .finally(() => {
      setNewPresetName("");
      setEditingPreset(null);
    });
  }, [newPresetName, editingPreset]);

  const isNameValid = useMemo(() => {
    return Boolean(newPresetName) && !savedPresets.some(p => p.name.toLowerCase() === newPresetName.toLowerCase());
  }, [newPresetName, savedPresets]);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      importPreset(e.target.files[0])
        .then(results => {
          if (results.softErrors.length) {
            setToastInfo({ messages: ["Imported preset with the following warnings:", ...results.softErrors.map(e => `• ${e}`)], glyph: "info_outline" });
          } else {
            setToastInfo({ messages: ["Successfully imported preset"], glyph: "done" });
          }
          setSavedPresets([...savedPresets, results.preset]);
        })
        .catch(e => setToastInfo({ messages: [`Failed to import preset: ${e.message}`], glyph: "error_outline" }))
        .finally(() => setShowToast(true));
    }
  }, [savedPresets]);

  const handleStartRenamingPreset = useCallback((preset: Preset) => {
    setNewPresetName(preset.name);
    setEditingPreset(preset);
  }, []);

  const handleCancelRenamingPreset = useCallback(() => {
    setNewPresetName("");
    setEditingPreset(null);
  }, []);

  const handleImportClicked = useCallback(() => {
    inputFileRef.current?.click();
  }, []);

  return (
    <>
      <DialogWrapper>
        <HBox $alignItems="center" $justifyContent="space-between">
          <h3 style={{ padding: 0, margin: 0 }}>Presets</h3>
          <CloseButton glyph="clear" onClick={close} />
        </HBox>

      <VSpacer size={2} />

        <VBox>
          {isSavingPreset ? (
            <HBox>
              <input placeholder="Preset name" value={newPresetName} onChange={handlePresetNameInput} />
              <Button disabled={!isNameValid} onClick={savePreset}>Save</Button>
            </HBox>
          ) : (
            <Button onClick={() => setIsSavingPreset(true)}>New Preset</Button>
            )}
        </VBox>

        <VSpacer size={1} />

        <span style={{ fontSize: "10px" }}>PRESETS</span>
        <ScrollBox>
          {savedPresets.map(p => (
            <HBox
            key={p.name}
            style={{ padding: "6px 12px" }}
            $justifyContent="space-between"
            $alignItems="center"
            >
            {(editingPreset && editingPreset.name === p.name) ? (
              <HBox $alignItems="center">
                <InlineInput value={newPresetName} onChange={handlePresetNameInput} />
                <InlineButton disabled={!isNameValid} onClick={saveNameChange}>Save</InlineButton>
                <InlineButton onClick={handleCancelRenamingPreset}>Cancel</InlineButton>
              </HBox>
            ) : (
              <>
                <TextOverflowClip>{p.name}</TextOverflowClip>
                <HBox $alignItems="center">
                  <ClickableIcon glyph="create" onClick={() => handleStartRenamingPreset(p)} />
                  <HSpacer size={1} />
                  <ClickableIcon glyph="launch" onClick={() => onLoadPreset(p)} />
                  <HSpacer size={1} />
                  <ClickableIcon glyph="clear" onClick={() => handleDeletePreset(p)} />
                </HBox>
              </>
            )}
            </HBox>
          ))}
        </ScrollBox>
        <VSpacer size={1} />
        <HBox $justifyContent="center" style={{ gap: "6px" }}>
          <Button onClick={() => exportPresets()} disabled={!savedPresets.length}>Export</Button>
          <input
            ref={inputFileRef}
            type="file"
            accept=".txt"
            onChange={handleFileInputChange}
            style={{ display: "none"}}
            />
          <Button onClick={handleImportClicked}>Import</Button>
        </HBox>
      </DialogWrapper>

      {showToast && (
        <Toast
          messages={toastInfo.messages}
          glyph={toastInfo.glyph}
          onClose={() => setShowToast(false)}
          timeoutMs={toastInfo.glyph !== "done" ? 10000 : 5000}
        />
      )}
    </>
  );
}

export { Presets };
