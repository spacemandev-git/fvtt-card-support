import { mod_scope } from './constants.js';
Hooks.on("renderMacroDirectory", (macroDir, html, options) => {
    macroDir.entities = macroDir.entities.map(el => {
        var _a, _b;
        if (((_b = (_a = el.data.flags) === null || _a === void 0 ? void 0 : _a[mod_scope]) === null || _b === void 0 ? void 0 : _b.cardID) == undefined) {
            return el;
        }
    });
});
