import { getTownList, getChomeList, searchSchool } from '../data';
import { DOMUtils } from '../utils';
import { PLACEHOLDER_TEXTS } from '../constants';
import { StateManager } from '../state';
import { DisplayManager, ResultsManager, ErrorManager, TownAreaManager } from './displayManager';

export class AddressSearchManager {
  constructor(private appState: StateManager) {}

  updateTownOptions(): void {
    const elements = this.appState.getElements();
    const selectedWard = elements.wardSelect.value;

    elements.townSelect.innerHTML = '';
    elements.chomeSelect.innerHTML = '';

    if (!selectedWard) {
      this.resetSelectOptions(elements.townSelect, PLACEHOLDER_TEXTS.selectTown);
      this.resetSelectOptions(elements.chomeSelect, PLACEHOLDER_TEXTS.selectChome);
      elements.townSelect.disabled = true;
      elements.chomeSelect.disabled = true;
      return;
    }

    const towns = getTownList(selectedWard);
    elements.townSelect.appendChild(
      DOMUtils.createSelectOptions(towns, PLACEHOLDER_TEXTS.selectTown)
    );
    elements.townSelect.disabled = false;
    elements.chomeSelect.disabled = true;
  }

  updateChomeOptions(): void {
    const elements = this.appState.getElements();
    const selectedWard = elements.wardSelect.value;
    const selectedTown = elements.townSelect.value;

    elements.chomeSelect.innerHTML = '';

    if (!selectedWard || !selectedTown) {
      this.resetSelectOptions(elements.chomeSelect, PLACEHOLDER_TEXTS.selectChome);
      elements.chomeSelect.disabled = true;
      return;
    }

    const chomes = getChomeList(selectedWard, selectedTown);
    const chomeOptions = chomes.map((chome) =>
      chome === '' ? PLACEHOLDER_TEXTS.townNameOnly : chome
    );
    const fragment = DOMUtils.createSelectOptions(chomeOptions, PLACEHOLDER_TEXTS.selectChome);

    Array.from(fragment.children).forEach((option, index) => {
      if (index > 0) {
        (option as HTMLOptionElement).value = chomes[index - 1];
      }
    });

    elements.chomeSelect.appendChild(fragment);
    elements.chomeSelect.disabled = false;
    elements.chomeSelect.selectedIndex = 1;

    setTimeout(() => {
      this.performSearch();
      TownAreaManager.show(this.appState, selectedWard, selectedTown);
    }, 100);
  }

  handleChomeSelection(): void {
    const elements = this.appState.getElements();
    const selectedWard = elements.wardSelect.value;
    const selectedTown = elements.townSelect.value;
    const selectedChome = elements.chomeSelect.value;

    if (selectedWard && selectedTown && selectedChome !== null && selectedChome !== '') {
      this.performSearch();
    } else {
      DisplayManager.hideAll(this.appState);
    }
  }

  performSearch(): void {
    const elements = this.appState.getElements();
    const selectedWard = elements.wardSelect.value;
    const selectedTown = elements.townSelect.value;
    const selectedChome = elements.chomeSelect.value;

    if (!selectedWard || !selectedTown) {
      ErrorManager.show(this.appState, '区と町名を選択してください。');
      return;
    }

    const result = searchSchool(selectedWard, selectedTown, selectedChome);

    if (result) {
      ResultsManager.show(this.appState, result);
    } else {
      const address = selectedChome ? `${selectedTown}${selectedChome}` : selectedTown;
      ErrorManager.show(
        this.appState,
        `「${selectedWard} ${address}」の学校情報が見つかりませんでした。`
      );
    }
  }

  private resetSelectOptions(selectElement: HTMLSelectElement, placeholder: string): void {
    selectElement.appendChild(DOMUtils.createSelectOptions([], placeholder));
  }
}
