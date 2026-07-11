const path = require('path');
const express = require('express');
const request = require('supertest');
const { JSDOM } = require('jsdom');

// --- Mock Express Application Setup ---
const app = express();
app.set('view engine', 'ejs');
// Set the views directory assuming the test file is in __tests__/views/listings/
// and the actual views directory is at the project root level.
app.set('views', path.join(process.cwd(), 'views'));

// --- Mock Data ---
const mockListings = [
    {
        _id: '65e23c72b9a7c6f0e3f1a2b3',
        title: 'Cozy Beach House',
        price: 1200,
        image: { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c82b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max' },
        category: 'Beach'
    },
    {
        _id: '65e23c72b9a7c6f0e3f1a2b4',
        title: 'Mountain Retreat',
        price: 900,
        image: { url: 'https://images.unsplash.com/photo-1502672260265-d3c5f1c9c0b1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max' },
        category: 'Mountains'
    },
    {
      _id: '65e23c72b9a7c6f0e3f1a2b5',
      title: 'City Apartment',
      price: 1500,
      image: { url: 'https://images.unsplash.com/photo-1560518883-ffcd1f2f0b7e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max' },
      category: 'Iconic Cities'
    },
];

// Define a route that renders the EJS template
app.get('/listings', (req, res) => {
    res.render('listings/index', { allListings: mockListings });
});

// --- Supertest agent ---
const agent = request.agent(app);

// --- JSDOM Setup ---
let dom;
let document;
let window;

beforeAll(async () => {
    // Get the HTML output from the Express route using Supertest
    const res = await agent.get('/listings');
    const htmlString = res.text;

    // Load the HTML into JSDOM and enable script execution
    dom = new JSDOM(htmlString, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost' });
    document = dom.window.document;
    window = dom.window;

    // Wait for the DOMContentLoaded event to ensure all inline scripts are executed
    // The scripts in the EJS file are wrapped in DOMContentLoaded listener
    await new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        dom.window.addEventListener('load', resolve);
      }
    });

    // Manually dispatch DOMContentLoaded if not fired by JSDOM's 'load' to ensure event listeners are attached
    const event = new dom.window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true,
    });
    dom.window.document.dispatchEvent(event);

    // Give a small delay to allow any asynchronous script operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));
});

afterAll(() => {
    if (dom) {
        dom.window.close();
    }
});

// --- Test Suite 1: Server-Side Rendering (Supertest) ---
describe('GET /listings - Server-Side Rendering', () => {
    test('should render the listings page successfully with status 200', async () => {
        const res = await agent.get('/listings');
        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toContain('text/html');
    });

    test('should display all filter categories', async () => {
        const res = await agent.get('/listings');
        expect(res.text).toContain('<p>Trending</p>');
        expect(res.text).toContain('<p>Room</p>');
        expect(res.text).toContain('<p>Iconic Cities</p>');
        expect(res.text).toContain('<p>Mountains</p>');
        expect(res.text).toContain('<p>Beach</p>');
        expect(res.text).toContain('<p>Castels</p>');
        expect(res.text).toContain('<p>Amazing Pools</p>');
        expect(res.text).toContain('<p>Camping</p>');
        expect(res.text).toContain('<p>Farms</p>');
        expect(res.text).toContain('<p>Arctic</p>');
        expect(res.text).toContain('<p>boats</p>');
    });

    test('should display the tax toggle switch', async () => {
        const res = await agent.get('/listings');
        expect(res.text).toContain('id="flexSwitchCheckDefault"');
        expect(res.text).toContain('Display total after taxes');
    });

    test('should render the correct number of listing cards', async () => {
        const res = await agent.get('/listings');
        const listingCardsCount = (res.text.match(/<div class="card listing-card">/g) || []).length;
        expect(listingCardsCount).toBe(mockListings.length);
    });

    test('should display correct data for each listing', async () => {
        const res = await agent.get('/listings');
        for (const listing of mockListings) {
            expect(res.text).toContain(listing.title);
            // Adjust for random nights/dates if testing exact string, or test price separately
            expect(res.text).toContain(`₹ ${listing.price.toLocaleString("en-IN")} / night`);
            expect(res.text).toContain(`/listings/${listing._id}`);
            expect(res.text).toContain(`src="${listing.image.url}"`);
        }
    });

    test('should include tax info elements in the initial HTML structure', async () => {
        const res = await agent.get('/listings');
        expect(res.text).toContain('<i class="tax-info">&nbsp;+18% GST</i>');
    });
});

// --- Test Suite 2: Client-Side JavaScript Interactivity (Jest + JSDOM) ---
describe('Client-Side JavaScript Interactivity', () => {

    test('tax info should be initially hidden by CSS', () => {
        const taxInfoElements = document.querySelectorAll('.tax-info');
        taxInfoElements.forEach(info => {
            // The inline style `display: none;` is in the EJS <style> block
            // So, computed style should reflect this.
            expect(window.getComputedStyle(info).display).toBe('none');
        });
    });

    test('clicking tax switch should toggle tax info visibility', async () => {
        const taxSwitch = document.getElementById('flexSwitchCheckDefault');
        const taxInfoElements = document.querySelectorAll('.tax-info');

        // Click once - should show taxes
        taxSwitch.click();
        taxInfoElements.forEach(info => {
            expect(window.getComputedStyle(info).display).toBe('inline');
        });

        // Click again - should hide taxes
        taxSwitch.click();
        taxInfoElements.forEach(info => {
            expect(window.getComputedStyle(info).display).toBe('none');
        });
    });

    test('clicking a filter should add "selected-filter" class and remove it from others', () => {
        const filters = document.querySelectorAll('.filter');
        const trendingFilter = filters[0]; // Trending
        const roomFilter = filters[1];     // Room
        const mountainsFilter = filters[3]; // Mountains

        // Initially, no filter should be selected
        filters.forEach(filter => {
            expect(filter.classList.contains('selected-filter')).toBe(false);
        });

        // Click 'Trending' filter
        trendingFilter.click();
        expect(trendingFilter.classList.contains('selected-filter')).toBe(true);
        expect(roomFilter.classList.contains('selected-filter')).toBe(false);
        expect(mountainsFilter.classList.contains('selected-filter')).toBe(false);

        // Click 'Room' filter
        roomFilter.click();
        expect(trendingFilter.classList.contains('selected-filter')).toBe(false); // Trending should lose class
        expect(roomFilter.classList.contains('selected-filter')).toBe(true);      // Room should gain class
        expect(mountainsFilter.classList.contains('selected-filter')).toBe(false);

        // Click 'Mountains' filter
        mountainsFilter.click();
        expect(trendingFilter.classList.contains('selected-filter')).toBe(false);
        expect(roomFilter.classList.contains('selected-filter')).toBe(false);
        expect(mountainsFilter.classList.contains('selected-filter')).toBe(true);
    });
});