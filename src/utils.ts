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
            <td>${this.createDistrictHTML(highSchoolDistrict, area.highSchoolNote)}</td>
        </tr>`;
  }
  /**
   * 高校学区の表示HTMLを作成
   */
  private static createDistrictHTML(district: string, note?: string): string {
    let html = '';
    switch (district) {
      case '第４学区':
        html = '第<span class="district-4">４</span>学区';
        break;
      case '第５学区':
        html = '第<span class="district-5">５</span>学区';
        break;
      case '第６学区':
        html = '第<span class="district-6">６</span>学区';
        break;
      default:
        html = this.escapeHtml(district);
    }

    if (note) {
      html += `<div class="high-school-note">${this.escapeHtml(note)}</div>`;
    }
    return html;
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
import { townReadings, wardReadings, schoolReadings } from './readings';

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
    const hiraganaQuery = this.toHiragana(normalizedQuery);

    return items
      .map((item) => {
        const text = getSearchText(item);
        const reading = townReadings[text] || wardReadings[text] || schoolReadings[text] || '';
        const normalizedText = text.toLowerCase();
        const normalizedReading = reading.toLowerCase();

        let score = 0;
        // スコアリング
        if (
          normalizedText === normalizedQuery ||
          normalizedReading === hiraganaQuery ||
          normalizedReading === normalizedQuery
        ) {
          score = 100; // 完全一致
        } else if (normalizedText.startsWith(normalizedQuery)) {
          score = 80; // 名称が前方一致
        } else if (
          normalizedReading.startsWith(hiraganaQuery) ||
          normalizedReading.startsWith(normalizedQuery)
        ) {
          score = 70; // 読みが前方一致
        } else if (normalizedText.includes(normalizedQuery)) {
          score = 50; // 名称が部分一致
        } else if (
          normalizedReading.includes(hiraganaQuery) ||
          normalizedReading.includes(normalizedQuery)
        ) {
          score = 40; // 読みが部分一致
        }

        return { item, score, text, reading };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        // 1. スコアが高い順
        if (b.score !== a.score) return b.score - a.score;
        // 2. 文字数が短い順（例：原田より原を優先）
        if (a.text.length !== b.text.length) return a.text.length - b.text.length;
        // 3. 読みのあいうえお順
        return a.reading.localeCompare(b.reading, 'ja');
      })
      .map((entry) => entry.item)
      .slice(0, APP_CONFIG.maxSuggestions);
  }

  /**
   * カタカナをひらがなに変換
   */
  private static toHiragana(str: string): string {
    return str.replace(/[ァ-ン]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0x60);
    });
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
