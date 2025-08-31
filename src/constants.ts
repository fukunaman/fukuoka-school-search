// DOM要素のID定数
export const DOM_IDS = {
  wardSelect: 'ward-select',
  townSelect: 'town-select',
  chomeSelect: 'chome-select',
  addressText: 'address-text',
  suggestionsDiv: 'suggestions',
  resultsSection: 'results-section',
  elementaryResult: 'elementary-result',
  middleResult: 'middle-result',
  highSchoolResult: 'high-school-result',
  noteSection: 'note-section',
  noteResult: 'note-result',
  errorMessage: 'error-message',
  townAreaResults: 'town-area-results',
  townAreaList: 'town-area-list',
  schoolSearchText: 'school-search-text',
  schoolSuggestionsDiv: 'school-suggestions',
  schoolResultsSection: 'school-results-section',
  schoolAreaList: 'school-area-list',
} as const;
// CSS クラス名定数
export const CSS_CLASSES = {
  suggestionItem: 'suggestion-item',
  selected: 'selected',
  areaTable: 'area-table',
  schoolLink: 'school-link',
  townLink: 'town-link',
  noResults: 'no-results',
} as const;
// HTML テンプレート定数
export const HTML_TEMPLATES = {
  areaTableHeader:
    '<table class="area-table"><thead><tr><th>区</th><th>町名</th><th>丁目</th><th>小学校</th><th>中学校</th><th>高校学区</th></tr></thead><tbody>',
  areaTableFooter: '</tbody></table>',
  noResults: '<p class="no-results">該当する住所が見つかりませんでした。</p>',
} as const;
// アプリケーション設定定数
export const APP_CONFIG = {
  maxSuggestions: 10,
  suggestionHideDelay: 200,
  scrollBehavior: 'smooth' as ScrollBehavior,
  defaultHighSchoolDistrict: '情報なし',
} as const;
// プレースホルダーテキスト
export const PLACEHOLDER_TEXTS = {
  selectWard: '区を選択',
  selectTown: '町名を選択',
  selectChome: '丁目を選択',
  townNameOnly: '(町名のみ)',
} as const;
