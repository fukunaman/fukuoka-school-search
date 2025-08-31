import { getAllTowns, getAllSchools } from './data';
import { StateManager } from './state';
import { APP_CONFIG } from './constants';
import {
  AddressSearchManager,
  DisplayManager,
  TownSuggestionsManager,
  SchoolSuggestionsManager,
} from './managers';

// =============================================================================
// アプリケーション状態とインスタンス
// =============================================================================

const appState = new StateManager();
let addressSearchManager: AddressSearchManager;
let townSuggestions: TownSuggestionsManager;
let schoolSuggestions: SchoolSuggestionsManager;

// =============================================================================
// イベントリスナー設定
// =============================================================================

function setupEventListeners(): void {
  const elements = appState.getElements();

  // 住所検索関連
  elements.wardSelect.addEventListener('change', () => {
    addressSearchManager.updateTownOptions();
    DisplayManager.hideAll(appState);
  });

  elements.townSelect.addEventListener('change', () => {
    addressSearchManager.updateChomeOptions();
    DisplayManager.hideAll(appState);
  });

  elements.chomeSelect.addEventListener('change', () => {
    addressSearchManager.handleChomeSelection();
  });

  elements.addressText.addEventListener('input', () => townSuggestions.handleInput());
  elements.addressText.addEventListener('keydown', (e) => townSuggestions.handleKeyDown(e));
  elements.addressText.addEventListener('blur', () => {
    setTimeout(() => townSuggestions.hide(), APP_CONFIG.suggestionHideDelay);
  });
  elements.addressText.addEventListener('focus', () => {
    if (elements.addressText.value.trim()) {
      townSuggestions.handleInput();
    }
  });

  // 学校名検索関連
  elements.schoolSearchText.addEventListener('input', () => schoolSuggestions.handleInput());
  elements.schoolSearchText.addEventListener('keydown', (e) => schoolSuggestions.handleKeyDown(e));
  elements.schoolSearchText.addEventListener('blur', () => {
    setTimeout(() => schoolSuggestions.hide(), APP_CONFIG.suggestionHideDelay);
  });
  elements.schoolSearchText.addEventListener('focus', () => {
    if (elements.schoolSearchText.value.trim()) {
      schoolSuggestions.handleInput();
    }
  });
}

// =============================================================================
// アプリケーション初期化
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  if (!appState.initializeElements()) {
    return;
  }

  appState.setTowns(getAllTowns());
  appState.setSchools(getAllSchools());

  // インスタンス初期化
  addressSearchManager = new AddressSearchManager(appState);
  townSuggestions = new TownSuggestionsManager(appState);
  schoolSuggestions = new SchoolSuggestionsManager(appState);

  setupEventListeners();
  DisplayManager.hideAll(appState);
  appState.getElements().addressText.focus();
});
