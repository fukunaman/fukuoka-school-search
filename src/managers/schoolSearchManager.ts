import { searchSchoolAreas } from '../data';
import { DOMUtils, NavigationUtils } from '../utils';
import { StateManager } from '../state';
import { TownAreaManager } from './displayManager';

export class SchoolSearchManager {
  static performSearch(appState: StateManager, schoolName: string): void {
    const elements = appState.getElements();
    const areas = searchSchoolAreas(schoolName);

    if (areas.length === 0) {
      elements.schoolAreaList.innerHTML =
        '<p class="no-results">該当する住所が見つかりませんでした。</p>';
      elements.schoolResultsSection.style.display = 'block';
      return;
    }

    const html = DOMUtils.createAreaTableHTML(areas, `「${schoolName}」の一覧`, {
      townClickable: true,
    });
    elements.schoolAreaList.innerHTML = html;
    elements.schoolResultsSection.style.display = 'block';

    this.addClickHandlers(appState, elements.schoolAreaList);
  }

  static handleSchoolClick(appState: StateManager, schoolName: string): void {
    this.performSearch(appState, schoolName);
    const elements = appState.getElements();
    elements.schoolSearchText.value = '';

    const schoolSearchSection = document.querySelector('.school-search-section') as HTMLElement;
    if (schoolSearchSection) {
      NavigationUtils.scrollToElement(schoolSearchSection);
    }
  }

  private static addClickHandlers(appState: StateManager, container: HTMLElement): void {
    DOMUtils.addClickHandlers(container, '.town-link', (element) => {
      const ward = element.getAttribute('data-ward');
      const town = element.getAttribute('data-town');
      if (ward && town) {
        TownAreaManager.handleTownClick(appState, ward, town);
      }
    });

    DOMUtils.addClickHandlers(container, '.school-link', (element) => {
      const schoolName = element.getAttribute('data-school');
      if (schoolName) {
        this.handleSchoolClick(appState, schoolName);
      }
    });
  }
}
