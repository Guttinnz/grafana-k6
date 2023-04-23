import { chromium } from 'k6/experimental/browser';
import { check } from 'k6';

export const options = {
    vus: 3,
    duration: '5s',
    threshoulds: {
        checks: ["rate > 0.99"]
    }
}

export default async function () { //necessário async para testes web
    const browser = chromium.launch({headless: false}); //false = abre navegador e executa os testes
    const context = browser.newContext();
    const page = context.newPage();

    try {
        await page.goto('https://test.k6.io', { waitUntil: 'networkidle'}); //tempo que o navegador espera até que requisição seja realizada

        await Promise.all([
            page.waitForNavigation(),
            page.locator('a[href="/my_messages.php"]').click(),
        ])

        page.locator('input[name="login"]').type('admin')
        page.locator('input[name="password"]').type('123')

        await Promise.all([
            page.waitForNavigation(),
            page.locator('input[type="submit"]').click(),
        ])

        check(page, {
            'header': page.locator('h2').textContent() == 'Welcome, admin!',
        })

        // page.screenshot({path: 'screenshot.png'})
    } finally { //tratativa de uma excessão caso aconteça
        page.close();
        browser.close()
    }
}