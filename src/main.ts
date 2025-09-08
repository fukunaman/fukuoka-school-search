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
// URL検索パラメータ処理
// =============================================================================

function handleSearchParams(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q');
  const schoolSearchTerm = urlParams.get('school');
  const autoSelect = urlParams.get('auto') !== 'false'; // auto=false以外は自動選択（デフォルトtrue）
  
  if (searchTerm && searchTerm.trim()) {
    const elements = appState.getElements();
    elements.addressText.value = searchTerm.trim();
    
    // 少し遅延させて検索を実行（初期化完了を確実にする）
    setTimeout(() => {
      // inputイベントをトリガーして検索実行
      const event = new Event('input', { bubbles: true });
      elements.addressText.dispatchEvent(event);
      
      // 自動選択が有効な場合、最初の候補をクリック
      if (autoSelect) {
        // 候補が表示されるまで待機
        const waitForSuggestion = setInterval(() => {
          const firstSuggestion = document.querySelector('.suggestion-item');
          if (firstSuggestion) {
            clearInterval(waitForSuggestion);
            (firstSuggestion as HTMLElement).click();
          }
        }, 100);
        
        // 最大2秒待機
        setTimeout(() => {
          clearInterval(waitForSuggestion);
        }, 2000);
      }
    }, 200);
  } else if (schoolSearchTerm && schoolSearchTerm.trim()) {
    const elements = appState.getElements();
    elements.schoolSearchText.value = schoolSearchTerm.trim();
    
    // 学校検索セクションまでスクロール
    const schoolSection = document.getElementById('reverse-search');
    if (schoolSection) {
      schoolSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 少し遅延させて検索を実行
    setTimeout(() => {
      // inputイベントをトリガーして検索実行
      const event = new Event('input', { bubbles: true });
      elements.schoolSearchText.dispatchEvent(event);
      
      // 自動選択が有効な場合、最初の候補をクリック
      if (autoSelect) {
        // 候補が表示されるまで待機
        const waitForSuggestion = setInterval(() => {
          const firstSuggestion = document.querySelector('#school-suggestions .suggestion-item');
          if (firstSuggestion) {
            clearInterval(waitForSuggestion);
            (firstSuggestion as HTMLElement).click();
          }
        }, 100);
        
        // 最大2秒待機
        setTimeout(() => {
          clearInterval(waitForSuggestion);
        }, 2000);
      }
    }, 300);
  }
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
  
  // URL検索パラメータの処理
  handleSearchParams();
  
  appState.getElements().addressText.focus();
});
