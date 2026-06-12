import elements from '@webref/elements';
import idl from '@webref/idl';

// const { html } = await elements.listAll();
// console.log(html);
const wat = await idl.listAll();
console.log(Object.keys(wat).join());