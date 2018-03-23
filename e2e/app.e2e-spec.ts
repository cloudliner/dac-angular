import { AppPage } from './app.po';
import { browser } from 'protractor';

describe('dac-angular App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display first chat message', () => {
    page.navigateTo();
    browser.sleep(5000);
    expect(page.getFirstMessage()).toEqual('Hello, World!');
  });
});
