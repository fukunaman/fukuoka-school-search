export interface SchoolInfo {
  elementary: string;
  middle: string;
  note?: string;
  area?: string;
  highSchoolDistrict?: string;
}
export interface ChomeData {
  [chome: string]: SchoolInfo;
}
export interface TownData {
  [town: string]: ChomeData;
}
export interface SchoolData {
  [ward: string]: TownData;
}
export interface SearchResult {
  elementary: string;
  middle: string;
  highSchoolDistrict?: string;
  note?: string;
}
export interface HighSchoolData {
  [key: string]: string; // "区名:中学校名" -> 学区
}
export interface DOMElements {
  // 住所検索関連
  wardSelect: HTMLSelectElement;
  townSelect: HTMLSelectElement;
  chomeSelect: HTMLSelectElement;
  addressText: HTMLInputElement;
  suggestionsDiv: HTMLElement;
  // 結果表示関連
  resultsSection: HTMLElement;
  elementaryResult: HTMLElement;
  middleResult: HTMLElement;
  highSchoolResult: HTMLElement;
  noteSection: HTMLElement;
  noteResult: HTMLElement;
  errorMessage: HTMLElement;
  townAreaResults: HTMLElement;
  townAreaList: HTMLElement;
  // 学校名検索関連
  schoolSearchText: HTMLInputElement;
  schoolSuggestionsDiv: HTMLElement;
  schoolResultsSection: HTMLElement;
  schoolAreaList: HTMLElement;
}
export interface TownSuggestion {
  ward: string;
  town: string;
}
export interface SchoolSuggestion {
  name: string;
  type: 'elementary' | 'middle';
}
export interface AreaData {
  ward: string;
  town: string;
  chome: string;
  elementary: string;
  middle: string;
  highSchoolDistrict?: string;
}
export interface AppState {
  elements: DOMElements;
  allTowns: TownSuggestion[];
  allSchools: SchoolSuggestion[];
  selectedTownSuggestionIndex: number;
  selectedSchoolSuggestionIndex: number;
}
