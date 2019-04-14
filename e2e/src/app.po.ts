import { browser, by, element } from 'protractor';
import { StringMap } from '@angular/core/src/render3/jit/compiler_facade_interface';

export class AppPage {
  navigateTo(link: string) {
    return browser.get(link);
  }

  getParagraphText(selector: string) {
    return element(by.css(selector)).getText();
  }

  getElement(selector: string){
    return element(by.css(selector));
  }

  getAllElements(selector: string){
    return element.all(by.css(selector));
  }
}
