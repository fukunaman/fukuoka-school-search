import type { AppState, DOMElements, TownSuggestion, SchoolSuggestion } from './types';
import { DOM_IDS } from './constants';
/**
 * アプリケーション状態管理クラス
 */
export class StateManager {
  private state: AppState;
  constructor() {
    this.state = {
      elements: {} as DOMElements,
      allTowns: [],
      allSchools: [],
      selectedTownSuggestionIndex: -1,
      selectedSchoolSuggestionIndex: -1,
    };
  }

  /**
   * DOM要素を初期化
   */
  initializeElements(): boolean {
    try {
      const elements = {} as DOMElements;
      for (const [key, id] of Object.entries(DOM_IDS)) {
        const element = document.getElementById(id);
        if (!element) {
          return false;
        }
        (elements as any)[key] = element;
      }
      this.state.elements = elements;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 町名データを設定
   */
  setTowns(towns: TownSuggestion[]): void {
    this.state.allTowns = towns;
  }

  /**
   * 学校データを設定
   */
  setSchools(schools: SchoolSuggestion[]): void {
    this.state.allSchools = schools;
  }

  /**
   * DOM要素を取得
   */
  getElements(): DOMElements {
    return this.state.elements;
  }

  /**
   * 町名データを取得
   */
  getTowns(): TownSuggestion[] {
    return this.state.allTowns;
  }

  /**
   * 学校データを取得
   */
  getSchools(): SchoolSuggestion[] {
    return this.state.allSchools;
  }

  /**
   * 町名サジェストの選択インデックスを取得
   */
  getTownSuggestionIndex(): number {
    return this.state.selectedTownSuggestionIndex;
  }

  /**
   * 町名サジェストの選択インデックスを設定
   */
  setTownSuggestionIndex(index: number): void {
    this.state.selectedTownSuggestionIndex = index;
  }

  /**
   * 学校サジェストの選択インデックスを取得
   */
  getSchoolSuggestionIndex(): number {
    return this.state.selectedSchoolSuggestionIndex;
  }

  /**
   * 学校サジェストの選択インデックスを設定
   */
  setSchoolSuggestionIndex(index: number): void {
    this.state.selectedSchoolSuggestionIndex = index;
  }
}
