import type { TownSuggestion, SchoolSuggestion } from '../types';
import { StateManager } from '../state';
import { SearchUtils, NavigationUtils } from '../utils';
import { DisplayManager } from './displayManager';

abstract class BaseSuggestionsManager<T> {
  constructor(protected appState: StateManager) {}

  protected abstract getElements(): { input: HTMLInputElement; container: HTMLElement };
  protected abstract getSelectedIndex(): number;
  protected abstract setSelectedIndex(index: number): void;

  abstract filter(query: string): T[];
  abstract createSuggestionHTML(suggestion: T, index: number): string;
  abstract selectSuggestion(suggestion: T): void | Promise<void>;

  show(suggestions: T[]): void {
    const { container } = this.getElements();
    container.innerHTML = '';

    if (suggestions.length === 0) {
      container.style.display = 'none';
      return;
    }

    suggestions.forEach((suggestion, index) => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = this.createSuggestionHTML(suggestion, index);

      if (index === this.getSelectedIndex()) {
        div.classList.add('selected');
      }

      div.addEventListener('click', () => {
        this.selectSuggestion(suggestion);
      });

      container.appendChild(div);
    });

    container.style.display = 'block';
  }

  hide(): void {
    const { container } = this.getElements();
    container.style.display = 'none';
    this.setSelectedIndex(-1);
  }

  updateSelection(): void {
    const { container } = this.getElements();
    const suggestions = container.children;
    Array.from(suggestions).forEach((suggestion, index) => {
      suggestion.classList.toggle('selected', index === this.getSelectedIndex());
    });
  }

  handleKeyDown(event: KeyboardEvent, suggestions: T[]): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.setSelectedIndex(Math.min(this.getSelectedIndex() + 1, suggestions.length - 1));
      this.updateSelection();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.setSelectedIndex(Math.max(this.getSelectedIndex() - 1, -1));
      this.updateSelection();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.getSelectedIndex() >= 0 && suggestions[this.getSelectedIndex()]) {
        this.selectSuggestion(suggestions[this.getSelectedIndex()]);
      } else if (suggestions.length > 0) {
        this.selectSuggestion(suggestions[0]);
      } else {
        this.getElements().input.value = '';
        this.hide();
      }
    } else if (event.key === 'Escape') {
      this.hide();
      this.getElements().input.blur();
    }
  }
}

export class TownSuggestionsManager extends BaseSuggestionsManager<TownSuggestion> {
  protected getElements() {
    const elements = this.appState.getElements();
    return {
      input: elements.addressText,
      container: elements.suggestionsDiv,
    };
  }

  protected getSelectedIndex(): number {
    return this.appState.getTownSuggestionIndex();
  }

  protected setSelectedIndex(index: number): void {
    this.appState.setTownSuggestionIndex(index);
  }

  filter(query: string): TownSuggestion[] {
    return SearchUtils.filterItems(this.appState.getTowns(), query, (item) => item.town);
  }

  createSuggestionHTML(suggestion: TownSuggestion): string {
    return `${suggestion.town}<span class="suggestion-ward">${suggestion.ward}</span>`;
  }

  async selectSuggestion(suggestion: TownSuggestion): Promise<void> {
    const elements = this.appState.getElements();
    elements.addressText.value = '';
    this.hide();
    await NavigationUtils.setFormValues(
      elements.wardSelect,
      elements.townSelect,
      suggestion.ward,
      suggestion.town
    );
  }

  handleInput(): void {
    const elements = this.appState.getElements();
    const query = elements.addressText.value;
    const suggestions = this.filter(query);
    this.show(suggestions);
    this.appState.setTownSuggestionIndex(-1);

    if (query.trim()) {
      DisplayManager.resetSelections(this.appState);
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    const elements = this.appState.getElements();
    const suggestions = this.filter(elements.addressText.value);
    super.handleKeyDown(event, suggestions);
  }
}

export class SchoolSuggestionsManager extends BaseSuggestionsManager<SchoolSuggestion> {
  protected getElements() {
    const elements = this.appState.getElements();
    return {
      input: elements.schoolSearchText,
      container: elements.schoolSuggestionsDiv,
    };
  }

  protected getSelectedIndex(): number {
    return this.appState.getSchoolSuggestionIndex();
  }

  protected setSelectedIndex(index: number): void {
    this.appState.setSchoolSuggestionIndex(index);
  }

  filter(query: string): SchoolSuggestion[] {
    return SearchUtils.filterItems(this.appState.getSchools(), query, (item) => item.name);
  }

  createSuggestionHTML(suggestion: SchoolSuggestion): string {
    const typeLabel = suggestion.type === 'elementary' ? '小学校' : '中学校';
    return `${suggestion.name} <span class="school-type">(${typeLabel})</span>`;
  }

  async selectSuggestion(suggestion: SchoolSuggestion): Promise<void> {
    this.hide();
    const { SchoolSearchManager } = await import('./schoolSearchManager');
    SchoolSearchManager.performSearch(this.appState, suggestion.name);
    this.appState.getElements().schoolSearchText.value = '';
  }

  handleInput(): void {
    const elements = this.appState.getElements();
    const query = elements.schoolSearchText.value;
    const suggestions = this.filter(query);
    this.show(suggestions);
    this.appState.setSchoolSuggestionIndex(-1);

    if (query.trim()) {
      elements.schoolResultsSection.style.display = 'none';
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    const elements = this.appState.getElements();
    const suggestions = this.filter(elements.schoolSearchText.value);
    super.handleKeyDown(event, suggestions);
  }
}
