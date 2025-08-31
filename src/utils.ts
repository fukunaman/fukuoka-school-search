import type { AreaData } from './types';
import { HTML_TEMPLATES, CSS_CLASSES, APP_CONFIG } from './constants';
/**
 * DOM操作ユーティリティクラス
 */
export class DOMUtils {
  /**
   * セレクトオプションを作成
   */
  static createSelectOptions(items: string[], emptyText: string): DocumentFragment {
    const fragment = document.createDocumentFragment();
    // 空のオプションを追加
    fragment.appendChild(this.createOption('', emptyText));
    // アイテムのオプションを追加
    items.forEach((item) => {
      fragment.appendChild(this.createOption(item, item));
    });
    return fragment;
  }
  /**
   * オプション要素を作成
   */
  private static createOption(value: string, text: string): HTMLOptionElement {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    return option;
  }
  /**
   * エリアテーブルのHTMLを作成
   */
  static createAreaTableHTML(
    areas: AreaData[],
    title: string,
    options: { townClickable?: boolean } = {}
  ): string {
    if (areas.length === 0) {
      return `<h3>${title}</h3>${HTML_TEMPLATES.noResults}`;
    }
    const { townClickable = true } = options;
    let html = `<h3>${title}</h3>${HTML_TEMPLATES.areaTableHeader}`;
    areas.forEach((area) => {
      html += this.createTableRow(area, townClickable);
    });
    html += HTML_TEMPLATES.areaTableFooter;
    return html;
  }
  /**
   * テーブル行を作成
   */
  private static createTableRow(area: AreaData, townClickable: boolean = true): string {
    const highSchoolDistrict = area.highSchoolDistrict || APP_CONFIG.defaultHighSchoolDistrict;
    
    return `<tr>
            <td>${this.escapeHtml(area.ward)}</td>
            <td>${this.createTownCell(area.ward, area.town, townClickable)}</td>
            <td>${this.escapeHtml(area.chome)}</td>
            <td>${this.createSchoolCell(area.elementary)}</td>
            <td>${this.createSchoolCell(area.middle)}</td>
            <td>${this.createDistrictHTML(highSchoolDistrict)}</td>
        </tr>`;
  }
  /**
   * 高校学区の表示HTMLを作成
   */
  private static createDistrictHTML(district: string): string {
    switch (district) {
      case '第４学区':
        return `第<span class="district-4">４</span>学区`;
      case '第５学区':
        return `第<span class="district-5">５</span>学区`;
      case '第６学区':
        return `第<span class="district-6">６</span>学区`;
      default:
        return this.escapeHtml(district);
    }
  }
  
  /**
   * 町名セルを作成
   */
  static createTownCell(ward: string, town: string, isClickable: boolean = true): string {
    if (isClickable) {
      return `<span class="${CSS_CLASSES.townLink}" data-ward="${this.escapeHtml(ward)}" data-town="${this.escapeHtml(town)}">${this.escapeHtml(town)}</span>`;
    } else {
      return this.escapeHtml(town);
    }
  }
  /**
   * 学校名セルを作成
   */
  static createSchoolCell(schoolName: string): string {
    return `<span class="${CSS_CLASSES.schoolLink}" data-school="${this.escapeHtml(schoolName)}">${this.escapeHtml(schoolName)}</span>`;
  }
  /**
   * HTMLエスケープ
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  /**
   * クリックハンドラーを追加
   */
  static addClickHandlers(
    container: HTMLElement,
    selector: string,
    handler: (element: HTMLElement) => void
  ): void {
    const links = container.querySelectorAll(selector);
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        handler(e.target as HTMLElement);
      });
    });
  }
}
/**
 * ナビゲーションユーティリティクラス
 */
export class NavigationUtils {
  /**
   * 要素までスクロール
   */
  static scrollToElement(element: HTMLElement): void {
    element.scrollIntoView({ behavior: APP_CONFIG.scrollBehavior });
  }
  /**
   * フォームの値を設定
   */
  static setFormValues(
    wardSelect: HTMLSelectElement,
    townSelect: HTMLSelectElement,
    ward: string,
    town?: string
  ): Promise<void> {
    return new Promise((resolve) => {
      wardSelect.value = ward;
      // 町選択の更新をトリガー
      wardSelect.dispatchEvent(new Event('change'));
      if (town) {
        setTimeout(() => {
          townSelect.value = town;
          townSelect.dispatchEvent(new Event('change'));
          // 更新完了を待つ
          setTimeout(() => resolve(), 150);
        }, 100);
      } else {
        setTimeout(() => resolve(), 50);
      }
    });
  }
}
/**
 * 検索ユーティリティクラス
 */
export class SearchUtils {
  /**
   * クエリでアイテムをフィルタリング
   */
  static filterItems<T>(items: T[], query: string, getSearchText: (item: T) => string): T[] {
    if (!query.trim()) return [];
    const normalizedQuery = query.toLowerCase().trim();
    return items
      .filter((item) => getSearchText(item).toLowerCase().includes(normalizedQuery))
      .slice(0, APP_CONFIG.maxSuggestions);
  }
}
/**
 * エラーハンドリングユーティリティ
 */
export class ErrorUtils {
  /**
   * エラーメッセージを表示
   */
  static showError(element: HTMLElement, message: string): void {
    const errorParagraph = element.querySelector('p');
    if (errorParagraph) {
      errorParagraph.textContent = message;
    }
    element.style.display = 'block';
  }
  /**
   * エラーメッセージを非表示
   */
  static hideError(element: HTMLElement): void {
    element.style.display = 'none';
  }
}
