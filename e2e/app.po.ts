import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getFirstMessage() {
    return element(by.css('app-root ul li')).getText();
  }
}
