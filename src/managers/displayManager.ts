import { SearchResult } from '../types';
import { DOMUtils, NavigationUtils, ErrorUtils } from '../utils';
import { PLACEHOLDER_TEXTS, APP_CONFIG } from '../constants';
import { StateManager } from '../state';
import { searchTownAreas } from '../data';

export class DisplayManager {
  static hideAll(appState: StateManager): void {
    ResultsManager.hide(appState);
    ErrorManager.hide(appState);
    TownAreaManager.hide(appState);
  }

  static resetSelections(appState: StateManager): void {
    const elements = appState.getElements();
    elements.wardSelect.value = '';
    elements.townSelect.innerHTML = `<option value="">${PLACEHOLDER_TEXTS.selectTown}</option>`;
    elements.townSelect.disabled = true;
    elements.chomeSelect.innerHTML = `<option value="">${PLACEHOLDER_TEXTS.selectChome}</option>`;
    elements.chomeSelect.disabled = true;
    this.hideAll(appState);
  }
}

export class ResultsManager {
  static show(appState: StateManager, result: SearchResult): void {
    const elements = appState.getElements();
    ErrorManager.hide(appState);

    elements.elementaryResult.innerHTML = DOMUtils.createSchoolCell(result.elementary);
    elements.middleResult.innerHTML = DOMUtils.createSchoolCell(result.middle);
    elements.highSchoolResult.textContent =
      result.highSchoolDistrict || APP_CONFIG.defaultHighSchoolDistrict;

    if (result.note) {
      elements.noteResult.textContent = result.note;
      elements.noteSection.style.display = 'block';
    } else {
      elements.noteSection.style.display = 'none';
    }

    elements.resultsSection.style.display = 'block';

    this.addSchoolClickHandlers(appState, elements.resultsSection);
  }

  static hide(appState: StateManager): void {
    const elements = appState.getElements();
    elements.resultsSection.style.display = 'none';
  }

  private static addSchoolClickHandlers(appState: StateManager, container: HTMLElement): void {
    DOMUtils.addClickHandlers(container, '.school-link', (element) => {
      const schoolName = element.getAttribute('data-school');
      if (schoolName) {
        import('./schoolSearchManager').then(({ SchoolSearchManager }) => {
          SchoolSearchManager.handleSchoolClick(appState, schoolName);
        });
      }
    });
  }
}

export class TownAreaManager {
  static show(appState: StateManager, ward: string, town: string): void {
    const elements = appState.getElements();
    const areas = searchTownAreas(ward, town);

    if (areas.length === 0) {
      this.hide(appState);
      return;
    }

    const html = DOMUtils.createAreaTableHTML(areas, `「${town}」の一覧`, { townClickable: false });
    elements.townAreaList.innerHTML = html;
    elements.townAreaResults.style.display = 'block';

    this.addClickHandlers(appState, elements.townAreaList);
  }

  static hide(appState: StateManager): void {
    const elements = appState.getElements();
    elements.townAreaResults.style.display = 'none';
  }

  static async handleTownClick(appState: StateManager, ward: string, town: string): Promise<void> {
    const elements = appState.getElements();

    this.hide(appState);

    await NavigationUtils.setFormValues(elements.wardSelect, elements.townSelect, ward, town);
    NavigationUtils.scrollToElement(elements.resultsSection);
  }

  private static addClickHandlers(appState: StateManager, container: HTMLElement): void {
    DOMUtils.addClickHandlers(container, '.school-link', (element) => {
      const schoolName = element.getAttribute('data-school');
      if (schoolName) {
        import('./schoolSearchManager').then(({ SchoolSearchManager }) => {
          SchoolSearchManager.handleSchoolClick(appState, schoolName);
        });
      }
    });
  }
}

export class ErrorManager {
  static show(appState: StateManager, message: string): void {
    const elements = appState.getElements();
    ResultsManager.hide(appState);
    ErrorUtils.showError(elements.errorMessage, message);
  }

  static hide(appState: StateManager): void {
    const elements = appState.getElements();
    ErrorUtils.hideError(elements.errorMessage);
  }
}
