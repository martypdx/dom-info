import { describe, test } from 'vitest';
import { htmlTagNames } from 'html-tag-names';
import { htmlElementAttributes } from 'html-element-attributes';
import { html, find /* TODO:, svg*/ } from 'property-information';
import { ariaAttributes } from 'aria-attributes';

// can be created, but no props exist
const removedElements = {
    applet: true,
    basefont: true,
    isindex: true,
};

const tags = htmlTagNames.filter(tag => !removedElements[tag]);
const tagsNoAttrs = tags.filter(tag => !htmlElementAttributes[tag]);
const tagsWithAttrs = tags.filter(tag => htmlElementAttributes[tag]);

const globalAttrs = htmlElementAttributes['*'];

test('no attribute tags', ({ expect }) => {
    expect(globalAttrs.length).toBeGreaterThan(0);
    expect(JSON.stringify(tagsNoAttrs, null, 4)).toMatchFileSnapshot('no-attr-tags.json');
});

describe.each(tagsWithAttrs)('%s', tag => {
    const el = document.createElement(tag);

    describe.each(htmlElementAttributes[tag])(`%s`, attr => {
        const info = find(html, attr);

        test('property info found', ({ expect }) => {
            expect(attr).toBeTypeOf('string');
            expect(attr.length).toBeGreaterThan(0);
            expect(info.defined).toBe(true);
        });

        const tableChar = ['char', 'charoff'];
        const removed = {
            // removed because deprecated
            thead: tableChar,
            tr: tableChar,
            th: tableChar,
            td: tableChar,
            tbody: tableChar,
            tfoot: tableChar,
            col: tableChar,
            colgroup: tableChar,
            form: ['accept'],
            area: ['type', 'hreflang'],
            head: ['profile'],
            html: ['manifest'],
            img: ['hspace', 'vspace'],
            input: ['ismap'],
            object: ['hspace', 'vspace', 'typemustmatch', 'classid'],
            // firefox has removed this, other browsers still have it
            details: ['name'],
            // legacy pre-implementation? believe this is covered by "allow"
            iframe: ['allowusermedia'],
            // not sure if this was ever an attr
            link: ['color'],
            // just bad data:
            template: ['shadowrootdelegatesfocus'],
        };

        // mostly firefox, safari
        const notYetImplemented = {
            // no "popovertarget" prop on chrome either
            button: ['popovertargetaction', 'popovertarget'],
            input: ['popovertargetaction', 'popovertarget'],
            iframe: ['loading', 'allowpaymentrequest', 'fetchpriority'],
            script: ['fetchpriority', 'blocking'],
            link: ['blocking', 'fetchpriority'],
            style: ['blocking'],
            img: ['fetchpriority'],
            // not in ff:
            video: ['playsinline'],
        };

        const attrOnly = {
            // prop exists, but no effect
            template: ['shadowrootmode'],
            // attr only, no DOM prop:
            script: ['language'],
            link: ['imagesrcset'],
            meta: ['charset'],
            track: ['srclang'],
        };

        const corrections = {
            allowfullscreen: 'allowFullscreen',
            autocomplete: 'autocomplete',
            autoplay: 'autoplay',
            charset: 'charset',
            enctype: 'enctype',
            formenctype: 'formEnctype',
            hreflang: 'hreflang',
            imagesrcset: 'imagesrcset',
            srcdoc: 'srcdoc',
            srcset: 'srcset',
        };

        test(info.property, ({ expect }) => {
            if(removed[tag]?.includes(attr)) return;
            if(attrOnly[tag]?.includes(attr)) return;
            if(notYetImplemented[tag]?.includes(attr)) return;
            const prop = el[corrections[attr] || info.property];
            expect(prop).not.toBe(undefined);
        });
    });
});

describe.each(tags)('%s', tag => {
    const el = document.createElement(tag);

    test('create', ({ expect }) => {
        expect(el).toBeDefined();
    });

    describe.each(globalAttrs)(`global %s`, attr => {
        const info = find(html, attr);

        test('property info lookup', ({ expect }) => {
            expect(attr).toBeTypeOf('string');
            expect(attr.length).toBeGreaterThan(0);
            expect(info.defined).toBe(true);
        });

        const corrections = {
            autocapitalize: 'autocapitalize',
            spellcheck: 'spellcheck',
        };

        const attrOnly = {
            is: true,
            autofocus: true,
            itemid: true,
            itemprop: true,
            itemref: true,
            itemscope: true,
            itemtype: true,
        };

        const notYetImplemented = {
            popover: true,
        };

        test(info.property, ({ expect }) => {
            if(attrOnly[attr] || notYetImplemented) return;
            const prop = el[corrections[attr] || info.property];
            expect(prop).not.toBe(undefined);
        });
    });

    describe.each(ariaAttributes)(`aria %s`, attr => {
        const info = find(html, attr);

        test('property info lookup', ({ expect }) => {
            expect(attr).toBeTypeOf('string');
            expect(attr.length).toBeGreaterThan(0);
            expect(info.defined).toBe(true);
        });

        const removed = {
            'aria-dropeffect': true,
        };

        const corrections = {
        };

        // these do not appear to have DOM props
        const attrOnly = {
            'aria-activedescendant': true,
            'aria-controls': true,
            'aria-describedby': true,
            'aria-details': true,
            'aria-errormessage': true,
            'aria-flowto': true,
            'aria-grabbed': true,
            'aria-labelledby': true,
            'aria-owns': true,
        };

        test(info.property, ({ expect }) => {
            if(removed[attr] || attrOnly[attr]) return;
            const prop = el[corrections[attr] || info.property];
            expect(prop).not.toBe(undefined);
        });
    });
});
