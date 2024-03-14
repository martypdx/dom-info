import { describe, test } from 'vitest';
import { htmlTagNames } from 'html-tag-names'
import { htmlElementAttributes } from 'html-element-attributes'
import { html, svg, find } from 'property-information'
import { ariaAttributes } from 'aria-attributes'

// maybe can be created, but no props exist
const removedElements = {
    applet: true,
    basefont: true,
    // bad data:
    isindex: true,
}

const tags = htmlTagNames.filter(tag => !removedElements[tag]);
const tagsNoAttrs = tags.filter(tag => !htmlElementAttributes[tag])
const tagsWithAttrs = tags.filter(tag => htmlElementAttributes[tag])

const globalAttrs = htmlElementAttributes['*'];

test('no attribute tags', ({ expect }) => {
    expect(globalAttrs.length).toBeGreaterThan(0);
    expect(JSON.stringify(tagsNoAttrs, null, 4)).toMatchFileSnapshot('no-attr-tags.json')
});

describe.each(tagsWithAttrs)('%s', tag => {
    const el = document.createElement(tag);

    describe.each(htmlElementAttributes[tag])(`%s`, attr => {
        const info = find(html, attr)

        test('property info found', ({ expect }) => {
            expect(attr).toBeTypeOf('string')
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
            col: tableChar,
            colgroup: tableChar,
            form: ['accept'],
            area: ['type'],
            head: ['profile'],
            html: ['manifest'],
            img: ['hspace', 'vspace'],
            input: ['ismap'],
            object: ['hspace', 'vspace', 'typemustmatch'],
            // firefox has removed this, other browsers still have it
            details: ['name'],
            // not sure if this was ever a attr
            link: ['color'],
            // bad data
            template: ['shadowrootdelegatesfocus'],
        }

        // firefox, safari
        const notYetImplemented = {
            button: ['popovertargetaction'],
            input: ['popovertargetaction'],
            iframe: ['loading', 'allowpaymentrequest', 'fetchpriority'],
            script: ['fetchpriority', 'blocking'],
            link: ['blocking', 'fetchpriority'],
            style: ['blocking'],
            img: ['fetchpriority'],
        }

        const attrOnly = {
            // prop exists, but no effect
            template: ['shadowrootmode'],
            // language is attr only, no DOM prop
            script: ['language'],
        }

        const corrections = {
            allowfullscreen: 'allowFullscreen',
            allowusermedia: 'allowUsermedia',
            autoplay: 'autoplay',
            playsinline: 'playsinline',
            charset: 'charset',
            classid: 'classid',
            srcdoc: 'srcdoc',
            srcset: 'srcset',
            hreflang: 'hreflang',
            srclang: 'hreflang',
            enctype: 'enctype',
            autocomplete: 'autocomplete',
            formenctype: 'formenctype',
            popovertarget: 'popovertarget',
            imagesrcset: 'imagesrcset',
        }

        test(info.property, ({ expect }) => {
            if(removed[tag]?.includes(attr)) return;
            if(attrOnly[tag]?.includes(attr)) return;
            if(notYetImplemented[tag]?.includes(attr)) return;
            const prop = corrections[attr] || el[info.property];
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
            expect(attr).toBeTypeOf('string')
            expect(attr.length).toBeGreaterThan(0);
            expect(info.defined).toBe(true);
        });

        const corrections = {
            autocapitalize: 'autocapitalize',
            spellcheck: 'spellcheck',
            itemid: 'itemid',
            itemprop: 'itemprop',
            itemref: 'itemref',
            itemscope: 'itemscope',
            itemtype: 'itemtype',
        }

        const attrOnly = {
            is: true,
            autofocus: true,
        }

        const notYetImplemented = {
            popover: true,
        }

        test(info.property, ({ expect }) => {
            if(attrOnly[attr] || notYetImplemented) return;
            const prop = corrections[attr] || el[info.property];
            expect(prop).not.toBe(undefined);
        });
    })

    describe.each(ariaAttributes)(`global %s`, attr => {
        const info = find(html, attr);

        test('property info lookup', ({ expect }) => {
            expect(attr).toBeTypeOf('string')
            expect(attr.length).toBeGreaterThan(0);
            expect(info.defined).toBe(true);
        });

        test(info.property, ({ expect }) => {
            if(attrOnly[attr] || notYetImplemented) return;
            const prop = corrections[attr] || el[info.property];
            expect(prop).not.toBe(undefined);
        });
    })
});
